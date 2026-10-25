import { Section } from './layout/Section'
import { SectionHead } from './SectionHead'
import type { AlbumItem } from '../lib/types'

interface Props {
  albums: AlbumItem[]
}

/** 专辑架：有几条显示几条，不补空位、不设上限 */
export function Albums({ albums }: Props) {
  const list = albums.filter((a) => a.title || a.cover)

  return (
    <Section id="albums" className={`section-anchor border-t border-ink/20${list.length === 0 ? ' section-tight' : ''}`}>
      <SectionHead no="01" title="专辑" en="ALBUMS" />

      {list.length > 0 && (
        <div
          className="grid-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(150px, 100%), 1fr))' }}
        >
          {list.map((a) => (
            <figure key={a.id || a.title} className="min-w-0">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden border border-ink/30 bg-paper-2">
                {a.cover ? (
                  <img src={a.cover} alt={a.title || ''} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ink/25">
                    <span className="h-3 w-3 rounded-full bg-ink/30" />
                  </span>
                )}
              </div>
              <figcaption className="mt-2.5 min-w-0">
                <h3 className="fs-small truncate font-semibold text-ink">{a.title}</h3>
                <p className="fs-micro mt-0.5 truncate text-ink-faint">
                  {[a.artist, a.year].filter(Boolean).join(' · ')}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </Section>
  )
}
