import type { PropsWithChildren } from 'react';
import { ParallaxBackground } from '../scenery/ParallaxBackground';

type PageShellProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  sceneryId?: string;
}>;

export function PageShell({ eyebrow, title, subtitle, sceneryId, children }: PageShellProps) {
  return (
    <main className="page-shell">
      <ParallaxBackground sceneryId={sceneryId} />
      <div className="page-shell__content">
        <header className="hero">
          {eyebrow ? <p className="hero__eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {subtitle ? <p className="hero__subtitle">{subtitle}</p> : null}
        </header>
        {children}
      </div>
    </main>
  );
}
