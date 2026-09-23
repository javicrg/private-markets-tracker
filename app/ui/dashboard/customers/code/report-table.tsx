'use client';

import { toCurrency } from '@/app/lib/helpers';

type ReportCell = string | number | undefined;
type ReportRow = ReportCell[];

type ReportTableProps = {
  data: ReportRow[];
  variant: 'cumulative' | 'fund';
};

function getRowTone(
  rowIndex: number,
  variant: 'cumulative' | 'fund'
): string | null {
  if (variant === 'cumulative') {
    if (rowIndex === 1) return '--report-peach';
    if (rowIndex === 2) return '--report-green';
    if (rowIndex === 3) return '--report-violet';
    if (rowIndex === 4) return '--report-blue';
    if (rowIndex === 5) return '--report-rose';
    return null;
  }

  if (rowIndex === 1 || rowIndex === 2) return '--report-peach';
  if (rowIndex === 3 || rowIndex === 4) return '--report-green';
  if (rowIndex === 5) return '--report-violet';
  if (rowIndex === 6 || rowIndex === 7) return '--report-blue';
  return null;
}

function getCellBackground(rowIndex: number, colIndex: number, tone: string | null) {
  if (rowIndex === 0 || colIndex === 0) {
    return 'hsl(var(--card))';
  }

  if (!tone) {
    return 'hsl(var(--card))';
  }

  return `hsl(var(${tone}))`;
}

function formatCellValue(
  value: ReportCell,
  rowIndex: number,
  colIndex: number,
  variant: 'cumulative' | 'fund'
) {
  if (value === undefined || value === null) {
    return '';
  }

  if (colIndex === 0 || rowIndex === 0) {
    return String(value);
  }

  if (variant === 'cumulative' && rowIndex >= 1) {
    return typeof value === 'number' ? toCurrency(value) : String(value);
  }

  if (
    variant === 'fund' &&
    (rowIndex === 2 ||
      rowIndex === 4 ||
      rowIndex === 5 ||
      rowIndex === 6 ||
      rowIndex === 7)
  ) {
    return typeof value === 'number' ? toCurrency(value) : String(value);
  }

  if (variant === 'fund' && (rowIndex === 1 || rowIndex === 3)) {
    return `${value}%`;
  }

  return String(value);
}

export default function ReportTable({ data, variant }: ReportTableProps) {
  if (!data.length) {
    return (
      <div className="my-4 rounded-xl border border-dashed border-border bg-secondary/35 px-4 py-6 text-sm text-muted-foreground">
        No hay datos disponibles para este informe.
      </div>
    );
  }

  const todaysYear = new Date().getFullYear();
  const totalColumnIndex = data[0]?.length ? data[0].length - 1 : -1;

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
      <table className="min-w-full border-collapse text-sm">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const year = Number.parseInt(String(data[0]?.[colIndex] ?? ''), 10);
                const isProjectedYear =
                  Number.isFinite(year) && colIndex >= 1 && rowIndex >= 1 && year >= todaysYear;
                const rowTone = getRowTone(rowIndex, variant);

                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className="border border-border px-4 py-2 text-foreground"
                    style={{
                      backgroundColor: getCellBackground(
                        rowIndex,
                        colIndex,
                        rowTone
                      ),
                      color: isProjectedYear ? 'hsl(var(--brand))' : undefined,
                      fontWeight:
                        rowIndex === 0 ||
                        colIndex === 0 ||
                        colIndex === totalColumnIndex
                          ? 'bold'
                          : 'normal',
                      textAlign: colIndex >= 1 ? 'center' : 'left',
                      whiteSpace: 'nowrap',
                      position:
                        rowIndex === 0 || colIndex === 0
                          ? 'sticky'
                          : 'static',
                      left: colIndex === 0 ? 0 : undefined,
                      top: rowIndex === 0 ? 0 : undefined,
                      zIndex:
                        rowIndex === 0 && colIndex === 0
                          ? 4
                          : rowIndex === 0 || colIndex === 0
                            ? 3
                            : 1,
                    }}
                  >
                    {formatCellValue(cell, rowIndex, colIndex, variant)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
