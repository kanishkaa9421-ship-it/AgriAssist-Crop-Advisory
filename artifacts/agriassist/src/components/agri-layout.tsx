import { type ReactNode } from 'react';
import { BarChart3, BookOpen, CalendarDays, ChevronDown, CloudSun, Leaf, Menu, Plus, Sprout, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';

const navigation = [
  { href: '/', label: 'Field overview', icon: BarChart3 },
  { href: '/crops', label: 'My crops', icon: Leaf },
  { href: '/history', label: 'Advisory journal', icon: BookOpen },
];

export function AgriLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[255px] flex-col bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-sidebar-primary text-sidebar-primary-foreground"><Sprout className="h-5 w-5" /></span>
            <span><span className="block font-display text-2xl leading-none">AgriAssist</span><span className="mt-1 block font-mono-ui text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/50">Your field companion</span></span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/60 md:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X className="h-5 w-5" /></button>
        </div>
        <div className="mb-3 px-3 font-mono-ui text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/45">Navigate</div>
        <nav className="space-y-1" aria-label="Primary navigation">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${active ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon className="h-[17px] w-[17px]" />{label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}</Link>;
          })}
        </nav>
        <div className="my-8 h-px bg-sidebar-border" />
        <div className="mb-3 px-3 font-mono-ui text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/45">Quick fieldwork</div>
        <Link href="/advisory/new" onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-xl bg-sidebar-primary px-3 py-3 text-sm font-bold text-sidebar-primary-foreground shadow-[0_5px_0_hsl(var(--sidebar-primary)/.15)] hover:-translate-y-0.5" data-testid="link-new-advisory"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary-foreground/15"><Plus className="h-4 w-4" /></span>Ask for advice</Link>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/45 p-4">
          <div className="mb-3 flex items-center gap-2 text-sidebar-primary"><CloudSun className="h-4 w-4" /><span className="font-mono-ui text-[10px] uppercase tracking-[0.15em]">In the field</span></div>
          <p className="text-xs leading-5 text-sidebar-foreground/65">Good records make good seasons. Keep today’s observations close.</p>
        </div>
        <div className="mt-5 flex items-center gap-3 px-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/15 font-mono-ui text-xs text-sidebar-primary">FM</div><div><p className="text-xs font-semibold">Field manager</p><p className="font-mono-ui text-[9px] text-sidebar-foreground/45">Season 04 · Growing</p></div><ChevronDown className="ml-auto h-4 w-4 text-sidebar-foreground/40" /></div>
      </aside>
      {open && <button className="fixed inset-0 z-30 bg-sidebar/40 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu overlay" data-testid="button-menu-overlay" />}
      <div className="md:pl-[255px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/88 px-5 backdrop-blur-md md:px-10">
          <button onClick={() => setOpen(true)} className="rounded-xl border border-border bg-card p-2 md:hidden" aria-label="Open navigation" data-testid="button-open-navigation"><Menu className="h-5 w-5" /></button>
          <div className="hidden items-center gap-2 text-muted-foreground md:flex"><CalendarDays className="h-4 w-4" /><span className="font-mono-ui text-[10px] uppercase tracking-[0.16em]">Growing season 04</span></div>
          <div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-xs font-semibold">Morning, farmer</span><span className="block font-mono-ui text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Ready for the day?</span></span><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-mono-ui text-xs font-medium text-primary-foreground">FM</div></div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}