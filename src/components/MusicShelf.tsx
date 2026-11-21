import { useEffect, useRef, useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Shuffle } from 'lucide-react'
import { playlist } from '../lib/playlist'
import './MusicShelf.css'
import { MusicLibrary } from './MusicLibrary'

const stamp = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`

export function MusicShelf() {
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const audio = useRef<HTMLAudioElement>(null)
  const controller = useRef<AbortController | null>(null)
  const objectUrl = useRef('')
  const current = useRef(0)
  const dragging = useRef(false)
  const track = playlist[selected]

  useEffect(() => {
    const element = audio.current
    const release = () => {
      controller.current?.abort()
      if (element) { element.pause(); element.removeAttribute('src'); element.load() }
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
      objectUrl.current = ''
    }
    const leave = () => { release(); setLoading(false); setPlaying(false); setPosition(0); setDuration(0) }
    window.addEventListener('pagehide', leave)
    return () => { window.removeEventListener('pagehide', leave); release() }
  }, [])

  async function choose(index: number) {
    const element = audio.current
    if (!element) return
    if (index === current.current && objectUrl.current) {
      if (!element.paused) { element.pause(); return }
      try { await element.play(); setError('') } catch { setError('请再点一次播放。') }
      return
    }
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    element.pause()
    element.removeAttribute('src')
    element.load()
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = ''
    current.current = index
    setSelected(index); setPosition(0); setDuration(0); setError(''); setPlaying(false); setLoading(true)
    try {
      // Pages may return 200 to Range requests. An in-memory Blob allows reliable seeking.
      const response = await fetch(playlist[index].src, { cache: 'no-store', signal: request.signal })
      if (!response.ok) throw new Error('Audio unavailable')
      const blob = await response.blob()
      if (request.signal.aborted) return
      objectUrl.current = URL.createObjectURL(blob)
      element.src = objectUrl.current
      element.load()
      setLoading(false)
      try { await element.play() } catch { if (!request.signal.aborted) setError('歌曲已就绪，点击播放开始。') }
    } catch {
      if (!request.signal.aborted) { setLoading(false); setError('载入失败，请点击播放重试。') }
    }
  }

  function step(direction: number) { void choose((current.current + direction + playlist.length) % playlist.length) }
  function shuffle() { void choose((current.current + 1 + Math.floor(Math.random() * (playlist.length - 1))) % playlist.length) }

  return (
    <div className="music-deck">
      <div className="music-layout">
      <div className="music-main">
        <button className="music-record" onClick={() => void choose(selected)} aria-label={playing ? '暂停' : '播放'} aria-busy={loading}>
          <span className={`music-vinyl ${playing ? 'is-playing' : ''}`}><img src={track.cover} alt={`${track.title} 封面`} /><span className="music-spindle" /></span>
          <span className="music-record-hint">{loading ? '载入中' : playing ? '点击暂停' : '点击播放'}</span>
        </button>
        <div className="music-info">
          <div className="music-eyebrow"><span>BLACKLIGHT / SELECTED SOUNDS</span><span>{String(selected + 1).padStart(2, '0')} / {playlist.length}</span></div>
          <h3 aria-live="polite">{track.title}</h3>
          <p className="music-artist">{track.artist} <span>· {track.album}</span></p>
          <audio ref={audio} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onLoadedMetadata={() => setDuration(Number.isFinite(audio.current?.duration) ? audio.current!.duration : 0)}
            onDurationChange={() => setDuration(Number.isFinite(audio.current?.duration) ? audio.current!.duration : 0)}
            onTimeUpdate={() => { if (!dragging.current) setPosition(audio.current?.currentTime || 0) }}
            onEnded={() => step(1)} onError={() => { if (objectUrl.current) { setPlaying(false); setError('无法解码音频，请切换歌曲重试。') } }} />
          <div className="music-progress">
            <input aria-label="播放进度" type="range" min="0" max={duration || 1} step="0.1" value={Math.min(position, duration || 1)} disabled={!duration || loading}
              onPointerDown={() => { dragging.current = true }} onPointerUp={() => { dragging.current = false }} onPointerCancel={() => { dragging.current = false }} onBlur={() => { dragging.current = false }}
              onChange={(e) => { const value = Number(e.target.value); setPosition(value); if (audio.current && duration) audio.current.currentTime = value }}
              aria-valuetext={`${stamp(position)} / ${stamp(duration)}`} />
            <div><span>{stamp(position)}</span><span>{loading ? '正在载入歌曲…' : stamp(duration)}</span></div>
          </div>
          <div className="music-controls">
            <button onClick={() => step(-1)} aria-label="上一首" title="上一首"><SkipBack size={21} /></button>
            <button className="music-play" onClick={() => void choose(selected)} aria-label={playing ? '暂停' : '播放'} disabled={loading}>{playing ? <Pause size={23} /> : <Play size={23} />}</button>
            <button onClick={() => step(1)} aria-label="下一首" title="下一首"><SkipForward size={21} /></button>
            <button onClick={shuffle} aria-label="随机听一首" title="随机听一首"><Shuffle size={19} /></button>
          </div>
          {error && <p role="alert" className="music-error">{error}</p>}
        </div>
      </div>
      <MusicLibrary selected={selected} playing={playing} choose={index => void choose(index)} />
      </div>
      <div className="music-footnote"><span>{playlist.length} 首</span><a href={track.source} target="_blank" rel="noopener noreferrer">封面来源</a></div>
    </div>
  )
}
