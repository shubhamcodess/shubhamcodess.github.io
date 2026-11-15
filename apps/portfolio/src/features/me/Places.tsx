import { site } from '../../config/site'
import type { Home } from '../../content/me'
import { Clothesline } from './Clothesline'
import { StateMap } from './StateMap'

interface PlacesProps {
  readonly home: Home
  /** The place open, from the address (#work/<id>); the first place when none is named. */
  readonly placeId: string | null
  readonly emptySlots: number
}

/**
 * The opened Work tile: "Places I've been.", a tab for each city, and one city at a time as a page of its own,
 * where the owner is now first. A city page: its role, name and state, the state drawn large with the city
 * marked, then its photos on as many clotheslines as they need.
 */
export function Places({ home, placeId, emptySlots }: PlacesProps) {
  const { me } = site
  const places = home.places ?? []
  const place = places.find((candidate) => candidate.id === placeId) ?? places[0]
  if (!place) return null
  const href = (index: number, id: string) => (index === 0 ? `#${home.id}` : `#${home.id}/${id}`)

  return (
    <>
      <header className="me-places-head">
        <p className="eyebrow">{me.placesKicker}</p>
        <h1 className="me-places-head__title">{me.placesTitle}</h1>
        <nav className="me-city-tabs" aria-label={me.placesLabel}>
          {places.map((candidate, index) => (
            <a key={candidate.id} href={href(index, candidate.id)} {...(candidate === place ? { 'aria-current': 'page' as const } : {})}>
              <span className="me-city-tabs__role">{candidate.role}</span>
              <span className="me-city-tabs__name">{candidate.city}</span>
            </a>
          ))}
        </nav>
      </header>

      <section key={place.id} className="me-city" aria-labelledby={`place-${place.id}`}>
        <div className="me-city__head">
          <div className="me-city__text">
            <p className="eyebrow">{place.role}</p>
            <h2 className="me-city__name" id={`place-${place.id}`}>
              {place.city}
            </h2>
            <p className="me-city__region">{place.region}</p>
            {place.line ? <p className="me-city__line">{place.line}</p> : null}
          </div>
          <StateMap state={place.map} at={place.at} className="me-city__map" />
        </div>
        <Clothesline photos={place.photos ?? []} emptySlots={emptySlots} label={`Photos from ${place.city}`} />
      </section>
    </>
  )
}
