import { memo } from 'react'
import treeImage from './assets/tree.webp'
import { lights, ornaments, star, wishes } from './config'

export function Sparkle({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c1.2 8 4 10.8 12 12-8 1.2-10.8 4-12 12C10.8 16 8 13.2 0 12 8 10.8 10.8 8 12 0Z" />
  </svg>
}

const position = ({ x, y }) => ({ left: x + '%', top: y + '%' })

function sparkleAt(element, onSpark, count, verticalOffset = 0) {
  const bounds = element.getBoundingClientRect()
  onSpark(bounds.left + bounds.width / 2, bounds.top + bounds.height * (.5 + verticalOffset), count)
}

function GlassBall({ id, tones: [bright, middle, deep] }) {
  return <svg viewBox="0 0 76 88" aria-hidden="true">
    <defs>
      <radialGradient id={id + '-glass'} cx=".34" cy=".3" r=".74" fx=".29" fy=".23">
        <stop stopColor={bright} /><stop offset=".42" stopColor={middle} />
        <stop offset=".8" stopColor={deep} /><stop offset=".95" stopColor={deep} />
        <stop offset="1" stopColor={middle} />
      </radialGradient>
      <linearGradient id={id + '-bounce'} x1="0" y1="1" x2="1" y2="0">
        <stop stopColor="#eab968" stopOpacity=".08" /><stop offset=".58" stopColor="#ffe2a0" stopOpacity=".7" />
        <stop offset="1" stopColor="#fff9e4" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id + '-cap'}>
        <stop stopColor="#63411e" /><stop offset=".38" stopColor="#f5d693" />
        <stop offset=".67" stopColor="#a57030" /><stop offset=".83" stopColor="#fff1bf" />
        <stop offset="1" stopColor="#775025" />
      </linearGradient>
      <radialGradient id={id + '-shine'}>
        <stop stopColor="#fff8eb" stopOpacity=".89" /><stop offset="1" stopColor="#fff8eb" stopOpacity="0" />
      </radialGradient>
    </defs>
    <path d="M38 1v9m-4 2v-3a4 4 0 0 1 8 0v3" fill="none" stroke="#d8ad66" strokeWidth="1.3" />
    <circle cx="38" cy="50" r="31" fill={'url(#' + id + '-glass)'} stroke={bright} strokeOpacity=".44" />
    <ellipse cx="26" cy="35" rx="13" ry="7" transform="rotate(-36 26 35)" fill={'url(#' + id + '-shine)'} />
    <path d="M47 76a28 28 0 0 0 17-19" fill="none" stroke={bright} strokeOpacity=".4" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 53c6 17 23 25 39 21" fill="none" stroke={'url(#' + id + '-bounce)'} strokeWidth="2.3" strokeLinecap="round" />
    <path d="M19 36c3-5 8-9 14-11" fill="none" stroke="#fff9ee" strokeWidth="1.5" strokeOpacity=".54" strokeLinecap="round" />
    <ellipse cx="25" cy="35" rx="5.7" ry="1.5" transform="rotate(-36 25 35)" fill="#fff8ea" opacity=".54" />
    <circle cx="48" cy="28" r="1.45" fill="#fff3cf" opacity=".75" />
    <circle cx="55" cy="31" r=".9" fill="#fff3cf" opacity=".7" />
    <circle cx="58" cy="36" r=".6" fill="#fff3cf" opacity=".5" />
    <rect x="29" y="11" width="18" height="12" rx="2" fill={'url(#' + id + '-cap)'} />
    <path d="M32 13v8m4-8v8m4-8v8m4-8v8" stroke="#5e3a18" opacity=".45" />
  </svg>
}

export function Ornament({ item, opened, seen, onPreview, onLeave, onFocusWish, onSelect, onSpark, interactive }) {
  const { id, tones } = item
  return <button type="button" className="ornament" style={position(item)}
    aria-label={wishes[id][0]} aria-expanded={opened}
    aria-controls={opened ? 'wish-' + id : undefined}
    data-seen={seen}
    aria-disabled={!interactive}
    tabIndex={interactive ? undefined : -1}
    onPointerEnter={event => {
      if (!interactive || event.pointerType !== 'mouse' || !matchMedia('(any-hover: hover)').matches) return
      onPreview(id)
      sparkleAt(event.currentTarget, onSpark, 8, .11)
    }}
    onPointerLeave={event => event.pointerType === 'mouse' && onLeave(id)}
    onFocus={event => {
      if (!interactive || !event.currentTarget.matches(':focus-visible')) return
      onFocusWish(id)
      sparkleAt(event.currentTarget, onSpark, 8, .11)
    }}
    onBlur={() => onFocusWish(null)}
    onClick={event => {
      if (!interactive) return
      if (event.nativeEvent.pointerType === 'touch' && !opened) sparkleAt(event.currentTarget, onSpark, 8, .11)
      onSelect(id)
    }}>
    {item.image ? <img src={item.image} alt="" /> : <GlassBall id={id} tones={tones} />}
  </button>
}

export const FairyLights = memo(function FairyLights() {
  return <svg className="fairy-lights" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    {lights.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? '.28' : '.39'}
      style={{ '--delay': -(i * .73 % 5) + 's', '--duration': (2.8 + i % 5 * .56) + 's' }} />)}
  </svg>
})

export function MagicStar({ onSpark }) {
  return <button className="magic-star" type="button" style={position(star)} aria-label="Зажечь золотую звезду"
    onClick={event => {
      sparkleAt(event.currentTarget, onSpark, 34)
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const halo = event.currentTarget.firstElementChild
        halo.getAnimations().filter(animation => animation.id === 'spark').forEach(animation => animation.cancel())
        const flare = halo.animate([{ filter: 'brightness(3)' }, { filter: 'brightness(1.85)' }], { duration: 850, easing: 'ease-out' })
        flare.id = 'spark'
      }
    }}><span /></button>
}

export function ChristmasTree({ active, visited, onPreview, onLeave, onFocusWish, onSelect, onSpark, treeRef, interactive }) {
  return <div className="tree" ref={treeRef}>
    <div className="tree-shadow" />
    <img className="tree-image" src={treeImage} width="800" height="1200" alt="Пышная новогодняя ёлка с золотой звездой" fetchPriority="high" />
    <FairyLights />
    <MagicStar onSpark={onSpark} />
    {ornaments.map(item => <Ornament key={item.id} item={item} opened={active === item.id}
      seen={visited.includes(item.id)} onPreview={onPreview} onLeave={onLeave} onFocusWish={onFocusWish} onSelect={onSelect} onSpark={onSpark} interactive={interactive} />)}
  </div>
}
