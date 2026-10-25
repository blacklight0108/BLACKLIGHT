import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Section } from './layout/Section'
import { SectionHead } from './SectionHead'
import { formatDate, formatSyncTime } from '../lib/data'
import type { UpItem, UpdatesData } from '../lib/types'

interface Props {
  ups: UpItem[]
  updates: UpdatesData
}

/** 雷达：固定在追的频道 + 各自最新几条投稿 */
export function Radar({ ups, updates }: Props) {
  const feeds = updates.feeds || {}
  const synced = formatSyncTime(updates.updatedAt)
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? ups : ups.slice(0, 6)

  return (
    <Section id="radar" className="section-anchor border-t border-ink/20">
      <SectionHead no="02" title="雷达" en="RADAR" note={synced ? `同步 ${synced}` : undefined} />

      {ups.length > 0 && (
        <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))' }}>
          {shown.map((up) => {
            const items = (up.mid ? feeds[up.mid] : undefined) ?? []
            return (
              <article key={up.mid || up.name} className="panel p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-ink/25 bg-paper-2">
                    {up.avatar && (
                      <img src={up.avatar} alt={up.name} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="fs-small truncate font-semibold text-ink">{up.name}</h3>
                    <p className="fs-micro truncate text-ink-faint">{up.note}</p>
                  </div>
                  {up.url && (
                    <a
                      href={up.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${up.name} 的主页`}
                      className="shrink-0 text-ink-mute transition-colors hover:text-red"
                    >
                      <ArrowUpRight size={16} />
                    </a>
                  )}
                </div>

                <ul className="mt-3">
                  {items.slice(0, 4).map((it) => (
                    <li key={it.bvid || it.url} className="border-t border-ink/10 py-1.5 first:border-t-0 first:pt-0">
                      <a
                        href={it.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline gap-2"
                      >
                        <span className="fs-micro shrink-0 text-ink-faint">{formatDate(it.pubdate)}</span>
                        <span className="fs-small line-clamp-2 text-ink-soft transition-colors group-hover:text-red">
                          {it.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      )}

      {ups.length > 6 && (
        <div className="mt-6">
          <button type="button" onClick={() => setExpanded((v) => !v)} className="btn">
            {expanded ? '收起' : `展开全部 · ${ups.length}`}
          </button>
        </div>
      )}
    </Section>
  )
}
