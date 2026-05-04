import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/registry", label: "Registry" },
  { href: "/infra", label: "Infra" },
];

export function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-zinc-100">
          Governance
        </Link>
        <div className="flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
