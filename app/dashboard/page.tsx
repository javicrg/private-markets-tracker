import { getDashboardMetrics } from '@/app/lib/sql';
import { toCurrency } from '@/app/lib/helpers';
import OverviewCharts from '@/app/ui/dashboard/overview-charts';

export const dynamic = 'force-dynamic';

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-card-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export default async function Page() {
  const metrics = await getDashboardMetrics();

  return (
    <main className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Vista general de clientes, fondos y actividad prevista.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label="Compromiso total"
          value={toCurrency(metrics.totals.totalCommitment)}
          hint={`${metrics.totals.positions} posiciones activas`}
        />
        <StatCard
          label="Clientes"
          value={metrics.totals.customers.toString()}
          hint={`${metrics.totals.products} fondos cargados en la base`}
        />
        <StatCard
          label="Ticket medio por cliente"
          value={toCurrency(metrics.totals.avgCommitmentPerCustomer)}
          hint={`${metrics.totals.assignedProducts} fondos con inversores`}
        />
        <StatCard
          label="Eventos proximos"
          value={metrics.totals.upcomingEvents.toString()}
          hint="Capital calls y distribuciones dentro de los proximos 12 meses"
        />
      </section>

      <OverviewCharts metrics={metrics} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-card-foreground">
              Fondos con mayor exposicion
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranking por compromiso acumulado entre todos los clientes.
            </p>
          </div>
          <div className="space-y-4">
            {metrics.topProductsByCommitment.map((product, index) => (
              <div
                key={product.label}
                className="grid grid-cols-[32px_1.4fr_1fr_1fr] items-center gap-3 border-t border-border/60 pt-4 first:border-t-0 first:pt-0"
              >
                <div className="text-sm font-medium text-muted-foreground">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">
                    {product.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.positions} posiciones
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.customers} clientes
                </div>
                <div className="text-right text-sm font-medium text-card-foreground">
                  {toCurrency(product.commitment)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-card-foreground">
              Lectura rapida
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Algunos ratios utiles para tomar el pulso a la cartera.
            </p>
          </div>
          <dl className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <dt className="text-sm text-muted-foreground">Posiciones por cliente</dt>
              <dd className="text-sm font-medium text-card-foreground">
                {metrics.totals.customers
                  ? (
                      metrics.totals.positions / metrics.totals.customers
                    ).toFixed(1)
                  : '0.0'}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <dt className="text-sm text-muted-foreground">Compromiso por posicion</dt>
              <dd className="text-sm font-medium text-card-foreground">
                {metrics.totals.positions
                  ? toCurrency(
                      metrics.totals.totalCommitment / metrics.totals.positions
                    )
                  : toCurrency(0)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <dt className="text-sm text-muted-foreground">
                Eventos medios por ano
              </dt>
              <dd className="text-sm font-medium text-card-foreground">
                {metrics.yearlyActivity.length
                  ? (
                      metrics.yearlyActivity.reduce(
                        (sum, year) =>
                          sum +
                          year.capitalCallEvents +
                          year.distributionEvents,
                        0
                      ) / metrics.yearlyActivity.length
                    ).toFixed(1)
                  : '0.0'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">
                Fondos sin asignacion a clientes
              </dt>
              <dd className="text-sm font-medium text-card-foreground">
                {Math.max(
                  metrics.totals.products - metrics.totals.assignedProducts,
                  0
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
