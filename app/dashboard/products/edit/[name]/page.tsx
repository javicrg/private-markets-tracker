import { notFound } from 'next/navigation';

import { getProductByName } from '@/app/lib/sql';
import { updateProductFromFields } from '@/app/lib/actions';
import CreateProductForm from '@/app/ui/dashboard/products/create-product-form';
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
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const product = await getProductByName(decodedName);

  if (!product) {
    notFound();
  }

  const updateAction = updateProductFromFields.bind(null, product.name);

  return (
    <>
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/products">
              Productos
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Editar producto</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl">Editar producto</h1>
      <CreateProductForm
        formAction={updateAction}
        submitLabel="Guardar cambios"
        initialName={product.label}
        initialCapitalCalls={product.capitalCalls}
        initialDistributions={product.distributions}
      />
    </>
  );
}
