import { useEffect, useState } from 'react'
import type { SiteContent, UpdatesData } from './types'

export const FALLBACK_CONTENT: SiteContent = {
  site: {
    name: 'BLACKLIGHT',
    nameEn: 'BLACKLIGHT',
    tagline: '',
    intro: '',
    about: [],
    meta: [],
    links: [],
  },
  albums: [],
  articles: [],
  images: [],
  ups: [],
}

export const FALLBACK_UPDATES: UpdatesData = { updatedAt: '', feeds: {} }

/** 读取静态 JSON；文件缺失或格式错时回退到内置默认值，保证页面不白屏。 */
function useJson<T>(url: string, fallback: T): T {
  const [data, setData] = useState<T>(fallback)

  useEffect(() => {
    let alive = true
    fetch(url, { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: T) => {
        if (alive) setData(json)
      })
      .catch(() => {
        /* 保持 fallback */
      })
    return () => {
      alive = false
    }
  }, [url])

  return data
}

export const useContent = () => useJson<SiteContent>('/content.json', FALLBACK_CONTENT)
export const useUpdates = () => useJson<UpdatesData>('/data/updates.json', FALLBACK_UPDATES)

export function formatDate(value?: string): string {
  if (!value) return ''
  const ts = Number(value)
  const date = Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000) : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  // 全站统一 UTC：不管访客在哪个时区，看到的日期都一样
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(date.getUTCDate()).padStart(2, '0')
  return `${mm}.${dd}`
}

/** 抓取时间统一显示成 UTC，例：2026-10-25 08:55 UTC */
export function formatSyncTime(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value.slice(0, 16).replace('T', ' ')
  const p = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())} ${p(
    date.getUTCHours(),
  )}:${p(date.getUTCMinutes())} UTC`
}
