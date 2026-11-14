import { useRef } from 'react'
import type { HeroLightConfig } from '../../config/types'
import { useLightScene } from './useLightScene'
import './light-backdrop.css'

interface LightBackdropProps {
  readonly config: HeroLightConfig
  /** Off leaves the static CSS glow. */
  readonly light: boolean
  readonly parallax: boolean
}

/**
 * The moving light, as the far layer of whatever night surface it is placed in.
 * Its parent must be positioned. The parent receives --light-pointer-x/y and --light-scroll for its own depth.
 */
export function LightBackdrop({ config, light, parallax }: LightBackdropProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useLightScene(backdropRef, canvasRef, { light, parallax, config })

  return (
    <div className="light-backdrop" ref={backdropRef} data-light="off" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
