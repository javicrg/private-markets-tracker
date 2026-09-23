import mysql, { Pool, RowDataPacket } from 'mysql2/promise';
import { Customer } from '@/app/lib/definitions';
import { ddmmyyyy } from '@/app/lib/helpers';

let pool: Pool | undefined;

function getPool() {
  if (pool) {
    return pool;
  }

  if (process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DATABASE_URL);

    return pool;
  }

  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const database = process.env.DB_NAME;

  if (!host || !user || !database) {
    throw new Error(
      'Missing database configuration. Set DATABASE_URL or DB_HOST, DB_USER and DB_NAME.'
    );
  }

  pool = mysql.createPool({
    host,
    user,
    database,
    port: Number(process.env.DB_PORT || 3306),
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export default getPool;

const CUSTOMERS_PER_PAGE = 6;

export async function getCustomersList(codigo: string, page: number) {
  const offset = (page - 1) * CUSTOMERS_PER_PAGE;
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query(
    `
      SELECT codigo
      FROM customers
      WHERE codigo LIKE ?
      LIMIT ?
      OFFSET ?
    `,
    [`%${codigo}%`, CUSTOMERS_PER_PAGE, offset]
  );
  return rows as Customer[];
}

const PRODUCTS_PER_PAGE = 6;

export async function getProductList(product: string, page: number) {
  const offset = (page - 1) * PRODUCTS_PER_PAGE;
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query(
    `
      SELECT name, label
      FROM products
      WHERE label LIKE ?
      LIMIT ?
      OFFSET ?
    `,
    [`%${product}%`, PRODUCTS_PER_PAGE, offset]
  );
  return rows as Product[];
}

export async function getCustomerPages(codigo: string) {
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query(
    `
      SELECT COUNT(*)
      FROM customers
      WHERE codigo LIKE ?
    `,
    [`%${codigo}%`]
  );
  const totalCustomers = (rows as RowDataPacket[])[0]['COUNT(*)'];
  return Math.ceil(totalCustomers / CUSTOMERS_PER_PAGE);
}

export async function getProductPages(product: string) {
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query(
    `
      SELECT COUNT(*)
      FROM products
      WHERE label LIKE ?
    `,
    [`%${product}%`]
  );
  const totalProducts = (rows as RowDataPacket[])[0]['COUNT(*)'];
  return Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
}

export async function getComboboxParseProducts() {
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query<RowDataPacket[]>(
    'SELECT name, label FROM products'
  );

  const products = rows.map((row: any) => ({
    label: row.label,
    value: row.name,
  }));

  return products;
}

export async function getCustomerByCode(code: string) {
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query<RowDataPacket[]>(
    'SELECT codigo, products FROM customers WHERE codigo = ? LIMIT 1',
    [code]
  );

  if (!rows.length) {
    return null;
  }

  return {
    codigo: rows[0].codigo as string,
    products: JSON.parse((rows[0].products as string) || '[]') as CustomerProduct[],
  };
}

export async function getProductByName(name: string) {
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query<RowDataPacket[]>(
    `SELECT name, label, capitalCalls, distributions
     FROM products
     WHERE name = ?
     LIMIT 1`,
    [name]
  );

  if (!rows.length) {
    return null;
  }

  return {
    name: rows[0].name as string,
    label: rows[0].label as string,
    capitalCalls: JSON.parse((rows[0].capitalCalls as string) || '[]') as CapitalCall[],
    distributions: JSON.parse((rows[0].distributions as string) || '[]') as Distribution[],
    patrimonyGrowthStartYear:
      rows[0].patrimonyGrowthStartYear === null ||
      rows[0].patrimonyGrowthStartYear === undefined
        ? undefined
        : Number(rows[0].patrimonyGrowthStartYear),
    patrimonyGrowthEndYear:
      rows[0].patrimonyGrowthEndYear === null ||
      rows[0].patrimonyGrowthEndYear === undefined
        ? undefined
        : Number(rows[0].patrimonyGrowthEndYear),
    patrimonyGrowthYears:
      rows[0].patrimonyGrowthYears === null ||
      rows[0].patrimonyGrowthYears === undefined
        ? undefined
        : Number(rows[0].patrimonyGrowthYears),
  };
}

export async function getDashboardMetrics() {
  const connectionResolved = getPool();
  const [customerRows] = await connectionResolved.query<RowDataPacket[]>(
    'SELECT codigo, products FROM customers'
  );
  const [productRows] = await connectionResolved.query<RowDataPacket[]>(
    'SELECT name, label, capitalCalls, distributions FROM products'
  );

  const customers = customerRows.map((row) => ({
    codigo: row.codigo as string,
    products: JSON.parse((row.products as string) || '[]') as CustomerProduct[],
  }));

  const products = productRows.map((row) => ({
    name: row.name as string,
    label: row.label as string,
    capitalCalls: JSON.parse((row.capitalCalls as string) || '[]') as CapitalCall[],
    distributions: JSON.parse((row.distributions as string) || '[]') as Distribution[],
    patrimonyGrowthStartYear:
      row.patrimonyGrowthStartYear === null ||
      row.patrimonyGrowthStartYear === undefined
        ? undefined
        : Number(row.patrimonyGrowthStartYear),
    patrimonyGrowthEndYear:
      row.patrimonyGrowthEndYear === null ||
      row.patrimonyGrowthEndYear === undefined
        ? undefined
        : Number(row.patrimonyGrowthEndYear),
    patrimonyGrowthYears:
      row.patrimonyGrowthYears === null || row.patrimonyGrowthYears === undefined
        ? undefined
        : Number(row.patrimonyGrowthYears),
  }));

  const allPositions = customers.flatMap((customer) => customer.products);
  const totalCommitment = allPositions.reduce(
    (sum, product) => sum + product.compromiso,
    0
  );
  const uniqueAssignedProducts = new Set(allPositions.map((product) => product.name));
  const avgCommitmentPerCustomer = customers.length
    ? totalCommitment / customers.length
    : 0;

  const buyTypeMap = new Map<string, number>([
    ['emision', 0],
    ['ampliacion', 0],
    ['secundario', 0],
  ]);

  allPositions.forEach((position) => {
    buyTypeMap.set(
      position.buyType,
      (buyTypeMap.get(position.buyType) || 0) + 1
    );
  });

  const buyTypeDistribution = Array.from(buyTypeMap.entries()).map(
    ([buyType, value]) => ({
      buyType,
      label:
        buyType === 'emision'
          ? 'Emision'
          : buyType === 'ampliacion'
            ? 'Ampliacion'
            : 'Secundario',
      value,
    })
  );

  const productExposureMap = new Map<
    string,
    { label: string; commitment: number; positions: number; customers: Set<string> }
  >();

  customers.forEach((customer) => {
    customer.products.forEach((product) => {
      const current = productExposureMap.get(product.name) || {
        label: product.name,
        commitment: 0,
        positions: 0,
        customers: new Set<string>(),
      };

      const label =
        products.find((currentProduct) => currentProduct.name === product.name)
          ?.label || current.label;

      current.label = label;
      current.commitment += product.compromiso;
      current.positions += 1;
      current.customers.add(customer.codigo);
      productExposureMap.set(product.name, current);
    });
  });

  const topProductsByCommitment = Array.from(productExposureMap.values())
    .map((product) => ({
      label: product.label,
      commitment: product.commitment,
      positions: product.positions,
      customers: product.customers.size,
    }))
    .sort((a, b) => b.commitment - a.commitment)
    .slice(0, 6);

  const yearlyActivityMap = new Map<
    string,
    {
      year: string;
      capitalCallEvents: number;
      distributionEvents: number;
      capitalCallPct: number;
      distributionPct: number;
    }
  >();

  const nextTwelveMonths = new Date();
  nextTwelveMonths.setFullYear(nextTwelveMonths.getFullYear() + 1);
  const today = new Date();
  let upcomingEvents = 0;

  products.forEach((product) => {
    product.capitalCalls.forEach((entry) => {
      const year = entry.date.split('-')[0];
      const current = yearlyActivityMap.get(year) || {
        year,
        capitalCallEvents: 0,
        distributionEvents: 0,
        capitalCallPct: 0,
        distributionPct: 0,
      };
      current.capitalCallEvents += 1;
      current.capitalCallPct += entry.percentage;
      yearlyActivityMap.set(year, current);

      const date = new Date(entry.date);
      if (date >= today && date <= nextTwelveMonths) {
        upcomingEvents += 1;
      }
    });

    product.distributions.forEach((entry) => {
      const year = entry.date.split('-')[0];
      const current = yearlyActivityMap.get(year) || {
        year,
        capitalCallEvents: 0,
        distributionEvents: 0,
        capitalCallPct: 0,
        distributionPct: 0,
      };
      current.distributionEvents += 1;
      current.distributionPct += entry.percentage;
      yearlyActivityMap.set(year, current);

      const date = new Date(entry.date);
      if (date >= today && date <= nextTwelveMonths) {
        upcomingEvents += 1;
      }
    });
  });

  const yearlyActivity = Array.from(yearlyActivityMap.values()).sort((a, b) =>
    a.year.localeCompare(b.year)
  );

  return {
    totals: {
      customers: customers.length,
      products: products.length,
      assignedProducts: uniqueAssignedProducts.size,
      positions: allPositions.length,
      totalCommitment,
      avgCommitmentPerCustomer,
      upcomingEvents,
    },
    buyTypeDistribution,
    topProductsByCommitment,
    yearlyActivity,
  };
}

type CapitalCall = {
  type: string;
  date: string;
  percentage: number;
};

type Distribution = {
  type: string;
  date: string;
  percentage: number;
};

type Product = {
  name: string;
  label: string;
  capitalCalls: CapitalCall[];
  distributions: Distribution[];
  patrimonyGrowthStartYear?: number;
  patrimonyGrowthEndYear?: number;
  patrimonyGrowthYears?: number;
};

type CustomerProduct = {
  id: string;
  name: string;
  compromiso: number;
  entryDate: string;
  buyType: 'emision' | 'ampliacion' | 'secundario';
  valorCompra?: number;
};

type ReportRow = (string | number)[];

type Report = {
  data: ReportRow[];
  meta: {
    name: string;
    compromiso: number;
    entryDate: string;
  };
};

type NumericYearMap = Record<number, number>;

type PatrimonyEvolutionParams = {
  years: number[];
  capitalCallEuroByYear: NumericYearMap;
  distributionEuroByYear: NumericYearMap;
  accumulatedNetFlowByYear: NumericYearMap;
  patrimonyGrowthStartYear?: number;
  patrimonyGrowthEndYear?: number;
  patrimonyGrowthYears?: number;
};

const EPSILON = 0.000001;

function getLastAvailableAccumulatedNetFlow(
  years: number[],
  accumulatedNetFlowByYear: NumericYearMap
): number {
  for (let index = years.length - 1; index >= 0; index -= 1) {
    const value = accumulatedNetFlowByYear[years[index]];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
}

function resolvePatrimonyGrowthPeriod({
  years,
  distributionEuroByYear,
  patrimonyGrowthStartYear,
  patrimonyGrowthEndYear,
  patrimonyGrowthYears,
}: {
  years: number[];
  distributionEuroByYear: NumericYearMap;
  patrimonyGrowthStartYear?: number;
  patrimonyGrowthEndYear?: number;
  patrimonyGrowthYears?: number;
}): {
  firstGrowthYear: number | null;
  lastGrowthYear: number | null;
  growthYears: number;
} {
  if (patrimonyGrowthStartYear && patrimonyGrowthYears) {
    return {
      firstGrowthYear: patrimonyGrowthStartYear,
      lastGrowthYear: patrimonyGrowthStartYear + patrimonyGrowthYears - 1,
      growthYears: patrimonyGrowthYears,
    };
  }

  if (patrimonyGrowthStartYear && patrimonyGrowthEndYear) {
    return {
      firstGrowthYear: patrimonyGrowthStartYear,
      lastGrowthYear: patrimonyGrowthEndYear,
      growthYears: patrimonyGrowthEndYear - patrimonyGrowthStartYear + 1,
    };
  }

  const distributionYears = years.filter(
    (year) => Math.abs(distributionEuroByYear[year] ?? 0) > EPSILON
  );

  if (!distributionYears.length) {
    return {
      firstGrowthYear: null,
      lastGrowthYear: null,
      growthYears: 0,
    };
  }

  // TODO: This fallback will not perfectly match every workbook because some
  // funds use product-specific patrimony growth periods that cannot be inferred
  // reliably from cash flows alone.
  return {
    firstGrowthYear: distributionYears[0],
    lastGrowthYear: distributionYears[distributionYears.length - 1],
    growthYears:
      distributionYears[distributionYears.length - 1] - distributionYears[0] + 1,
  };
}

function calculatePatrimonyEvolution({
  years,
  capitalCallEuroByYear,
  distributionEuroByYear,
  accumulatedNetFlowByYear,
  patrimonyGrowthStartYear,
  patrimonyGrowthEndYear,
  patrimonyGrowthYears,
}: PatrimonyEvolutionParams): NumericYearMap {
  const finalAccumulatedNetFlow = getLastAvailableAccumulatedNetFlow(
    years,
    accumulatedNetFlowByYear
  );
  const growthPeriod = resolvePatrimonyGrowthPeriod({
    years,
    distributionEuroByYear,
    patrimonyGrowthStartYear,
    patrimonyGrowthEndYear,
    patrimonyGrowthYears,
  });
  const annualPatrimonyIncrease =
    growthPeriod.growthYears > 0
      ? finalAccumulatedNetFlow / growthPeriod.growthYears
      : 0;

  let patrimony = 0;
  const patrimonyByYear: NumericYearMap = {};

  for (const year of years) {
    const capitalCallAbs = Math.abs(capitalCallEuroByYear[year] ?? 0);

    if (!growthPeriod.firstGrowthYear || !growthPeriod.lastGrowthYear) {
      patrimony += capitalCallAbs;
    } else if (year < growthPeriod.firstGrowthYear) {
      patrimony += capitalCallAbs;
    } else if (year <= growthPeriod.lastGrowthYear) {
      patrimony += capitalCallAbs + annualPatrimonyIncrease;
    }

    patrimonyByYear[year] = patrimony;
  }

  return patrimonyByYear;
}

function getYearsRange(product: Product, entryDate?: string): string[] {
  if (
    !product ||
    !Array.isArray(product.capitalCalls) ||
    !Array.isArray(product.distributions)
  ) {
    throw new Error('Invalid product data');
  }

  let minYear = Infinity;
  let maxYear = -Infinity;
  const entryDateTimestamp = entryDate ? new Date(entryDate).getTime() : null;

  const shouldIncludeDate = (date: string) => {
    if (!entryDateTimestamp) {
      return true;
    }

    return new Date(date).getTime() >= entryDateTimestamp;
  };

  product.capitalCalls.forEach((call) => {
    if (!shouldIncludeDate(call.date)) {
      return;
    }
    const year = parseInt(call.date.split('-')[0]);
    if (year < minYear) minYear = year;
    if (year > maxYear) maxYear = year;
  });

  product.distributions.forEach((distribution) => {
    if (!shouldIncludeDate(distribution.date)) {
      return;
    }
    const year = parseInt(distribution.date.split('-')[0]);
    if (year < minYear) minYear = year;
    if (year > maxYear) maxYear = year;
  });

  if (minYear === Infinity || maxYear === -Infinity) {
    if (entryDate) {
      return [entryDate.split('-')[0]];
    }
    throw new Error('No valid years found in product data');
  }

  const years: string[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    years.push(year.toString());
  }
  return years;
}

function getPatrimonyGrowthEndYear(product: Product): number | null {
  if (product.patrimonyGrowthEndYear) {
    return product.patrimonyGrowthEndYear;
  }

  if (product.patrimonyGrowthStartYear && product.patrimonyGrowthYears) {
    return product.patrimonyGrowthStartYear + product.patrimonyGrowthYears - 1;
  }

  return null;
}

function buildYearRange(startYear: number, endYear: number): string[] {
  const years: string[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    years.push(year.toString());
  }

  return years;
}

function getGlobalReportYears(
  productInfo: Product[],
  customerProducts: CustomerProduct[]
): string[] {
  const relevantYears = customerProducts.flatMap((customerProduct) => {
    const product = productInfo.find(
      (currentProduct) => currentProduct.name === customerProduct.name
    );

    if (!product) {
      return [];
    }

    const shouldFilterByEntryDate =
      customerProduct.buyType !== 'emision' && Boolean(customerProduct.entryDate);
    const productYears = getYearsRange(
      product,
      shouldFilterByEntryDate ? customerProduct.entryDate : undefined
    ).map((year) => parseInt(year, 10));
    const patrimonyGrowthEndYear = getPatrimonyGrowthEndYear(product);
    const entryYear = customerProduct.entryDate
      ? parseInt(customerProduct.entryDate.split('-')[0], 10)
      : null;

    if (patrimonyGrowthEndYear !== null) {
      productYears.push(patrimonyGrowthEndYear);
    }

    if (entryYear !== null && Number.isFinite(entryYear)) {
      productYears.push(entryYear);
    }

    return productYears;
  });

  if (!relevantYears.length) {
    return [];
  }

  const globalStartYear = Math.min(...relevantYears);
  const globalEndYear = Math.max(...relevantYears);

  return buildYearRange(globalStartYear, globalEndYear);
}

function generateReportForProduct(
  product: Product,
  customerProduct: CustomerProduct,
  reportYears?: string[]
): Report {
  const shouldFilterByEntryDate =
    customerProduct.buyType !== 'emision' && Boolean(customerProduct.entryDate);
  const years =
    reportYears ??
    getYearsRange(
      product,
      shouldFilterByEntryDate ? customerProduct.entryDate : undefined
    );
  let report: ReportRow[] = [
    ['', ...years, 'TOTAL'], // Add 'TOTAL' column header
    ['Capital Call (%)'],
    ['Capital Call (€)'],
    ['Distribución (%)'],
    ['Distribución (€)'],
    ['Evolución del Patrimonio'],
    ['Flujo neto anual'],
    ['Flujo neto acumulado'],
  ];

  // Initialize yearly data
  years.forEach((year, index) => {
    report[1][index + 1] = 0; // Capital Call (%)
    report[2][index + 1] = 0; // Capital Call (€)
    report[3][index + 1] = 0; // Distribución (%)
    report[4][index + 1] = 0; // Distribución (€)
    report[5][index + 1] = 0; // Evolución del Patrimonio
    report[6][index + 1] = 0; // Flujo neto anual
    report[7][index + 1] = 0; // Flujo neto acumulado
  });

  const compromiso = customerProduct.compromiso;

  product.capitalCalls.forEach((call) => {
    if (
      shouldFilterByEntryDate &&
      new Date(call.date).getTime() <
        new Date(customerProduct.entryDate).getTime()
    ) {
      return;
    }

    const year = call.date.split('-')[0];
    const yearIndex = years.indexOf(year);
    if (yearIndex !== -1) {
      report[1][yearIndex + 1] =
        (report[1][yearIndex + 1] as number) + call.percentage;
      report[2][yearIndex + 1] =
        (report[2][yearIndex + 1] as number) +
        (call.percentage / 100) * compromiso;
    }
  });

  product.distributions.forEach((distribution) => {
    if (
      shouldFilterByEntryDate &&
      new Date(distribution.date).getTime() <
        new Date(customerProduct.entryDate).getTime()
    ) {
      return;
    }

    const year = distribution.date.split('-')[0];
    const yearIndex = years.indexOf(year);
    if (yearIndex !== -1) {
      report[3][yearIndex + 1] =
        (report[3][yearIndex + 1] as number) + distribution.percentage;
      report[4][yearIndex + 1] =
        (report[4][yearIndex + 1] as number) +
        (distribution.percentage / 100) * compromiso;
    }
  });

  // Calculate Evolución del Patrimonio, Flujo neto anual and Flujo neto acumulado
  for (let i = 1; i < report[0].length - 1; i++) {
    // Exclude 'TOTAL' column
    const capitalCallEuro = report[2][i] as number;
    const distributionEuro = report[4][i] as number;
    const lastFlujoNetoAcumulado = i > 1 ? (report[7][i - 1] as number) : 0;

    const flujoNetoAnual = distributionEuro - capitalCallEuro;
    const flujoNetoAcumulado = lastFlujoNetoAcumulado + flujoNetoAnual;

    report[6][i] = flujoNetoAnual;
    report[7][i] = flujoNetoAcumulado;
  }

  const yearNumbers = years.map((year) => parseInt(year, 10));
  const capitalCallEuroByYear: NumericYearMap = {};
  const distributionEuroByYear: NumericYearMap = {};
  const accumulatedNetFlowByYear: NumericYearMap = {};

  yearNumbers.forEach((year, index) => {
    capitalCallEuroByYear[year] = (report[2][index + 1] as number) || 0;
    distributionEuroByYear[year] = (report[4][index + 1] as number) || 0;
    accumulatedNetFlowByYear[year] = (report[7][index + 1] as number) || 0;
  });

  const patrimonyByYear = calculatePatrimonyEvolution({
    years: yearNumbers,
    capitalCallEuroByYear,
    distributionEuroByYear,
    accumulatedNetFlowByYear,
    patrimonyGrowthStartYear: product.patrimonyGrowthStartYear,
    patrimonyGrowthEndYear: product.patrimonyGrowthEndYear,
    patrimonyGrowthYears: product.patrimonyGrowthYears,
  });

  yearNumbers.forEach((year, index) => {
    report[5][index + 1] = patrimonyByYear[year] ?? 0;
  });

  // Calculate the TOTAL column
  for (let rowIndex = 1; rowIndex < report.length; rowIndex++) {
    if (rowIndex === 5 || rowIndex === 6 || rowIndex === 7) {
      report[rowIndex].push();
    } else {
      const total = (report[rowIndex] as (number | string)[])
        .slice(1) // Start from index 1 to include all columns
        .map((value) =>
          typeof value === 'number' ? value : parseFloat(value as string)
        )
        .reduce((sum, value) => sum + (isNaN(value) ? 0 : value), 0);
      report[rowIndex].push(total);
    }
  }

  return {
    data: report,
    meta: {
      name: product.label,
      compromiso: customerProduct.compromiso,
      entryDate: ddmmyyyy(customerProduct.entryDate),
    },
  };
}

function generateAllReports(
  productInfo: Product[],
  customerProducts: CustomerProduct[]
): Report[] {
  if (!Array.isArray(productInfo) || !Array.isArray(customerProducts)) {
    throw new Error('Invalid input data');
  }

  const reportYears = getGlobalReportYears(productInfo, customerProducts);

  const reports = customerProducts
    .map((customerProduct) => {
      const product = productInfo.find(
        (currentProduct) => currentProduct.name === customerProduct.name
      );
      if (!product) {
        return null;
      }
      return generateReportForProduct(product, customerProduct, reportYears);
    })
    .filter((report): report is Report => report !== null);

  return reports;
}

function generateCumulativeReport(
  products: Product[],
  customerProducts: CustomerProduct[]
): Report {
  if (!Array.isArray(products) || !Array.isArray(customerProducts)) {
    throw new Error('Invalid input data');
  }

  const allYears = getGlobalReportYears(products, customerProducts);

  // Initialize cumulative report
  let cumulativeReport: ReportRow[] = [
    ['', ...allYears, 'TOTAL'], // Add 'TOTAL' column header
    ['Capital Call (€)'],
    ['Distribución (€)'],
    ['Evolución del Patrimonio'],
    ['Flujo neto anual'],
    ['Flujo neto acumulado'],
  ];

  allYears.forEach((year, index) => {
    cumulativeReport[1][index + 1] = 0; // Capital Call (€)
    cumulativeReport[2][index + 1] = 0; // Distribución (€)
    cumulativeReport[3][index + 1] = 0; // Evolución del Patrimonio
    cumulativeReport[4][index + 1] = 0; // Flujo neto anual
    cumulativeReport[5][index + 1] = 0; // Flujo neto acumulado
  });

  // Aggregate data from each product report
  customerProducts.forEach((customerProduct) => {
    const product = products.find(
      (currentProduct) => currentProduct.name === customerProduct.name
    );
    if (!product) {
      return;
    }

    const individualReport = generateReportForProduct(
      product,
      customerProduct,
      allYears
    ).data;
    for (let i = 1; i < cumulativeReport[0].length - 1; i++) {
      const individualYearIndex = individualReport[0].indexOf(
        cumulativeReport[0][i]
      );
      if (individualYearIndex !== -1) {
        cumulativeReport[1][i] =
          (cumulativeReport[1][i] as number) +
          ((individualReport[2][individualYearIndex] as number) || 0);
        cumulativeReport[2][i] =
          (cumulativeReport[2][i] as number) +
          ((individualReport[4][individualYearIndex] as number) || 0);
        cumulativeReport[3][i] =
          (cumulativeReport[3][i] as number) +
          ((individualReport[5][individualYearIndex] as number) || 0);
      }
    }
  });

  // Calculate cumulative Flujo neto anual and Flujo neto acumulado
  for (let i = 1; i < cumulativeReport[0].length - 1; i++) {
    // Exclude 'TOTAL' column
    const capitalCallEuro = cumulativeReport[1][i] as number;
    const distributionEuro = cumulativeReport[2][i] as number;
    const lastFlujoNetoAcumulado =
      i > 1 ? (cumulativeReport[5][i - 1] as number) : 0;

    const flujoNetoAnual = distributionEuro - capitalCallEuro;
    const flujoNetoAcumulado = lastFlujoNetoAcumulado + flujoNetoAnual;

    cumulativeReport[4][i] = flujoNetoAnual;
    cumulativeReport[5][i] = flujoNetoAcumulado;
  }

  // Calculate the TOTAL column
  for (let rowIndex = 1; rowIndex < cumulativeReport.length; rowIndex++) {
    if (rowIndex === 3 || rowIndex === 4 || rowIndex === 5) {
      cumulativeReport[rowIndex].push();
    } else {
      const total = (cumulativeReport[rowIndex] as (number | string)[])
        .slice(1) // Start from index 1 to include all columns
        .map((value) =>
          typeof value === 'number' ? value : parseFloat(value as string)
        )
        .reduce((sum, value) => sum + (isNaN(value) ? 0 : value), 0);
      cumulativeReport[rowIndex].push(total);
    }
  }

  return {
    data: cumulativeReport,
    meta: {
      name: 'Cumulative Report',
      compromiso: customerProducts.reduce((sum, cp) => sum + cp.compromiso, 0),
      entryDate: '', // Date of entry is not applicable for cumulative report
    },
  };
}

interface YearlyReport {
  Año: string;
  'Flujo neto anual': number;
  'Flujo neto acumulado': number;
  'Evolución del Patrimonio': number;
}

function extractYearlyData(report: Report): YearlyReport[] {
  const years = report.data[0].slice(1, -1) as string[];
  const yearlyData: YearlyReport[] = [];

  const roundToTwoDecimals = (num: number) => Math.round(num * 100) / 100;

  years.forEach((year, index) => {
    const fnanual = roundToTwoDecimals(report.data[4][index + 1] as number); // Corrected index for 'Flujo neto anual'
    const fnacumulado = roundToTwoDecimals(report.data[5][index + 1] as number); // Corrected index for 'Flujo neto acumulado'
    const ep = roundToTwoDecimals(report.data[3][index + 1] as number); // Corrected index for 'Evolución del Patrimonio'

    yearlyData.push({
      Año: year,
      'Flujo neto anual': fnanual,
      'Flujo neto acumulado': fnacumulado,
      'Evolución del Patrimonio': ep,
    });
  });

  return yearlyData;
}

export async function getClientReport(code: string): Promise<{
  reports: Report[];
  cumulativeReport: Report;
  chartData: ReturnType<typeof extractYearlyData>;
}> {
  const connectionResolved = getPool();
  const [rows] = await connectionResolved.query<RowDataPacket[]>(
    `SELECT products FROM customers WHERE codigo = ?`,
    [code]
  );
  if (!rows.length) {
    return {
      reports: [],
      cumulativeReport: {
        data: [
          ['', 'TOTAL'],
          ['Capital Call (€)', 0],
          ['Distribución (€)', 0],
          ['Evolución del Patrimonio'],
          ['Flujo neto anual'],
          ['Flujo neto acumulado'],
        ],
        meta: { name: 'Cumulative Report', compromiso: 0, entryDate: '' },
      },
      chartData: [],
    };
  }
  const products: CustomerProduct[] = JSON.parse(rows[0].products);
  const productNames = Array.from(
    new Set(products.map((product: CustomerProduct) => product.name))
  );
  if (!productNames.length) {
    return {
      reports: [],
      cumulativeReport: generateCumulativeReport([], []),
      chartData: [],
    };
  }
  const [rowsProducts] = await connectionResolved.query<RowDataPacket[]>(
    `SELECT * FROM products WHERE name IN (${productNames
      .map(() => '?')
      .join(',')})`,
    productNames
  );
  const productsParsed: Product[] = rowsProducts.map((row: any) => ({
    name: row.name,
    label: row.label,
    capitalCalls: JSON.parse(row.capitalCalls),
    distributions: JSON.parse(row.distributions),
    patrimonyGrowthStartYear:
      row.patrimonyGrowthStartYear === null ||
      row.patrimonyGrowthStartYear === undefined
        ? undefined
        : Number(row.patrimonyGrowthStartYear),
    patrimonyGrowthEndYear:
      row.patrimonyGrowthEndYear === null ||
      row.patrimonyGrowthEndYear === undefined
        ? undefined
        : Number(row.patrimonyGrowthEndYear),
    patrimonyGrowthYears:
      row.patrimonyGrowthYears === null || row.patrimonyGrowthYears === undefined
        ? undefined
        : Number(row.patrimonyGrowthYears),
  }));

  const reports: Report[] = generateAllReports(productsParsed, products);
  const cumulativeReport = generateCumulativeReport(productsParsed, products);
  const chartData = extractYearlyData(cumulativeReport);
  const data = await Promise.all([reports, cumulativeReport, chartData]);
  return {
    reports: data[0],
    cumulativeReport: data[1],
    chartData: data[2],
  };
}
