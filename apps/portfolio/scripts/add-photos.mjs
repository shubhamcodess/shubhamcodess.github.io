// Turns new photos for a place into the site's two copies, with every bit of metadata (location, camera) removed.
//
//   pnpm --filter @portfolio/app photos bengaluru
//
// Drop the originals into apps/portfolio/photo-inbox/<place>/ (JPEG, PNG or HEIC). Each becomes
// public/me/places/<place>-<n>.webp (1600px on the long side, for the viewer) and <place>-<n>-print.webp
// (560px tall, for the line), numbered after the ones already there. The originals move to
// photo-inbox/<place>/done/. The inbox is ignored by git: originals carry location data and never leave
// this machine. The script prints the entries for content/me.ts; each still needs its caption (alt).
// Needs cwebp (brew install webp) and macOS's sips.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const place = process.argv[2]
if (!place || !/^[a-z-]+$/.test(place)) {
  console.error('Usage: pnpm --filter @portfolio/app photos <place>   (for example bengaluru)')
  process.exit(1)
}

const app = fileURLToPath(new URL('..', import.meta.url))
const inbox = join(app, 'photo-inbox', place)
const out = join(app, 'public', 'me', 'places')
const done = join(inbox, 'done')
if (!existsSync(inbox)) {
  console.error(`Nothing to do: put photos in ${inbox}`)
  process.exit(1)
}
mkdirSync(out, { recursive: true })
mkdirSync(done, { recursive: true })

const taken = readdirSync(out)
  .map((name) => new RegExp(`^${place}-(\\d+)\\.webp$`).exec(name)?.[1])
  .filter(Boolean)
  .map(Number)
let next = taken.length ? Math.max(...taken) + 1 : 1

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const size = (file) => {
  const info = run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file])
  return { w: Number(/pixelWidth: (\d+)/.exec(info)?.[1]), h: Number(/pixelHeight: (\d+)/.exec(info)?.[1]) }
}

const photos = readdirSync(inbox).filter((name) => /\.(jpe?g|png|heic)$/i.test(name)).sort()
if (!photos.length) {
  console.error(`No photos in ${inbox}`)
  process.exit(1)
}

const entries = []
for (const name of photos) {
  let source = join(inbox, name)
  let temporary = null
  if (/\.heic$/i.test(name)) {
    temporary = join(inbox, `.${name}.jpg`)
    run('sips', ['-s', 'format', 'jpeg', source, '--out', temporary])
    source = temporary
  }
  const { w, h } = size(source)
  const base = `${place}-${next}`
  const large = w >= h ? ['-resize', '1600', '0'] : ['-resize', '0', '1600']
  run('cwebp', ['-quiet', '-q', '76', '-metadata', 'none', ...large, source, '-o', join(out, `${base}.webp`)])
  run('cwebp', ['-quiet', '-q', '72', '-metadata', 'none', '-resize', '0', '560', source, '-o', join(out, `${base}-print.webp`)])
  if (temporary) rmSync(temporary)
  renameSync(join(inbox, name), join(done, name))
  entries.push(`        { src: 'me/places/${base}.webp', print: 'me/places/${base}-print.webp', alt: '' }, // ${name}`)
  next++
}

console.log(`Made ${entries.length} photo(s) for ${place}. Add to its photos in src/content/me.ts, each with a caption:\n`)
console.log(entries.join('\n'))
