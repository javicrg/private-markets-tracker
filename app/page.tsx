import { Show, SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Private Markets
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Portfolio tracker
        </h1>
        <p className="mt-3 text-muted-foreground">
          Inicia sesión para gestionar clientes y productos.
        </p>

        <Show when="signed-out">
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-lg bg-brand px-4 py-2.5 font-medium text-brand-foreground transition-opacity hover:opacity-90">
                Inicia sesión
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="rounded-lg border border-border px-4 py-2.5 font-medium transition-colors hover:bg-secondary">
                Regístrate
              </button>
            </SignUpButton>
          </div>
        </Show>

        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="mt-8 inline-flex rounded-lg bg-brand px-4 py-2.5 font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Ir al dashboard
          </Link>
        </Show>
      </section>
    </main>
  );
}
