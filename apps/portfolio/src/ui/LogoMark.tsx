import { useId } from 'react'
import './logo-mark.css'

/*
 * The SP mark: an angular S and P interlocked on a rounded tile. The tile has no fill of its own, so it is
 * the page's own surface, whatever the theme; only the shadow layer behind it, cut away where the tile sits,
 * shows its edge. The letters are ink. Decorative: the link around it carries the name.
 */
const letters =
  'M500 170 213 334 213 435 513 610 513 747 498 754 278 628 277 563 213 525 213 665 500 830 578 785 577 573 278 399 277 372 500 244 722 372 721 394 556 491 621 528 786 430 786 334Z' +
  'M500 306 379 383 500 460 621 383Z'

export function LogoMark() {
  const mask = useId()
  return (
    <svg className="logo-mark" viewBox="100 100 815 815" aria-hidden="true" focusable="false">
      <mask id={mask}>
        <rect x="100" y="100" width="815" height="815" fill="white" />
        <rect x="110" y="110" width="760" height="760" rx="82" fill="black" />
      </mask>
      <rect className="logo-mark__step" x="145" y="145" width="760" height="760" rx="82" mask={`url(#${mask})`} />
      <g className="logo-mark__lift">
        <path className="logo-mark__letters" d={letters} fillRule="evenodd" transform="translate(490 490) scale(0.82) translate(-490 -490)" />
      </g>
    </svg>
  )
}
