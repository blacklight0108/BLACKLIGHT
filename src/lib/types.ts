export interface SiteMeta {
  key: string
  value: string
}

export interface SiteLink {
  label: string
  url: string
}

export interface SiteInfo {
  name: string
  nameEn: string
  tagline: string
  intro: string
  about: string[]
  meta: SiteMeta[]
  links: SiteLink[]
}

export interface AlbumItem {
  id: string
  title: string
  artist: string
  year: string
  cover: string
  note: string
}

export interface ArticleItem {
  id: string
  title: string
  date: string
  excerpt: string
  url: string
}

export interface ImageItem {
  id: string
  src: string
  title: string
  desc: string
  tag: string
}

export interface UpItem {
  mid: string
  name: string
  note: string
  url: string
  avatar: string
}

export interface SiteContent {
  site: SiteInfo
  albums: AlbumItem[]
  articles: ArticleItem[]
  images: ImageItem[]
  ups: UpItem[]
}

export interface FeedEntry {
  title: string
  bvid: string
  url: string
  cover?: string
  pubdate?: string
}

export interface UpdatesData {
  updatedAt: string
  feeds: Record<string, FeedEntry[]>
}
