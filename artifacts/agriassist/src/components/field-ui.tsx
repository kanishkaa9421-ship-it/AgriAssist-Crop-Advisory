import { type ReactNode } from 'react';
import { AlertCircle, ArrowUpRight, Check, ChevronRight, Loader2, Sprout } from 'lucide-react';

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end animate-rise">
      <div>
        <p className="mb-2 font-mono-ui text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70">{eyebrow}</p>
        <h1 className="font-display text-4xl leading-[0.95] tracking-[-0.03em] text-foreground sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>}
        <h2 className="font-display text-2xl tracking-[-0.02em] text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'quiet' | 'danger' }) {
  const styles = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/88 shadow-[0_5px_0_hsl(var(--primary)/.16)]',
    outline: 'border border-border bg-card/70 text-foreground hover:border-primary/50 hover:bg-secondary/50',
    quiet: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
    danger: 'border border-destructive/25 bg-destructive/8 text-destructive hover:bg-destructive/15',
  };
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'lime' | 'orange' | 'teal' }) {
  const tones = {
    neutral: 'border-border bg-muted text-muted-foreground',
    lime: 'border-accent/40 bg-accent/25 text-primary',
    orange: 'border-orange-700/15 bg-orange-500/10 text-orange-800',
    teal: 'border-primary/15 bg-primary/10 text-primary',
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono-ui text-[10px] uppercase tracking-[0.12em] ${tones[tone]}`}>{children}</span>;
}

export function LoadingState({ label = 'Reading your field notes' }: { label?: string }) {
  return <div className="space-y-4" data-testid="status-loading">
    <div className="h-28 animate-pulse rounded-2xl bg-muted/75" />
    <div className="grid gap-4 sm:grid-cols-2"><div className="h-36 animate-pulse rounded-2xl bg-muted/65" /><div className="h-36 animate-pulse rounded-2xl bg-muted/65" /></div>
    <p className="flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[0.12em] text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> {label}</p>
  </div>;
}

export function ErrorState({ onRetry, label = 'We could not reach your field notes.' }: { onRetry?: () => void; label?: string }) {
  return <div className="rounded-2xl border border-destructive/25 bg-destructive/5 p-6" data-testid="status-error">
    <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 h-5 w-5 text-destructive" /><div><h3 className="font-semibold text-foreground">A rough patch</h3><p className="mt-1 text-sm text-muted-foreground">{label}</p>{onRetry && <Button variant="outline" className="mt-4" onClick={onRetry} data-testid="button-retry">Try again</Button>}</div></div>
  </div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center" data-testid="status-empty">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/25 text-primary"><Sprout className="h-6 w-6" /></div>
    <h3 className="font-display text-2xl">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}
  </div>;
}

export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/75">{children}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>;
}

export function CheckLine({ children, index }: { children: ReactNode; index: number }) {
  return <li className="flex gap-3 text-sm leading-6 text-foreground"><span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-primary"><Check className="h-3 w-3" /></span><span><span className="mr-2 font-mono-ui text-[10px] text-muted-foreground">0{index + 1}</span>{children}</span></li>;
}

export function ChevronAction({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">{children}<ChevronRight className="h-3.5 w-3.5" /></span>;
}