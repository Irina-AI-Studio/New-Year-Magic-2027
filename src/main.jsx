import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import { ChristmasTree, Sparkle } from './Tree'
import { Snowfall } from './Snowfall'
import { ornaments, wishes } from './config'
import '@fontsource-variable/cormorant-garamond/wght.css'
import '@fontsource-variable/manrope/wght.css'
import './style.css'

function WishCard({ id, reduced }) {
  const side = ornaments.find(item => item.id === id).x < 50 ? 'left' : 'right'
  const [title, message] = wishes[id]
  return <m.aside id={'wish-' + id} className={'wish-card ' + side}
    initial={{ opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : .97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 6 }}
    transition={{ duration: reduced ? 0 : .36 }}>
    <h2>{title}</h2>
    <p>{message}</p>
  </m.aside>
}

function FinalCelebration({ reduced, onReset, replayRef }) {
  return <m.section className="final" role="region" aria-label="Новогоднее поздравление"
    initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : .65 }}>
    <Sparkle />
    <h2><span>С Новым</span>{' '}<span>2027 годом!</span></h2>
    <p>Пусть все мечты сбудутся!</p>
    <button ref={replayRef} type="button" onClick={onReset}>Посмотреть волшебство ещё раз</button>
  </m.section>
}

function ChristmasScene() {
  const reduced = !!useReducedMotion()
  const [focusWish, setFocusWish] = useState(null)
  const [preview, setPreview] = useState(null)
  const [pinned, setPinned] = useState(null)
  const [visited, setVisited] = useState([])
  const [lastWish, setLastWish] = useState(null)
  const [phase, setPhase] = useState('explore')
  const tree = useRef(null)
  const burst = useRef(null)
  const replay = useRef(null)
  const active = phase === 'explore' ? preview || focusWish || pinned : lastWish
  const onSpark = useCallback((...args) => burst.current?.(...args), [])

  useEffect(() => {
    if (!active || phase !== 'explore') return
    const timer = window.setTimeout(() => {
      if (visited.includes(active)) return
      setVisited([...visited, active])
      if (visited.length + 1 === ornaments.length) {
        setLastWish(active)
        setPhase('reading')
      }
    }, 360)
    return () => window.clearTimeout(timer)
  }, [active, phase, visited])

  useEffect(() => {
    if (phase === 'reading') {
      const timer = window.setTimeout(() => {
        setLastWish(null)
        setPhase('glow')
      }, 4500)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'glow') {
      const timer = window.setTimeout(() => {
        const box = tree.current.getBoundingClientRect()
        onSpark(box.left + box.width / 2, box.top + box.height * .46, 120, box.width * 1.08)
        setPhase('final')
      }, reduced ? 0 : 760)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'final' && tree.current.contains(document.activeElement)) replay.current?.focus({ preventScroll: true })
  }, [phase, onSpark, reduced])

  useEffect(() => {
    function dismiss(event) {
      if (event.key !== 'Escape') return
      setPreview(null)
      setFocusWish(null)
      setPinned(null)
      setLastWish(null)
    }
    window.addEventListener('keydown', dismiss)
    return () => window.removeEventListener('keydown', dismiss)
  }, [])

  function select(id) {
    if (phase !== 'explore') return
    setPreview(null)
    setFocusWish(null)
    setPinned(current => current === id ? null : id)
  }

  function reset() {
    setPreview(null)
    setFocusWish(null)
    setPinned(null)
    setVisited([])
    setLastWish(null)
    setPhase('explore')
    document.getElementById('hero-title').focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }

  const celebrating = phase === 'glow' || phase === 'final'

  return <main className="scene" data-lit={celebrating ? 'celebration' : active ? 'wish' : 'idle'}>
    <div className="frame" aria-hidden="true"><i /><i /><i /><i /></div>
    <div className="bokeh" aria-hidden="true" />
    <header className="hero">
      <div className="year"><span /><Sparkle /> 2027 <Sparkle /><span /></div>
      <h1 id="hero-title" tabIndex="-1">Время новогоднего<br className="title-break" /> волшебства</h1>
      <p>На этой ёлке спрятаны четыре пожелания. Найди их все!</p>
    </header>
    <div className="tree-stage">
      <div className="tree-display">
        <ChristmasTree active={active} visited={visited} treeRef={tree} onSpark={onSpark}
          onPreview={id => setPreview(id)} onLeave={id => setPreview(current => current === id ? null : current)}
          onFocusWish={setFocusWish} onSelect={select} interactive={phase === 'explore'} />
        <AnimatePresence mode="wait">
          {active && <WishCard key={active} id={active} reduced={reduced} />}
        </AnimatePresence>
      </div>
      {phase === 'final' && <FinalCelebration reduced={reduced} onReset={reset} replayRef={replay} />}
    </div>
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {phase === 'final' ? 'С Новым 2027 годом! Пусть все мечты сбудутся!' : active ? wishes[active].join('. ') : ''}
    </div>
    <footer className="scene-footer">
      <div className="progress" role="status" aria-live="polite">
        <div className="markers" aria-hidden="true">{ornaments.map(item =>
          <span key={item.id} className={visited.includes(item.id) ? 'found' : ''} style={{ '--gem': item.tones[0] }} />)}</div>
        <span>{visited.length} из {ornaments.length} пожеланий</span>
      </div>
      <p className="hint">
        {visited.length === ornaments.length
          ? 'Все четыре пожелания открыты. Пусть волшебство продолжается!'
          : <><span>Наведи курсор на игрушки и открой пожелания</span><span>Нажми на игрушки и открой пожелания</span></>}
      </p>
    </footer>
    <Snowfall burst={burst} reduced={reduced} />
  </main>
}

export function App() {
  return <LazyMotion features={domAnimation} strict><ChristmasScene /></LazyMotion>
}

createRoot(document.getElementById('root')).render(<App />)
