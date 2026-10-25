import type { SiteInfo } from '../lib/types'
import { Bolt } from './Bolt'

export function Footer({ site }: { site: SiteInfo }) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink/20">
      <div
        className="container-fluid flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between"
        style={{ paddingInline: 'var(--section-px)' }}
      >
        <div className="flex items-center gap-2.5">
          <Bolt className="h-4 w-auto text-red" />
          <span className="display text-[1rem] tracking-[0.2em]">{site.nameEn || 'BLACKLIGHT'}</span>
          {site.tagline && <span className="fs-micro text-ink-faint">{site.tagline}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {(site.links || []).map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="fs-small text-ink-soft transition-colors hover:text-red"
            >
              {l.label}
            </a>
          ))}
          <span className="fs-micro text-ink-faint">© {year}</span>
        </div>
      </div>
    </footer>
  )
}
