import type { ReactNode } from 'react'

interface SectionHeadProps {
  no: string
  title: string
  en: string
  note?: string
  children?: ReactNode
}

/** 板块标题：编号 + 中文标题 + 英文小字 + 右侧备注，下面一条墨线 */
export function SectionHead({ no, title, en, note, children }: SectionHeadProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-3">
          <span className="label text-red">{no}</span>
          <h2 className="display text-ink" style={{ fontSize: 'var(--fs-display)' }}>
            {title}
          </h2>
          <span className="label hidden sm:inline">{en}</span>
        </div>
        {note && <span className="fs-micro text-ink-faint">{note}</span>}
      </div>
      {children && <p className="fs-small mt-3 max-w-2xl text-ink-mute">{children}</p>}
      <div className="rule mt-5" />
    </div>
  )
}
