import type { HeroLightConfig } from '../../config/types'

/**
 * The light: lanes of light run along a floor toward the viewer and up a narrow wall far behind the words.
 * One full-screen fragment shader on raw WebGL2, so it costs a few kilobytes and no library.
 */

const vertexSource = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const fragmentSource = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform float uLanes;
uniform float uHorizon;
uniform float uWallWidth;
uniform float uFloorPerspective;
uniform float uCorner;
uniform float uSpeed;
uniform float uIntensity;
uniform float uWarmShare;
uniform float uNearFade;
uniform vec3 uCool;
uniform vec3 uWarm;
out vec4 outColor;

float hash(float seed) {
  return fract(sin(seed * 127.1 + 311.7) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;

  // Below the horizon the lanes fan out as a floor in perspective. Above it they run straight up the wall.
  float depth = max(0.0, uHorizon - uv.y);
  float projection = sqrt(depth * depth + uCorner * uCorner) - uCorner;
  float spread = aspect * uWallWidth * (1.0 + projection / uFloorPerspective);
  float across = ((uv.x - 0.5) * aspect - uPointer.x) / spread;

  float lanePosition = (across + 0.5) * uLanes;
  float seed = hash(floor(lanePosition));
  float edge = abs(fract(lanePosition) - 0.5);
  float pixel = max(fwidth(lanePosition), 0.025);
  float core = exp(-pow(edge / (pixel * (0.65 + projection)), 2.0));
  float glow = exp(-edge / (pixel * 3.5));
  float inside = step(0.0, lanePosition) * step(lanePosition, uLanes);

  // A pulse travels each lane from the near floor to the top of the wall, with a fainter one behind it.
  float path = uv.y > uHorizon ? (uv.y - uHorizon) * 1.8 : -1.4 * projection / (uFloorPerspective + projection);
  float head = fract(uTime * uSpeed * (0.11 + seed * 0.075) + seed * 13.0) * 2.8 - 1.4;
  float pulse = exp(-abs(path - head) * 19.0) * step(path, head + 0.025);
  float trail = exp(-abs(path - head + 1.2) * 28.0);
  float energy = (0.1 + pulse * 4.2 + trail * 1.8) * inside;

  float warm = step(1.0 - uWarmShare, seed);
  vec3 tint = mix(uCool + vec3(0.0, seed * 0.25, 0.0), uWarm + vec3(0.0, seed * 0.15, 0.0), warm);
  vec3 color = tint * (core + glow * 0.3) * energy;
  color += mix(vec3(0.3, 0.65, 1.0), vec3(1.0, 0.7, 0.4), warm) * core * pulse * pulse * 0.5 * inside;

  // Distance: the floor dims as it nears the viewer, the wall dims as it rises, and a haze sits on the horizon.
  color *= 1.0 - uNearFade * smoothstep(0.0, uHorizon, depth);
  color *= mix(1.0, 0.2, smoothstep(uHorizon, 1.0, uv.y));
  color += uCool * 0.05 * exp(-abs(uv.y - uHorizon) * 12.0) * exp(-abs(across) * 2.4);
  color *= 1.0 - 0.4 * pow(abs(uv.x - 0.5) * 2.0, 2.0);

  // A little grain hides banding in the dark gradients.
  color += (hash(dot(gl_FragCoord.xy, vec2(0.17, 0.31))) - 0.5) * 0.006;
  outColor = vec4(max(color * uIntensity, vec3(0.0)), 1.0);
}`

const uniformNames = [
  'uResolution',
  'uPointer',
  'uTime',
  'uLanes',
  'uHorizon',
  'uWallWidth',
  'uFloorPerspective',
  'uCorner',
  'uSpeed',
  'uIntensity',
  'uWarmShare',
  'uNearFade',
  'uCool',
  'uWarm',
] as const

type UniformName = (typeof uniformNames)[number]

export interface CoveLight {
  /** Match the canvas to its box. Call when the box changes size. */
  resize(): void
  /** Draw one frame. `seconds` is the light's own clock; `pointerX` is -0.5 to 0.5. */
  render(seconds: number, pointerX: number): void
  dispose(): void
}

/** Width below which the light uses its narrow-screen tuning. */
const narrowWidth = 640

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  console.error('Light shader failed to compile:', gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
  return null
}

/** Returns null when WebGL2 isn't available, and the backdrop keeps its static CSS glow. */
export function createCoveLight(canvas: HTMLCanvasElement, config: HeroLightConfig): CoveLight | null {
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'low-power' })
  if (!gl) return null

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  // One triangle that covers the whole canvas.
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uniforms = Object.fromEntries(uniformNames.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
    UniformName,
    WebGLUniformLocation | null
  >

  gl.uniform1f(uniforms.uHorizon, 1 - config.horizon)
  gl.uniform1f(uniforms.uFloorPerspective, config.floorPerspective)
  gl.uniform1f(uniforms.uCorner, config.cornerRadius)
  gl.uniform1f(uniforms.uSpeed, config.speed)
  gl.uniform1f(uniforms.uIntensity, config.intensity)
  gl.uniform1f(uniforms.uWarmShare, config.warmShare)
  gl.uniform1f(uniforms.uNearFade, config.nearFade)
  gl.uniform3f(uniforms.uCool, ...config.cool)
  gl.uniform3f(uniforms.uWarm, ...config.warm)

  return {
    resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, config.maxPixelRatio)
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio))
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
      gl.uniform2f(uniforms.uResolution, width, height)
      const size = canvas.clientWidth < narrowWidth ? 'narrow' : 'wide'
      gl.uniform1f(uniforms.uWallWidth, config.wallWidth[size])
      gl.uniform1f(uniforms.uLanes, config.lanes[size])
    },
    render(seconds, pointerX) {
      gl.uniform1f(uniforms.uTime, seconds)
      gl.uniform2f(uniforms.uPointer, pointerX * config.parallax.pointerLight, 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
    },
  }
}
