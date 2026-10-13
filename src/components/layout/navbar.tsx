import Link from "next/link";

const links = [
  { href: "/productos", label: "Productos" },
  { href: "/productos?categoria=cosplay-completo", label: "Cosplay" },
  { href: "/productos?categoria=props", label: "Props" },
  { href: "/productos?categoria=calzado", label: "Calzado" },
];

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-sm font-medium tracking-[0.2em] uppercase">
          Argentina Cosplay
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/carrito" className="hover:text-muted">
            Carrito
          </Link>
          <Link href="/login" className="hover:text-muted">
            Ingresar
          </Link>
        </div>
      </div>
    </header>
  );
}
