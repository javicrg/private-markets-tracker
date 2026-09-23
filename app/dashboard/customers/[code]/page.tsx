import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/app/ui/shadcn/ui/breadcrumb';
import InformeFondo from '@/app/ui/dashboard/customers/code/informe-fondo';
import InformeCumulativo from '@/app/ui/dashboard/customers/code/informe-cumulativo';
import Chart from '@/app/ui/dashboard/customers/chart';
import { getClientReport } from '@/app/lib/sql';
import { Suspense } from 'react';
import {
  ChartSkeleton,
  InfoFondoSkeleton,
} from '@/app/ui/dashboard/customers/code/skeletons';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const reportData: any = await getClientReport(code);

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
            <BreadcrumbPage>
              Visualización <span className="font-semibold">{code}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Suspense
        fallback={
          <div>
            <InfoFondoSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <InformeCumulativo
          data={reportData.cumulativeReport.data}
          meta={reportData.cumulativeReport.meta}
        />
        <Chart data={reportData.chartData} />

        {reportData.reports.map((report: any, index: number) => (
          <InformeFondo key={index} data={report.data} meta={report.meta} />
        ))}
      </Suspense>
    </>
  );
}
