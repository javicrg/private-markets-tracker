'use client';

import { CustomerProduct } from '@/app/lib/definitions';
import { Button } from '@/app/ui/shadcn/ui/button';
import { Input } from '@/app/ui/shadcn/ui/input';
import { Label } from '@/app/ui/shadcn/ui/label';
import { useToast } from '@/app/ui/shadcn/ui/use-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export interface ParsedProduct {
  label: string;
  value: string;
}

interface CreateCustomerProps {
  availableProducts: ParsedProduct[];
  formAction: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  initialCode?: string;
  initialProducts?: CustomerProduct[];
}

type ProductRow = {
  rowId: string;
  productId: string;
  name: string;
  entryDate: string;
  compromiso: string;
  buyType: 'emision' | 'ampliacion' | 'secundario';
  valorCompra: string;
};

function buildInitialRows(initialProducts?: CustomerProduct[]) {
  if (!initialProducts?.length) {
    return [
      {
        rowId: 'new-1',
        productId: '',
        name: '',
        entryDate: '',
        compromiso: '',
        buyType: 'emision' as const,
        valorCompra: '',
      },
    ];
  }

  return initialProducts.map((product, index) => ({
    rowId: `existing-${index + 1}`,
    productId: product.id,
    name: product.name,
    entryDate: product.entryDate || '',
    compromiso: String(product.compromiso ?? ''),
    buyType: product.buyType,
    valorCompra:
      product.valorCompra === undefined ? '' : String(product.valorCompra),
  }));
}

export default function CreateCustomer({
  availableProducts,
  formAction,
  submitLabel,
  initialCode = '',
  initialProducts = [],
}: CreateCustomerProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ProductRow[]>(
    buildInitialRows(initialProducts)
  );
  const [nextRowId, setNextRowId] = useState(rows.length + 1);

  function addRow(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setRows((prev) => [
      ...prev,
      {
        rowId: `new-${nextRowId}`,
        productId: '',
        name: '',
        entryDate: '',
        compromiso: '',
        buyType: 'emision',
        valorCompra: '',
      },
    ]);
    setNextRowId((prev) => prev + 1);
  }

  function removeRow(
    event: React.MouseEvent<HTMLButtonElement>,
    rowId: string
  ) {
    event.preventDefault();
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.rowId !== rowId)
    );
  }

  function updateBuyType(
    event: React.ChangeEvent<HTMLSelectElement>,
    rowId: string
  ) {
    const buyType = event.target.value as ProductRow['buyType'];
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, buyType } : row))
    );
  }

  function validateCustomerForm(formData: FormData) {
    const code = String(formData.get('code') || '').trim();

    if (!code) {
      return 'Debes introducir el codigo del cliente.';
    }

    if (code.length < 4) {
      return 'El codigo del cliente debe tener al menos 4 caracteres.';
    }

    if (code.length > 10) {
      return 'El codigo del cliente debe tener como maximo 10 caracteres.';
    }

    return null;
  }

  return (
    <form
      action={formAction}
      className="mt-5 flex flex-col gap-6"
      noValidate
      onSubmit={(event) => {
        const validationError = validateCustomerForm(
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
        <Label htmlFor="customer-code">Código del cliente</Label>
        <Input
          suppressHydrationWarning={true}
          className="mt-2 max-w-sm border-input"
          type="text"
          id="customer-code"
          name="code"
          placeholder="Código..."
          defaultValue={initialCode}
        />
      </div>

      <section className="rounded-2xl border border-border/80 bg-secondary/45 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Productos asignados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Empieza con un producto y ve añadiendo los que necesites.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={addRow}
          >
            <PlusIcon className="h-4 w-4" />
            Añadir producto
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.rowId}
              className="rounded-xl border border-border/80 bg-card p-4 shadow-sm"
            >
              <input type="hidden" name="productRowId" value={row.rowId} />
              <input
                type="hidden"
                name={`product.${row.rowId}.id`}
                value={row.productId}
              />
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Producto {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground hover:text-red-600"
                  onClick={(event) => removeRow(event, row.rowId)}
                  disabled={rows.length === 1}
                >
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_0.9fr]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`product-name-${row.rowId}`}>Producto</Label>
                  <select
                    id={`product-name-${row.rowId}`}
                    name={`product.${row.rowId}.name`}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    defaultValue={row.name}
                  >
                    <option value="">Selecciona un producto...</option>
                    {availableProducts.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label} ({product.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`buy-type-${row.rowId}`}>
                    Tipo de compra
                  </Label>
                  <select
                    id={`buy-type-${row.rowId}`}
                    name={`product.${row.rowId}.buyType`}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={row.buyType}
                    onChange={(event) => updateBuyType(event, row.rowId)}
                  >
                    <option value="emision">Emisión</option>
                    <option value="ampliacion">Ampliación</option>
                    <option value="secundario">Secundario</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`entry-date-${row.rowId}`}>
                    Fecha compra
                  </Label>
                  <Input
                    id={`entry-date-${row.rowId}`}
                    name={`product.${row.rowId}.entryDate`}
                    type="date"
                    max="2200-01-01"
                    defaultValue={row.entryDate}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor={`compromiso-${row.rowId}`}>
                    Compromiso €
                  </Label>
                  <Input
                    id={`compromiso-${row.rowId}`}
                    name={`product.${row.rowId}.compromiso`}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    defaultValue={row.compromiso}
                  />
                </div>

                {row.buyType === 'secundario' ? (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={`valor-compra-${row.rowId}`}>
                      Valor compra %
                    </Label>
                    <Input
                      id={`valor-compra-${row.rowId}`}
                      name={`product.${row.rowId}.valorCompra`}
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="%"
                      defaultValue={row.valorCompra}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Label className="text-xs text-muted-foreground">
        Podrás volver aquí para ajustar el código o las posiciones del cliente
      </Label>
      <div>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
