import { Albums } from '../components/Albums'
import { Articles } from '../components/Articles'
import { Games } from '../components/Games'
import { Photos } from '../components/Photos'
import { Radar } from '../components/Radar'
import type { SiteContent, UpdatesData } from '../lib/types'

export function Home({ content, updates }: { content: SiteContent; updates: UpdatesData }) {
  const { site, albums, articles, images, ups } = content

  return (
    <>
      <header
        id="top"
        className="border-b border-ink/20"
        style={{ paddingInline: 'var(--section-px)', paddingBlock: 'clamp(2.2rem, 5vw, 3.6rem)' }}
      >
        <div className="container-fluid grid items-center gap-8 md:grid-cols-[1.35fr_0.65fr]">
          <div className="min-w-0">
            <h1 className="display whitespace-nowrap text-ink" style={{ fontSize: 'var(--fs-hero)' }}>
              {site.nameEn || 'BLACKLIGHT'}
            </h1>
            {site.intro && <p className="fs-body mt-4 max-w-lg text-ink-soft">{site.intro}</p>}
          </div>

          <img
            src="/blacklight-mark.png"
            alt=""
            className="mx-auto w-[42%] max-w-[220px] md:ml-auto md:mr-0"
          />
        </div>
      </header>

      <Albums albums={albums || []} />
      <Radar ups={ups || []} updates={updates} />
      <Articles articles={articles || []} />
      <Photos images={images || []} />
      <Games />
    </>
  )
}
