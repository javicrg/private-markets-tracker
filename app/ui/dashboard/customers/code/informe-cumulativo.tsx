import { toCurrency } from '@/app/lib/helpers';
import ReportTable from '@/app/ui/dashboard/customers/code/report-table';
import ReportSummary from '@/app/ui/dashboard/customers/code/report-summary';

export default function InformeCumulativo({
  data,
  meta,
}: {
  data: any;
  meta: any;
}) {
  return (
    <>
      <h1 className="text-lg font-semibold text-gray-600">
        Fondo {meta.name} - Compromiso: {toCurrency(meta.compromiso)}{' '}
        {meta.entryDate ? `- Fecha de compra: ${meta.entryDate}` : ''}
      </h1>
      <ReportSummary data={data} variant="cumulative" />
      <ReportTable data={data} variant="cumulative" />
    </>
  );
}
