'use client';

import { CapitalCall, Distribution } from '@/app/lib/definitions';
import { Button } from '@/app/ui/shadcn/ui/button';
import { Input } from '@/app/ui/shadcn/ui/input';
import { Label } from '@/app/ui/shadcn/ui/label';
import { Separator } from '@/app/ui/shadcn/ui/separator';
import { useToast } from '@/app/ui/shadcn/ui/use-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

type EntryType = 'capitalCalls' | 'distributions';

type ProductEntry = CapitalCall | Distribution;

type EntryRow = {
  rowId: string;
  type: string;
  date: string;
  percentage: string;
};

interface CreateProductFormProps {
  formAction: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialName?: string;
  initialCapitalCalls?: CapitalCall[];
  initialDistributions?: Distribution[];
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function validateProductEntryDates(formData: FormData) {
  const today = normalizeDate(new Date());
  const sections: EntryType[] = ['capitalCalls', 'distributions'];

  for (const section of sections) {
    const rowIds = formData.getAll(`${section}.rowId`);

    for (const rowId of rowIds) {
      const rowKey = String(rowId);
      const type = String(formData.get(`${section}.${rowKey}.type`) || '').trim();
      const dateValue = String(
        formData.get(`${section}.${rowKey}.date`) || ''
      ).trim();

      if (!type || !dateValue) {
        continue;
      }

      const entryDate = normalizeDate(new Date(dateValue));

      if (Number.isNaN(entryDate.getTime())) {
        continue;
      }

      if (type === 'espectativa' && entryDate < today) {
        return `Una espectativa de ${
          section === 'capitalCalls' ? 'capital call' : 'distribucion'
        } no puede tener una fecha anterior a hoy.`;
      }

      if (type === 'realidad' && entryDate > today) {
        return `Una realidad de ${
          section === 'capitalCalls' ? 'capital call' : 'distribucion'
        } no puede tener una fecha posterior a hoy.`;
      }
    }
  }

  return null;
}

function validateProductForm(formData: FormData) {
  const name = String(formData.get('name') || '').trim();

  if (!name) {
    return 'Debes introducir el nombre del producto.';
  }

  if (name.length < 4) {
    return 'El nombre del producto debe tener al menos 4 caracteres.';
  }

  if (name.length > 50) {
    return 'El nombre del producto debe tener como maximo 50 caracteres.';
  }

  return validateProductEntryDates(formData);
}

function buildInitialRows(initialEntries?: ProductEntry[]) {
  if (!initialEntries?.length) {
    return [{ rowId: 'row-1', type: '', date: '', percentage: '' }];
  }

  return initialEntries.map((entry, index) => ({
    rowId: `row-${index + 1}`,
    type: entry.type,
    date: entry.date,
    percentage: String(entry.percentage),
  }));
}

function EntryList({
  title,
  description,
  prefix,
  initialEntries = [],
}: {
  title: string;
  description: string;
  prefix: EntryType;
  initialEntries?: ProductEntry[];
}) {
  const [rows, setRows] = useState<EntryRow[]>(
    buildInitialRows(initialEntries)
  );
  const [nextRowId, setNextRowId] = useState(rows.length + 1);

  function addRow(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setRows((prev) => [
      ...prev,
      {
        rowId: `row-${nextRowId}`,
        type: '',
        date: '',
        percentage: '',
      },
    ]);
    setNextRowId((prev) => prev + 1);
  }

  function deleteRow(
    event: React.MouseEvent<HTMLButtonElement>,
    rowId: string
  ) {
    event.preventDefault();
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.rowId !== rowId)
    );
  }

  const rowLabel = prefix === 'capitalCalls' ? 'Capital call' : 'Distribución';

  return (
    <section className="rounded-2xl border border-border/80 bg-secondary/45 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-2"
          onClick={addRow}
        >
          <PlusIcon className="h-4 w-4" />
          Añadir {rowLabel.toLowerCase()}
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.rowId}
            className="rounded-xl border border-border/80 bg-card p-4 shadow-sm"
          >
            <input type="hidden" name={`${prefix}.rowId`} value={row.rowId} />
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {rowLabel} {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-red-600"
                onClick={(event) => deleteRow(event, row.rowId)}
                disabled={rows.length === 1}
              >
                <TrashIcon className="h-4 w-4" />
                Eliminar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_0.8fr]">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${prefix}-type-${row.rowId}`}>Tipo</Label>
                <select
                  id={`${prefix}-type-${row.rowId}`}
                  name={`${prefix}.${row.rowId}.type`}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  defaultValue={row.type}
                >
                  <option value="">Selecciona un tipo...</option>
                  <option value="realidad">Realidad</option>
                  <option value="espectativa">Espectativa</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${prefix}-date-${row.rowId}`}>Fecha</Label>
                <Input
                  id={`${prefix}-date-${row.rowId}`}
                  name={`${prefix}.${row.rowId}.date`}
                  type="date"
                  max="2200-01-01"
                  defaultValue={row.date}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`${prefix}-percentage-${row.rowId}`}>
                  Porcentaje
                </Label>
                <Input
                  id={`${prefix}-percentage-${row.rowId}`}
                  name={`${prefix}.${row.rowId}.percentage`}
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="%"
                  defaultValue={row.percentage}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CreateProductForm({
  formAction,
  submitLabel,
  initialName = '',
  initialCapitalCalls = [],
  initialDistributions = [],
}: CreateProductFormProps) {
  const { toast } = useToast();

  return (
    <form
      action={formAction}
      className="mt-5"
      noValidate
      onSubmit={(event) => {
        const validationError = validateProductForm(
          new FormData(event.currentTarget)
        );

        if (!validationError) {
          return;
        }

        event.preventDefault();
        toast({
          variant: 'destructive',
          description: validationError,
          duration: 3000,
        });
      }}
    >
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
        <Label htmlFor="product-name">Nombre del producto</Label>
        <Input
          className="mt-2 max-w-xl border-input"
          type="text"
          id="product-name"
          name="name"
          placeholder="Nombre..."
          suppressHydrationWarning={true}
          defaultValue={initialName}
        />
      </div>

      <Separator className="my-6 bg-brand/40" />

      <div className="space-y-6">
        <EntryList
          prefix="capitalCalls"
          title="Capital calls"
          description="Empieza con una fila y añade solo las que necesites."
          initialEntries={initialCapitalCalls}
        />

        <EntryList
          prefix="distributions"
          title="Distribuciones"
          description="Mantén la misma dinámica para las distribuciones."
          initialEntries={initialDistributions}
        />
      </div>

      <Separator className="my-6 bg-brand/40" />

      <Label className="text-xs text-muted-foreground">
        Podrás volver aquí para ajustar el nombre, los capital calls y las
        distribuciones
      </Label>
      <div className="mt-3">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
