import { useCallback, useEffect, useRef, useState } from 'react'
import { Section } from './layout/Section'
import { SectionHead } from './SectionHead'
import { Bolt } from './Bolt'

const TONES = ['#d8381f', '#14657a', '#14100c', '#e6dcc6']

function readBest(key: string): number {
  if (typeof window === 'undefined') return 0
  return Number(window.localStorage.getItem(key) || 0)
}

function writeBest(key: string, value: number) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, String(value))
}

/* ── 一、记忆序列 ───────────────────────────────── */
function SequenceGame() {
  const [seq, setSeq] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [phase, setPhase] = useState<'idle' | 'show' | 'input' | 'over'>('idle')
  const [pos, setPos] = useState(0)
  const [best, setBest] = useState(() => readBest('bl_seq_best'))
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const play = useCallback((s: number[]) => {
    clearTimers()
    setLit(null)
    setPhase('show')
    s.forEach((v, i) => {
      timers.current.push(window.setTimeout(() => setLit(v), i * 560))
      timers.current.push(window.setTimeout(() => setLit(null), i * 560 + 330))
    })
    timers.current.push(
      window.setTimeout(() => {
        setPhase('input')
        setPos(0)
      }, s.length * 560 + 60)
    )
  }, [])

  useEffect(() => clearTimers, [])

  const start = () => {
    const s = [Math.floor(Math.random() * 4)]
    setSeq(s)
    play(s)
  }

  const nextRound = (s: number[]) => {
    const n = [...s, Math.floor(Math.random() * 4)]
    setSeq(n)
    play(n)
  }

  const tap = (i: number) => {
    if (phase !== 'input') return
    setLit(i)
    window.setTimeout(() => setLit(null), 150)

    if (seq[pos] !== i) {
      setPhase('over')
      const score = Math.max(0, seq.length - 1)
      if (score > best) {
        setBest(score)
        writeBest('bl_seq_best', score)
      }
      return
    }
    if (pos + 1 === seq.length) {
      setPhase('show')
      timers.current.push(window.setTimeout(() => nextRound(seq), 620))
    } else {
      setPos(pos + 1)
    }
  }

  const status =
    phase === 'idle'
      ? '按开始，看它亮，然后照着顺序点。'
      : phase === 'show'
        ? '看好顺序…'
        : phase === 'input'
          ? `轮到你 · 第 ${pos + 1} / ${seq.length} 下`
          : `错了 · 这局 ${Math.max(0, seq.length - 1)} 分`

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="fs-subheading font-semibold text-ink">记忆序列</h3>
        <span className="fs-micro text-ink-faint">最高 {best}</span>
      </div>
      <p className="fs-micro mt-1 text-ink-mute">{status}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {TONES.map((color, i) => (
          <button
            key={color}
            type="button"
            onClick={() => tap(i)}
            aria-label={`第 ${i + 1} 个`}
            className="aspect-[3/2] transition-all duration-100"
            style={{
              background: color,
              border: '1px solid rgba(20,16,12,0.35)',
              opacity: lit === i ? 1 : 0.72,
              transform: lit === i ? 'scale(0.96)' : 'scale(1)',
              boxShadow: lit === i ? `0 0 0 3px ${color}55` : 'none',
              cursor: phase === 'input' ? 'pointer' : 'default',
            }}
          />
        ))}
      </div>

      <button type="button" onClick={start} className="btn btn-solid mt-4 justify-center">
        {phase === 'idle' ? '开始' : '重来'}
      </button>
    </div>
  )
}

/* ── 二、反应测试 ───────────────────────────────── */
function ReactionGame() {
  const [phase, setPhase] = useState<'idle' | 'wait' | 'go' | 'early' | 'done'>('idle')
  const [ms, setMs] = useState(0)
  const [best, setBest] = useState(() => readBest('bl_rt_best'))
  const startAt = useRef(0)
  const timer = useRef<number | null>(null)

  const arm = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setPhase('wait')
    timer.current = window.setTimeout(() => {
      startAt.current = performance.now()
      setPhase('go')
    }, 1200 + Math.random() * 2200)
  }

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  const hit = () => {
    if (phase === 'wait') {
      if (timer.current) window.clearTimeout(timer.current)
      setPhase('early')
      return
    }
    if (phase === 'go') {
      const value = Math.round(performance.now() - startAt.current)
      setMs(value)
      setPhase('done')
      if (!best || value < best) {
        setBest(value)
        writeBest('bl_rt_best', value)
      }
      return
    }
    arm()
  }

  const bg = phase === 'go' ? '#d8381f' : phase === 'wait' ? '#14657a' : '#efe8d8'
  const fg = phase === 'go' || phase === 'wait' ? '#f7f3e9' : '#14100c'
  const text =
    phase === 'idle'
      ? '点一下开始'
      : phase === 'wait'
        ? '等它变红'
        : phase === 'go'
          ? '点！'
          : phase === 'early'
            ? '抢跑了，再来'
            : `${ms} 毫秒`

  return (
    <div className="panel flex flex-col p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="fs-subheading font-semibold text-ink">反应测试</h3>
        <span className="fs-micro text-ink-faint">最快 {best ? `${best} 毫秒` : '—'}</span>
      </div>
      <p className="fs-micro mt-1 text-ink-mute">等方块变红再点，抢跑算失败。</p>

      <button
        type="button"
        onClick={hit}
        className="mt-4 flex flex-1 items-center justify-center px-4 py-10 transition-colors duration-150"
        style={{ background: bg, color: fg, border: '1px solid rgba(20,16,12,0.35)', minHeight: '9rem' }}
      >
        <span className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[0.08em]">
          {phase === 'go' && <Bolt className="h-4 w-auto" />}
          {text}
        </span>
      </button>

      <button type="button" onClick={arm} className="btn mt-4 justify-center">
        {phase === 'idle' ? '开始' : '再测一次'}
      </button>
    </div>
  )
}

/* ── 板块 ───────────────────────────────────────── */
export function Games() {
  return (
    <Section id="games" className="section-anchor border-t border-ink/20">
      <SectionHead no="05" title="游戏" en="GAMES" />

      <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))' }}>
        <SequenceGame />
        <ReactionGame />
      </div>
    </Section>
  )
}
