import { Section } from './layout/Section'
import { SectionHead } from './SectionHead'
import type { ArticleItem } from '../lib/types'

interface Props {
  articles: ArticleItem[]
}

/** 文章：有几篇显示几篇，不设上限 */
export function Articles({ articles }: Props) {
  const list = articles.filter((a) => a.title)

  return (
    <Section id="writing" className={`section-anchor border-t border-ink/20${list.length === 0 ? ' section-tight' : ''}`}>
      <SectionHead no="03" title="文章" en="WRITING" />

      {list.length > 0 && (
        <ul>
          {list.map((a) => {
            const inner = (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="fs-heading font-semibold text-ink transition-colors group-hover:text-red">
                    {a.title}
                  </h3>
                  <span className="fs-micro shrink-0 text-ink-faint">{a.date}</span>
                </div>
                {a.excerpt && <p className="fs-small mt-1.5 max-w-3xl text-ink-mute">{a.excerpt}</p>}
              </>
            )

            return (
              <li key={a.id || a.title} className="border-t border-ink/12 first:border-t-0">
                {a.url ? (
                  <a href={a.url} className="group block py-4">
                    {inner}
                  </a>
                ) : (
                  <div className="group py-4">{inner}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
