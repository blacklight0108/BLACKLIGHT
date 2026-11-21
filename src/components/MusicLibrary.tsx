import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { playlist } from '../lib/playlist'
import { artistPortraits } from '../lib/artistPortraits'

const artists = [...new Set(playlist.map(track => track.artist))]

function ArtistPortrait({ name }: { name: string }) {
  const [failed, setFailed] = useState(false)
  const image = artistPortraits[name]?.image
  return image && !failed
    ? <img src={image} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    : <span className="music-library-initial" aria-hidden="true">{name.slice(0, 1)}</span>
}

export function MusicLibrary({ selected, playing, choose }: { selected: number; playing: boolean; choose: (index: number) => void }) {
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const current = playlist[selected]
  const albums = [...new Map(playlist.filter(track => track.artist === artist).map(track => [track.album, track.cover]))]
  const portrait = artistPortraits[current.artist]
  const ordered = [current.artist, ...artists.filter(name => name !== current.artist)]

  return (
    <div className="music-library">
      <div className="music-library-current">
        <ArtistPortrait key={current.artist} name={current.artist} />
        <div><small>当前歌手</small><h4>{current.artist}</h4></div>
      </div>
      <nav className="music-library-nav" aria-label="音乐目录">
        {artist ? <button type="button" onClick={() => { setArtist(''); setAlbum('') }}>歌手</button> : <strong>歌手</strong>}
        {artist && <><ChevronRight size={14} />{album ? <button type="button" onClick={() => setAlbum('')}>{artist}</button> : <strong>{artist}的专辑</strong>}</>}
        {album && <><ChevronRight size={14} /><strong>{album}</strong></>}
      </nav>
      <div className="music-queue-scroll">
        {!artist && ordered.map(name => <button type="button" key={name} className="music-row" onClick={() => setArtist(name)}>
          <ArtistPortrait name={name} />
          <strong>{name}</strong><ChevronRight className="music-row-status" size={17} />
        </button>)}
        {artist && !album && albums.map(([name, cover]) => <button type="button" key={name} className="music-row" onClick={() => setAlbum(name)}>
          <img src={cover} alt="" loading="lazy" /><strong>{name}</strong><ChevronRight className="music-row-status" size={17} />
        </button>)}
        {album && playlist.map((track, index) => track.artist === artist && track.album === album && (
          <button type="button" key={track.id} className={`music-row ${index === selected ? 'is-selected' : ''}`} onClick={() => choose(index)} aria-pressed={index === selected && playing}>
            <strong>{track.title}</strong><span className="music-row-status">{index === selected && playing ? '暂停' : '播放'}</span>
          </button>
        ))}
      </div>
      {portrait && <a className="music-portrait-source" href={portrait.source} target="_blank" rel="noopener noreferrer">肖像来源</a>}
    </div>
  )
}
