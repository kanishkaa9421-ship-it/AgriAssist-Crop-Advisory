import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6"><div className="max-w-md text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/30 text-primary"><Compass className="h-8 w-8" /></div><p className="mt-7 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground">404 · Field boundary</p><h1 className="mt-3 font-display text-5xl">This path is unplanted.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">The page you are looking for is not in this season’s notebook.</p><Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground" data-testid="link-not-found-home"><ArrowLeft className="h-4 w-4" /> Return to overview</Link></div></div>;
}
