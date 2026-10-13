import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="flex min-h-[70vh] flex-col items-start justify-center gap-6 py-24">
        <p className="text-sm tracking-[0.2em] text-muted uppercase">Hecho por cosplayers, para cosplayers</p>
        <h1 className="max-w-2xl text-4xl leading-tight font-medium sm:text-6xl">
          Cosplay, props y calzado hechos en Argentina.
        </h1>
        <p className="max-w-md text-muted">
          Piezas de cosmakers independientes. Envíos a todo el país.
        </p>
        <Link
          href="/productos"
          className="mt-4 border border-foreground px-6 py-3 text-sm tracking-wide uppercase transition hover:bg-foreground hover:text-background"
        >
          Ver productos
        </Link>
      </section>
    </div>
  );
}
