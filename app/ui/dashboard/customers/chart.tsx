'use client';
import { toCurrency } from '@/app/lib/helpers';
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
  Cell,
  LabelList,
  Legend,
} from 'recharts';

export default function Chart({ data }: { data: any[] }) {
  return (
    <div className="mx-auto my-10 h-[420px] w-full rounded-xl border border-border/80 bg-card p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          margin={{ top: 16, right: 24, left: 24, bottom: 8 }}
          data={data}
        >
          <XAxis dataKey="Año" />
          <YAxis />
          <Tooltip formatter={(value) => toCurrency(value as number)} />
          <ReferenceLine y={0} stroke="#000" />
          <CartesianGrid vertical={false} />
          <Legend verticalAlign="top" height={36} />

          <Bar dataKey="Flujo neto anual" barSize={20} fill="#727272">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry['Flujo neto anual'] >= 0 ? '#c3d69b' : '#d99694'}
              />
            ))}
            <LabelList
              dataKey="Flujo neto anual"
              position="top"
              className="text-xs font-bold"
              formatter={(value) => toCurrency(Number(value ?? 0), false)}
            />
          </Bar>
          <Line type="monotone" dataKey="Flujo neto acumulado" stroke="#fc5203" />
          <Line
            type="monotone"
            dataKey="Evolución del Patrimonio"
            stroke="#8884d8"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
