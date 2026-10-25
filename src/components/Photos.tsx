import { Section } from './layout/Section'
import { SectionHead } from './SectionHead'
import type { ImageItem } from '../lib/types'

interface Props {
  images: ImageItem[]
}

/** 图片：有几张显示几张，不补空位、不设上限 */
export function Photos({ images }: Props) {
  const list = images.filter((i) => i.src)

  return (
    <Section id="photos" className={`section-anchor border-t border-ink/20${list.length === 0 ? ' section-tight' : ''}`}>
      <SectionHead no="04" title="图片" en="PHOTOS" />

      {list.length > 0 && (
        <div
          className="grid-auto"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))' }}
        >
          {list.map((item) => (
            <figure key={item.id || item.src} className="min-w-0">
              <div className="relative aspect-[4/3] overflow-hidden border border-ink/30">
                <a href={item.src} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                  <img
                    src={item.src}
                    alt={item.title || ''}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </a>
              </div>
              {(item.title || item.desc) && (
                <figcaption className="mt-2">
                  <h3 className="fs-small font-semibold text-ink">{item.title}</h3>
                  {item.desc && <p className="fs-micro mt-0.5 text-ink-faint">{item.desc}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </Section>
  )
}
