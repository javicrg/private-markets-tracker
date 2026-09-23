'use server';

import { z } from 'zod';

import getPool from '@/app/lib/sql';
import { revalidatePath } from 'next/cache';
import { CustomerProduct } from './definitions';
import { redirect } from 'next/navigation';

import { auth } from '@clerk/nextjs/server';

async function requireAuthenticatedUser() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

const CustomerCreationSchema = z.object({
  code: z
    .string({
      invalid_type_error:
        'Por favor, introduce un código de entre 4 y 10 caracteres.',
    })
    .min(4, 'Por favor, introduce un código de al menos 4 caracteres.')
    .max(10, 'Por favor, introduce un código de como máximo 10 caracteres.'),
  products: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        entryDate: z.string(),
        compromiso: z.number(),
        buyType: z.enum(['emision', 'ampliacion', 'secundario']),
        valorCompra: z.number().optional(),
      })
    )
    .optional(),
});

export type State = {
  errors?: {
    code?: string[];
  };
  message?: string | null;
};

type ActionResult = {
  errors?: Record<string, string[] | undefined>;
  message?: string | null;
  redirectTo?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildCustomerProductsFromFields(
  formData: FormData
): CustomerProduct[] {
  const rowIds = formData.getAll('productRowId');

  const products = rowIds.map((rowId) => {
    const rowKey = String(rowId);
    const productId = String(formData.get(`product.${rowKey}.id`) || '').trim();
    const name = String(formData.get(`product.${rowKey}.name`) || '').trim();
    const compromiso = parseOptionalNumber(
      formData.get(`product.${rowKey}.compromiso`)
    );

    if (!name || !compromiso) {
      return null;
    }

    const buyType = String(
      formData.get(`product.${rowKey}.buyType`) || 'emision'
    ) as 'emision' | 'ampliacion' | 'secundario';

    return {
      id: productId || crypto.randomUUID(),
      name,
      entryDate:
        buyType === 'emision'
          ? ''
          : String(formData.get(`product.${rowKey}.entryDate`) || '').trim(),
      compromiso,
      buyType,
      valorCompra:
        buyType === 'secundario'
          ? parseOptionalNumber(formData.get(`product.${rowKey}.valorCompra`))
          : undefined,
    };
  });

  return products.filter((product) => product !== null) as CustomerProduct[];
}

function buildProductEntriesFromFields(
  formData: FormData,
  prefix: 'capitalCalls' | 'distributions'
) {
  const rowIds = formData.getAll(`${prefix}.rowId`);

  return rowIds
    .map((rowId) => {
      const rowKey = String(rowId);
      const type = String(
        formData.get(`${prefix}.${rowKey}.type`) || ''
      ).trim();
      const date = String(
        formData.get(`${prefix}.${rowKey}.date`) || ''
      ).trim();
      const percentage = parseOptionalNumber(
        formData.get(`${prefix}.${rowKey}.percentage`)
      );

      if (!type || !date || !percentage) {
        return null;
      }

      return {
        type,
        date,
        percentage,
      };
    })
    .filter(
      (
        productEntry
      ): productEntry is { type: string; date: string; percentage: number } =>
        productEntry !== null
    );
}

export async function createCustomer(
  formData: FormData
): Promise<ActionResult> {
  await requireAuthenticatedUser();

  const validationResult = CustomerCreationSchema.safeParse({
    code: formData.get('code'),
    products: JSON.parse(formData.get('products') as string),
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error?.flatten().fieldErrors,
      message: 'Faltan campos por rellenar.',
    };
  }

  const { code, products } = validationResult.data as {
    code: string;
    products: CustomerProduct[];
  };
  try {
    const connectionResolved = getPool();
    await connectionResolved.query(
      'INSERT INTO customers (codigo, products) VALUES (?, ?);',
      [code, JSON.stringify(products ?? [])]
    );
  } catch (error) {
    return {
      message: 'Error de base de datos: Error al crear el cliente.',
    };
  }
  revalidatePath('/dashboard/customers');
  return {
    redirectTo: '/dashboard/customers',
  };
}

export async function createCustomerFromFields(formData: FormData) {
  const parsedFormData = new FormData();
  parsedFormData.set('code', String(formData.get('code') || ''));
  parsedFormData.set(
    'products',
    JSON.stringify(buildCustomerProductsFromFields(formData))
  );

  const result = await createCustomer(parsedFormData);

  if (result?.message) {
    throw new Error(result.message);
  }

  redirect(result?.redirectTo || '/dashboard/customers');
}

export async function updateCustomer(
  originalCode: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuthenticatedUser();

  const validationResult = CustomerCreationSchema.safeParse({
    code: formData.get('code'),
    products: JSON.parse(formData.get('products') as string),
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Faltan campos por rellenar.',
    };
  }

  const { code, products } = validationResult.data as {
    code: string;
    products: CustomerProduct[];
  };

  try {
    const connectionResolved = getPool();
    await connectionResolved.query(
      'UPDATE customers SET codigo = ?, products = ? WHERE codigo = ?;',
      [code, JSON.stringify(products ?? []), originalCode]
    );
  } catch (error) {
    return {
      message: 'Error de base de datos: Error al actualizar el cliente.',
    };
  }

  revalidatePath('/dashboard/customers');
  revalidatePath(`/dashboard/customers/${originalCode}`);
  revalidatePath(`/dashboard/customers/edit/${originalCode}`);

  if (code !== originalCode) {
    revalidatePath(`/dashboard/customers/${code}`);
    revalidatePath(`/dashboard/customers/edit/${code}`);
  }

  return {
    redirectTo: `/dashboard/customers/${code}`,
  };
}

export async function updateCustomerFromFields(
  originalCode: string,
  formData: FormData
) {
  const parsedFormData = new FormData();
  parsedFormData.set('code', String(formData.get('code') || ''));
  parsedFormData.set(
    'products',
    JSON.stringify(buildCustomerProductsFromFields(formData))
  );

  const result = await updateCustomer(originalCode, parsedFormData);

  if (result?.message) {
    throw new Error(result.message);
  }

  redirect(result?.redirectTo || '/dashboard/customers');
}

export async function deleteCustomer(code: string) {
  await requireAuthenticatedUser();

  try {
    const connectionResolved = getPool();
    await connectionResolved.query('DELETE FROM customers WHERE codigo = ?;', [
      code,
    ]);
  } catch (error) {
    throw new Error('Error de base de datos: Error al eliminar el cliente.');
  }

  revalidatePath('/dashboard/customers');
  revalidatePath(`/dashboard/customers/${code}`);
  revalidatePath(`/dashboard/customers/edit/${code}`);
  redirect('/dashboard/customers');
}

export type ProductState = {
  errors?: {
    name?: string[];
  };
  message?: string | null;
};

const ProductCreationSchema = z.object({
  name: z
    .string()
    .min(
      4,
      'Por favor, introduce un nombre de producto de al menos 4 caracteres.'
    )
    .max(
      50,
      'Por favor, introduce un nombre de producto de como máximo 50 caracteres.'
    ),
  capitalCalls: z
    .array(
      z.object({
        type: z.string(),
        date: z.string(),
        percentage: z.number(),
      })
    )
    .optional(),
  distributions: z
    .array(
      z.object({
        type: z.string(),
        date: z.string(),
        percentage: z.number(),
      })
    )
    .optional(),
});

export async function createProduct(formData: FormData): Promise<ActionResult> {
  await requireAuthenticatedUser();

  const validationResult = ProductCreationSchema.safeParse({
    name: formData.get('name'),
    capitalCalls: JSON.parse(formData.get('capitalCalls') as string),
    distributions: JSON.parse(formData.get('distributions') as string),
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Faltan campos por rellenar.',
    };
  }
  const { name, capitalCalls, distributions } = validationResult.data;
  const capitalCallsParsed = capitalCalls
    ? JSON.stringify(capitalCalls)
    : JSON.stringify([]);
  const distributionsParsed = distributions
    ? JSON.stringify(distributions)
    : JSON.stringify([]);
  const lowerName = name.toLowerCase();

  try {
    const connectionResolved = getPool();
    await connectionResolved.query(
      `INSERT INTO products (name, label, capitalCalls, distributions)
      VALUES (?, ?, ?, ?);`,
      [lowerName, name, capitalCallsParsed, distributionsParsed]
    );
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Error de base de datos: Error al crear el producto.',
    };
  }

  revalidatePath('/dashboard/products');
  return {
    redirectTo: '/dashboard/products',
  };
}

export async function createProductFromFields(formData: FormData) {
  const parsedFormData = new FormData();
  parsedFormData.set('name', String(formData.get('name') || ''));
  parsedFormData.set(
    'capitalCalls',
    JSON.stringify(buildProductEntriesFromFields(formData, 'capitalCalls'))
  );
  parsedFormData.set(
    'distributions',
    JSON.stringify(buildProductEntriesFromFields(formData, 'distributions'))
  );

  const result = await createProduct(parsedFormData);

  if (result?.message) {
    throw new Error(result.message);
  }

  redirect(result?.redirectTo || '/dashboard/products');
}

export async function updateProduct(
  originalName: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAuthenticatedUser();

  const validationResult = ProductCreationSchema.safeParse({
    name: formData.get('name'),
    capitalCalls: JSON.parse(formData.get('capitalCalls') as string),
    distributions: JSON.parse(formData.get('distributions') as string),
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Faltan campos por rellenar.',
    };
  }

  const { name, capitalCalls, distributions } = validationResult.data;
  const nextName = name.toLowerCase();
  const capitalCallsParsed = JSON.stringify(capitalCalls ?? []);
  const distributionsParsed = JSON.stringify(distributions ?? []);

  try {
    const connectionResolved = getPool();
    await connectionResolved.query(
      `UPDATE products
       SET name = ?, label = ?, capitalCalls = ?, distributions = ?
       WHERE name = ?;`,
      [nextName, name, capitalCallsParsed, distributionsParsed, originalName]
    );

    if (nextName !== originalName) {
      const [customerRows] = await connectionResolved.query<any[]>(
        'SELECT codigo, products FROM customers'
      );

      for (const customer of customerRows) {
        const products = JSON.parse((customer.products as string) || '[]');
        const updatedProducts = products.map((product: CustomerProduct) =>
          product.name === originalName
            ? { ...product, name: nextName }
            : product
        );

        if (JSON.stringify(updatedProducts) !== JSON.stringify(products)) {
          await connectionResolved.query(
            'UPDATE customers SET products = ? WHERE codigo = ?',
            [JSON.stringify(updatedProducts), customer.codigo]
          );
          revalidatePath(`/dashboard/customers/${customer.codigo}`);
          revalidatePath(`/dashboard/customers/edit/${customer.codigo}`);
        }
      }
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      message: 'Error de base de datos: Error al actualizar el producto.',
    };
  }

  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/edit/${originalName}`);
  if (nextName !== originalName) {
    revalidatePath(`/dashboard/products/edit/${nextName}`);
  }

  return {
    redirectTo: '/dashboard/products',
  };
}

export async function updateProductFromFields(
  originalName: string,
  formData: FormData
) {
  const parsedFormData = new FormData();
  parsedFormData.set('name', String(formData.get('name') || ''));
  parsedFormData.set(
    'capitalCalls',
    JSON.stringify(buildProductEntriesFromFields(formData, 'capitalCalls'))
  );
  parsedFormData.set(
    'distributions',
    JSON.stringify(buildProductEntriesFromFields(formData, 'distributions'))
  );

  const result = await updateProduct(originalName, parsedFormData);

  if (result?.message) {
    throw new Error(result.message);
  }

  redirect(result?.redirectTo || '/dashboard/products');
}

export async function deleteProduct(name: string) {
  await requireAuthenticatedUser();

  try {
    const connectionResolved = getPool();
    await connectionResolved.query('DELETE FROM products WHERE name = ?;', [
      name,
    ]);

    const [customerRows] = await connectionResolved.query<any[]>(
      'SELECT codigo, products FROM customers'
    );

    for (const customer of customerRows) {
      const products = JSON.parse((customer.products as string) || '[]');
      const updatedProducts = products.filter(
        (product: CustomerProduct) => product.name !== name
      );

      if (updatedProducts.length !== products.length) {
        await connectionResolved.query(
          'UPDATE customers SET products = ? WHERE codigo = ?',
          [JSON.stringify(updatedProducts), customer.codigo]
        );
        revalidatePath(`/dashboard/customers/${customer.codigo}`);
        revalidatePath(`/dashboard/customers/edit/${customer.codigo}`);
      }
    }
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Error de base de datos: Error al eliminar el producto.');
  }

  revalidatePath('/dashboard/products');
  revalidatePath(`/dashboard/products/edit/${name}`);
  redirect('/dashboard/products');
}
