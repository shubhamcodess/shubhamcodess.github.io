import type { TopicId } from '../../content/me'

/**
 * A small line drawing for each topic, in the site's fine ink: a bike on the road, a camera in its viewfinder,
 * a reel trailing film, a steaming bowl, three friends, and a pin on a map. Decorative: the tag names it.
 */
const drawings: Record<TopicId, React.ReactNode> = {
  biking: (
    <>
      <circle cx="16" cy="31" r="10" />
      <circle cx="56" cy="31" r="10" />
      <circle cx="16" cy="31" r="1.4" />
      <circle cx="56" cy="31" r="1.4" />
      <path d="M16 31 28 17h18l10 14M28 17l8 14 10-14M36 31H16M24 12.5h8M46 17l-2.5-6.5h6" />
      <path className="topic-art__faint" d="M2 44h68" strokeDasharray="3 3.5" />
    </>
  ),
  photography: (
    <>
      <path className="topic-art__faint" d="M4 11V4h7M61 4h7v7M68 37v7h-7M11 44H4v-7" />
      <rect x="15" y="14" width="42" height="25" rx="4" />
      <path d="M26 14l3-5h14l3 5" />
      <circle cx="36" cy="26.5" r="8" />
      <circle cx="36" cy="26.5" r="3.6" />
      <path d="M49 18.5h3.5" />
    </>
  ),
  filmmaking: (
    <>
      <circle cx="22" cy="22" r="16" />
      <circle cx="22" cy="22" r="2.6" />
      <circle cx="22" cy="13" r="3.4" />
      <circle cx="30.6" cy="19.2" r="3.4" />
      <circle cx="27.3" cy="29.3" r="3.4" />
      <circle cx="16.7" cy="29.3" r="3.4" />
      <circle cx="13.4" cy="19.2" r="3.4" />
      <path d="M33 33.5 70 27M36 40.5 70 34.5" />
      <path className="topic-art__faint" d="M40 36.3 68 31.4" strokeDasharray="2 3" />
    </>
  ),
  food: (
    <>
      <path d="M12 25h48a24 17 0 0 1-48 0Z" />
      <path d="M29 44h14" />
      <path className="topic-art__faint" d="M28 19c-3-3.5 3-5.5 0-10M36 19c-3-3.5 3-5.5 0-10M44 19c-3-3.5 3-5.5 0-10" />
      <path d="m49 4 12 19M53 3l11 18" />
    </>
  ),
  people: (
    <>
      <circle cx="18" cy="17" r="5.5" />
      <circle cx="54" cy="17" r="5.5" />
      <path d="M7 42c0-9 5-14 11-14s11 5 11 14M43 42c0-9 5-14 11-14s11 5 11 14" />
      <circle cx="36" cy="13" r="6.5" />
      <path d="M22.5 44c0-10.5 6-17 13.5-17s13.5 6.5 13.5 17" />
    </>
  ),
  places: (
    <>
      <path className="topic-art__faint" d="M2 37c14-8 26 6 42-2s20-4 26-1M2 44c16-6 30 4 46-2s18-2 22 0" strokeDasharray="1.5 3" />
      <path className="topic-art__faint" d="M7 31c8-7 15-3 22-8" strokeDasharray="2.5 3" />
      <path d="M36 32s-10-9-10-17a10 10 0 0 1 20 0c0 8-10 17-10 17Z" />
      <circle cx="36" cy="15" r="3.6" />
    </>
  ),
}

export function TopicArt({ topic }: { readonly topic: TopicId }) {
  return (
    <svg className="topic-art" viewBox="0 0 72 48" aria-hidden="true" focusable="false">
      {drawings[topic]}
    </svg>
  )
}
