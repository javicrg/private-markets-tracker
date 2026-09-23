import Link from 'next/link';
import { getCustomersList, getCustomerPages } from '@/app/lib/sql';
import Search from '@/app/ui/dashboard/search';
import Pagination from '@/app/ui/dashboard/pagination';
import { Button } from '@/app/ui/shadcn/ui/button';
import CustomerActions from '@/app/ui/dashboard/customers/customer-actions';

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || '';
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const numberOfPages = await getCustomerPages(query);

  const customerList = await getCustomersList(query, currentPage);
  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar clientes..." />
        <Link href={'/dashboard/customers/create'}>
          <Button>Añadir Cliente</Button>
        </Link>
      </div>
      <table className="mt-5 w-full table-auto overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <thead className="h-10 bg-primary/12 text-foreground">
          <tr>
            <th className="w-full text-sm font-bold">Código</th>
            <th className="w-fit"></th>
          </tr>
        </thead>
        <tbody className="text-center">
          {customerList.map((customer) => (
            <tr
              key={customer.codigo}
              className="w-full border-b border-border py-1 text-sm odd:bg-accent/45 even:bg-card hover:bg-primary/10"
            >
              <td className="whitespace-nowrap px-3 py-1">
                <Button asChild variant={'link'}>
                  <Link href={`/dashboard/customers/${customer.codigo}`}>
                    {customer.codigo}
                  </Link>
                </Button>
              </td>
              <td className="whitespace-nowrap px-3 py-1">
                <CustomerActions code={customer.codigo} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={numberOfPages} />
      </div>
    </>
  );
}
