import CreateCustomer from '@/app/ui/dashboard/customers/create-customer';
import { createCustomerFromFields } from '@/app/lib/actions';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/ui/shadcn/ui/breadcrumb';
import { getComboboxParseProducts } from '@/app/lib/sql';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const products = await getComboboxParseProducts();
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
            <BreadcrumbPage>Crear Cliente</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl">Crear cliente</h1>
      <CreateCustomer
        availableProducts={products}
        formAction={createCustomerFromFields}
        submitLabel="Crear"
      />
    </>
  );
}
