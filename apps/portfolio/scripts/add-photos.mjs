// Turns new photos for /me into the site's two copies, with every bit of metadata (location, camera) removed.
//
//   pnpm --filter @portfolio/app photos
//
// Drop the originals into apps/portfolio/photo-inbox/ (JPEG, PNG or HEIC), named for what they show
// ("night-ride.jpg"). Each becomes public/me/photos/<name>.webp (1600px on the long side, for the viewer)
// and <name>-print.webp (560px tall, for the line). The originals move to photo-inbox/done/. The inbox is
// ignored by git: originals carry location data and never leave this machine. The script prints the entries
// for `photos` in src/content/me.ts; each still needs its title, a caption in the owner's voice, a plain alt text and one or two topics.
// Needs cwebp (brew install webp) and macOS's sips.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const app = fileURLToPath(new URL('..', import.meta.url))
const inbox = join(app, 'photo-inbox')
const out = join(app, 'public', 'me', 'photos')
const done = join(inbox, 'done')
if (!existsSync(inbox)) {
  console.error(`Nothing to do: put photos in ${inbox}`)
  process.exit(1)
}
mkdirSync(out, { recursive: true })
mkdirSync(done, { recursive: true })

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString()
const size = (file) => {
  const info = run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file])
  return { w: Number(/pixelWidth: (\d+)/.exec(info)?.[1]), h: Number(/pixelHeight: (\d+)/.exec(info)?.[1]) }
}
const slug = (name) =>
  name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'photo'

const photos = readdirSync(inbox).filter((name) => /\.(jpe?g|png|heic)$/i.test(name)).sort()
if (!photos.length) {
  console.error(`No photos in ${inbox}`)
  process.exit(1)
}

const entries = []
for (const file of photos) {
  let source = join(inbox, file)
  let temporary = null
  if (/\.heic$/i.test(file)) {
    temporary = join(inbox, `.${file}.jpg`)
    run('sips', ['-s', 'format', 'jpeg', source, '--out', temporary])
    source = temporary
  }
  // Never overwrite a photo already on the site: a taken name gets a number.
  let name = slug(file)
  for (let n = 2; existsSync(join(out, `${name}.webp`)); n++) name = `${slug(file)}-${n}`
  const { w, h } = size(source)
  const scale = Math.min(1, 1600 / Math.max(w, h))
  const width = Math.round(w * scale)
  const height = Math.round(h * scale)
  run('cwebp', ['-quiet', '-q', '78', '-metadata', 'none', '-resize', String(width), String(height), source, '-o', join(out, `${name}.webp`)])
  run('cwebp', ['-quiet', '-q', '76', '-metadata', 'none', '-resize', '0', '560', source, '-o', join(out, `${name}-print.webp`)])
  if (temporary) rmSync(temporary)
  renameSync(join(inbox, file), join(done, file))
  entries.push(`  { name: '${name}', width: ${width}, height: ${height}, title: '', caption: '', alt: '', topics: [] }, // ${file}`)
}

console.log(`Made ${entries.length} photo(s). Add to photos in src/content/me.ts, each with a title, a caption in your voice, a plain alt text and its topics:\n`)
console.log(entries.join('\n'))
