export function Footer() {
  return (
    <footer className="bg-[var(--av-navy-950)] text-[var(--av-ink-300)] py-12 border-t border-[var(--av-navy-800)]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <div className="display text-2xl text-[var(--av-cream-50)]">
            Acqua<em className="italic text-[var(--av-lime-400)]">Ville</em>
          </div>
          <div className="mt-2 text-xs uppercase tracking-[0.22em]">
            Residencial · Santana, BA
          </div>
        </div>
        <div className="text-xs uppercase tracking-[0.18em]">
          © {new Date().getFullYear()} AcquaVille Empreendimentos. CRECI/BA 00000.
        </div>
        <div className="flex gap-6 text-xs uppercase tracking-[0.18em]">
          <a href="/admin" className="link-reveal hover:text-[var(--av-lime-400)]">
            Admin
          </a>
          <a href="#" className="link-reveal hover:text-[var(--av-lime-400)]">
            Política
          </a>
        </div>
      </div>
    </footer>
  );
}
