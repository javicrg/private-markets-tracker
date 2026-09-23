'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DashboardMetrics = {
  totals: {
    customers: number;
    products: number;
    assignedProducts: number;
    positions: number;
    totalCommitment: number;
    avgCommitmentPerCustomer: number;
    upcomingEvents: number;
  };
  buyTypeDistribution: Array<{
    buyType: string;
    label: string;
    value: number;
  }>;
  topProductsByCommitment: Array<{
    label: string;
    commitment: number;
    positions: number;
    customers: number;
  }>;
  yearlyActivity: Array<{
    year: string;
    capitalCallEvents: number;
    distributionEvents: number;
    capitalCallPct: number;
    distributionPct: number;
  }>;
};

const PIE_COLORS = ['#0f766e', '#d97706', '#7c3aed'];

function formatCurrency(value: number) {
  return `${Math.floor(value).toLocaleString('es-ES')} €`;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export default function OverviewCharts({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">
              Compromiso por fondo
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Top fondos por volumen comprometido y numero de posiciones.
            </p>
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.topProductsByCommitment}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={64}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={formatCompact}
              />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Legend />
              <Bar
                dataKey="commitment"
                name="Compromiso"
                radius={[4, 4, 0, 0]}
                fill="#0f766e"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Mezcla de entradas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Distribucion de posiciones por tipo de compra.
          </p>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.buyTypeDistribution}
                dataKey="value"
                nameKey="label"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
              >
                {metrics.buyTypeDistribution.map((entry, index) => (
                  <Cell
                    key={entry.buyType}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm xl:col-span-2">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Calendario agregado por ano
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Numero de capital calls y distribuciones registradas en el universo
            de fondos.
          </p>
        </div>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={metrics.yearlyActivity}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="capitalCallEvents"
                name="Capital calls"
                fill="#0f766e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="distributionEvents"
                name="Distribuciones"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
