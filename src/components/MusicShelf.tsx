import { useEffect, useRef, useState } from 'react'
import { playlist } from '../lib/playlist'

export function MusicShelf() {
  const [selected, setSelected] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState('')
  const audio = useRef<HTMLAudioElement>(null)
  const requested = useRef(false)
  const track = playlist[selected]

  function play() {
    setError('')
    void audio.current?.play().catch((reason: DOMException) => {
      if (reason.name !== 'AbortError') setError('暂时无法播放，请点击播放按钮重试。')
    })
  }

  useEffect(() => {
    if (requested.current) play()
  }, [selected])

  function choose(index: number) {
    requested.current = true
    if (index === selected) {
      if (audio.current?.paused) play()
      else audio.current?.pause()
    } else {
      setError('')
      setPlaying(false)
      setSelected(index)
    }
  }

  function step(direction: number) {
    requested.current = true
    setError('')
    setPlaying(false)
    setSelected((current) => (current + direction + playlist.length) % playlist.length)
  }

  return (
    <div className="mb-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <p className="text-base text-ink-mute">把喜欢的声音，放在手边。点击封面开始听。</p>
        <span className="text-sm tracking-widest text-ink-faint">私人歌单 · {playlist.length} 首</span>
      </div>
      <div className="panel mb-7 grid gap-6 p-5 sm:grid-cols-[150px_1fr] sm:p-6">
        <img src={track.cover} alt={`${track.title} 封面`} className="aspect-square w-36 border border-ink/20 object-cover shadow-lg sm:w-full" />
        <div className="min-w-0 self-center">
          <p className="text-xs tracking-[0.2em] text-ink-faint">{playing ? 'NOW PLAYING' : 'ON THE RECORD'}</p>
          <h3 className="mt-2 text-2xl font-semibold text-ink" aria-live="polite">{track.title}</h3>
          <p className="mt-1 text-sm text-ink-mute">{track.artist} · {track.album}</p>
          <audio ref={audio} src={track.src} controls preload="none" className="mt-4 w-full"
            aria-label={`播放 ${track.title}`}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onEnded={() => step(1)} onError={() => { setPlaying(false); setError('音频加载失败，请稍后重试。') }} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" className="btn" onClick={() => step(-1)}>上一首</button>
            <button type="button" className="btn" onClick={() => step(1)}>下一首</button>
            <a href={track.source} target="_blank" rel="noopener noreferrer" className="ml-auto text-sm text-ink-mute underline underline-offset-4">封面来源</a>
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-red">{error}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
        {playlist.map((item, index) => (
          <button type="button" key={item.id} onClick={() => choose(index)} aria-pressed={selected === index}
            aria-label={`${selected === index && playing ? '暂停' : '播放'} ${item.title}，${item.artist}`}
            className="group min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
            <div className={`relative aspect-square overflow-hidden border transition-all duration-200 ${selected === index ? 'border-red ring-2 ring-red ring-offset-2' : 'border-ink/20 group-hover:-translate-y-1 group-hover:shadow-lg'}`}>
              <img src={item.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className={`absolute bottom-2 right-2 rounded-full px-3 py-1 text-xs font-semibold shadow ${selected === index ? 'bg-red text-white' : 'bg-white/95 text-black'}`}>
                {selected === index ? (playing ? '播放中' : '已选中') : '播放'}
              </span>
            </div>
            <h4 className="mt-3 truncate text-base font-semibold text-ink" title={item.title}>{item.title}</h4>
            <p className="mt-1 truncate text-sm text-ink-faint">{item.artist}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
