import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { label: '专辑', en: 'ALBUMS', id: 'albums' },
  { label: '雷达', en: 'RADAR', id: 'radar' },
  { label: '文章', en: 'WRITING', id: 'writing' },
  { label: '图片', en: 'PHOTOS', id: 'photos' },
  { label: '游戏', en: 'GAMES', id: 'games' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('albums')

  useEffect(() => {
    const onScroll = () => {
      let current = ''
      for (const l of LINKS) {
        const el = document.getElementById(l.id)
        if (el && el.getBoundingClientRect().top <= 140) current = l.id
      }
      if (current) setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-ink/20 bg-paper/95 backdrop-blur">
      <div
        className="container-fluid flex items-center justify-between gap-4"
        style={{ paddingInline: 'var(--section-px)', paddingBlock: '0.55rem' }}
      >
        <a href="#top" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src="/blacklight-mark.png" alt="" className="h-8 w-auto" />
          <span className="display text-[1.05rem] tracking-[0.22em] text-ink">BLACKLIGHT</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`relative py-1.5 text-[0.82rem] tracking-[0.12em] transition-colors ${
                active === l.id ? 'text-red' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {l.label}
              <span className="ml-1.5 text-[0.58rem] tracking-[0.2em] text-ink-faint">{l.en}</span>
              {active === l.id && <span className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-red" />}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? '收起菜单' : '展开菜单'}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center border border-ink/40 text-ink md:hidden"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink/15 bg-paper md:hidden">
          <div style={{ paddingInline: 'var(--section-px)' }}>
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-ink/10 py-3.5 last:border-b-0"
              >
                <span className="text-[0.95rem] tracking-[0.1em]">{l.label}</span>
                <span className="label text-[0.55rem]">{l.en}</span>
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
