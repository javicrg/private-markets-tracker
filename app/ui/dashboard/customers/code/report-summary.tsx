import { toCurrency } from '@/app/lib/helpers';

type ReportCell = string | number | undefined;
type ReportRow = ReportCell[];

type ReportSummaryProps = {
  data: ReportRow[];
  variant: 'cumulative' | 'fund';
};

type ReportSummaryMetrics = {
  beneficioPrevisto: number;
  tir: number | null;
  moic: number | null;
};

const EPSILON = 0.0000001;

function getLastAvailableValue(
  years: number[],
  valuesByYear: Record<number, number>
): number | null {
  for (let index = years.length - 1; index >= 0; index -= 1) {
    const value = valuesByYear[years[index]];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function calculateAnnualIRR(cashFlows: number[]): number | null {
  const hasNegative = cashFlows.some((value) => value < 0);
  const hasPositive = cashFlows.some((value) => value > 0);

  if (!hasNegative || !hasPositive) {
    return null;
  }

  const npv = (rate: number) =>
    cashFlows.reduce((sum, cashFlow, index) => {
      return sum + cashFlow / Math.pow(1 + rate, index);
    }, 0);

  let low = -0.9999;
  let high = 10;
  let lowNpv = npv(low);
  let highNpv = npv(high);

  for (let iteration = 0; iteration < 10 && lowNpv * highNpv > 0; iteration += 1) {
    high *= 2;
    highNpv = npv(high);
  }

  if (!Number.isFinite(lowNpv) || !Number.isFinite(highNpv)) {
    return null;
  }

  if (lowNpv * highNpv > 0) {
    return null;
  }

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const mid = (low + high) / 2;
    const midNpv = npv(mid);

    if (!Number.isFinite(midNpv)) {
      return null;
    }

    if (Math.abs(midNpv) < EPSILON) {
      return mid > -1 ? mid : null;
    }

    if (lowNpv * midNpv <= 0) {
      high = mid;
      highNpv = midNpv;
    } else {
      low = mid;
      lowNpv = midNpv;
    }
  }

  const result = (low + high) / 2;
  return result > -1 ? result : null;
}

function calculateReportSummaryMetrics(params: {
  years: number[];
  capitalCallEuroByYear: Record<number, number>;
  distributionEuroByYear: Record<number, number>;
  annualNetFlowByYear: Record<number, number>;
  accumulatedNetFlowByYear: Record<number, number>;
}): ReportSummaryMetrics {
  const {
    years,
    capitalCallEuroByYear,
    distributionEuroByYear,
    annualNetFlowByYear,
    accumulatedNetFlowByYear,
  } = params;

  const totalInvestedCapital = years.reduce((sum, year) => {
    return sum + Math.abs(capitalCallEuroByYear[year] ?? 0);
  }, 0);

  const totalDistributions = years.reduce((sum, year) => {
    return sum + Math.max(0, distributionEuroByYear[year] ?? 0);
  }, 0);

  const beneficioPrevisto =
    getLastAvailableValue(years, accumulatedNetFlowByYear) ?? 0;
  const moic =
    totalInvestedCapital > 0 ? totalDistributions / totalInvestedCapital : null;
  const tir = calculateAnnualIRR(years.map((year) => annualNetFlowByYear[year] ?? 0));
  return {
    beneficioPrevisto,
    tir,
    moic,
  };
}

function formatPercentage(value: number | null): string {
  if (value === null) {
    return 'N/A';
  }

  return `${(value * 100).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatMultiple(value: number | null): string {
  if (value === null) {
    return 'N/A';
  }

  return `${value.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}x`;
}

function getRowIndexMap(variant: 'cumulative' | 'fund') {
  if (variant === 'cumulative') {
    return {
      capitalCallEuro: 1,
      distributionEuro: 2,
      annualNetFlow: 4,
      accumulatedNetFlow: 5,
    };
  }

  return {
    capitalCallEuro: 2,
    distributionEuro: 4,
    annualNetFlow: 6,
    accumulatedNetFlow: 7,
  };
}

export default function ReportSummary({ data, variant }: ReportSummaryProps) {
  const years = (data[0]?.slice(1, -1) as string[] | undefined)?.map((year) =>
    parseInt(year, 10)
  ) ?? [];

  const rowIndexes = getRowIndexMap(variant);
  const capitalCallEuroByYear: Record<number, number> = {};
  const distributionEuroByYear: Record<number, number> = {};
  const annualNetFlowByYear: Record<number, number> = {};
  const accumulatedNetFlowByYear: Record<number, number> = {};

  years.forEach((year, index) => {
    capitalCallEuroByYear[year] =
      (data[rowIndexes.capitalCallEuro]?.[index + 1] as number) || 0;
    distributionEuroByYear[year] =
      (data[rowIndexes.distributionEuro]?.[index + 1] as number) || 0;
    annualNetFlowByYear[year] =
      (data[rowIndexes.annualNetFlow]?.[index + 1] as number) || 0;
    accumulatedNetFlowByYear[year] =
      (data[rowIndexes.accumulatedNetFlow]?.[index + 1] as number) || 0;
  });

  const metrics = calculateReportSummaryMetrics({
    years,
    capitalCallEuroByYear,
    distributionEuroByYear,
    annualNetFlowByYear,
    accumulatedNetFlowByYear,
  });

  const items = [
    {
      label: 'BENEFICIO PREVISTO',
      value: toCurrency(metrics.beneficioPrevisto),
    },
    {
      label: 'TIR',
      value: formatPercentage(metrics.tir),
    },
    {
      label: 'MOIC',
      value: formatMultiple(metrics.moic),
    },
  ];

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border/80 bg-card px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
