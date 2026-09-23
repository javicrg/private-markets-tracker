'use client';

import { RadioGroup, RadioGroupItem } from '@/app/ui/shadcn/ui/radio-group';
import { Label } from '@/app/ui/shadcn/ui/label';
import { Input } from '@/app/ui/shadcn/ui/input';
import { useRef } from 'react';

export default function CreateProductEntry({ sendDataToParent }: any) {
  const entryDataRef = useRef({ type: '', date: '', percentage: 0 });

  function valueChanged(key: string, value: string | number) {
    entryDataRef.current = {
      ...entryDataRef.current,
      [key]: value,
    };
    sendDataToParent(entryDataRef.current);
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="type" className="text-right">
          Tipo
        </Label>
        <RadioGroup
          className="flex"
          onValueChange={(value: string) => valueChanged('type', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="realidad" id="realidad" />
            <Label htmlFor="realidad">Realidad</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="espectativa" id="espectativa" />
            <Label htmlFor="espectativa">Espectativa</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Fecha
        </Label>
        <Input
          id="name"
          className="col-span-3"
          type="date"
          max={'2200-01-01'}
          onChange={(e) => valueChanged('date', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Porcentaje</Label>
        <Input
          id="percentage"
          type="number"
          min={0}
          max={100}
          step=".01"
          placeholder="%"
          className="col-span-3"
          onChange={(e) =>
            valueChanged('percentage', parseFloat(e.target.value))
          }
        />
      </div>
    </div>
  );
}
