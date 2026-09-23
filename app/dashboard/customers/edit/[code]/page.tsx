import { notFound } from 'next/navigation';

import { updateCustomerFromFields } from '@/app/lib/actions';
import { getComboboxParseProducts, getCustomerByCode } from '@/app/lib/sql';
import CreateCustomer from '@/app/ui/dashboard/customers/create-customer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/ui/shadcn/ui/breadcrumb';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [products, customer] = await Promise.all([
    getComboboxParseProducts(),
    getCustomerByCode(code),
  ]);

  if (!customer) {
    notFound();
  }

  const updateAction = updateCustomerFromFields.bind(null, customer.codigo);

  return (
    <>
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/customers">
              Clientes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl">Editar cliente</h1>
      <CreateCustomer
        availableProducts={products}
        formAction={updateAction}
        submitLabel="Guardar cambios"
        initialCode={customer.codigo}
        initialProducts={customer.products}
      />
    </>
  );
}
