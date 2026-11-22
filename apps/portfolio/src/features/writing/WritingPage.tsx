import { useEffect, useState } from 'react'
import { site } from '../../config/site'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { posts } from '../../lib/writing'
import './writing.css'

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
export const formatDate = (date: string) => dateFormat.format(new Date(date))
export const postHref = (slug: string) => `${hrefTo('writing')}${slug}/`
/** A category's form in the address: ?category=<slug>. */
export const categorySlug = (category: string) =>
  category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const param = 'category'
const categoryInAddress = () => new URLSearchParams(window.location.search).get(param) ?? ''

/**
 * /writing/ (from prototype 39): every published post, newest first, grouped by year. The builds page's lean
 * filter chips choose a category (each post's `category` front matter), once there is more than one; the choice
 * is kept in the address as ?category=<slug>, so a filtered list can be linked to. Only posts on this site are listed.
 */
export function WritingPage() {
  const copy = site.writing
  // Categories in order of their newest post, each with its address form.
  const categories = [...new Map(posts.map((post) => [categorySlug(post.category), post.category])).entries()]
  const known = (slug: string) => categories.some(([key]) => key === slug)
  const [chosen, setChosen] = useState(() => (known(categoryInAddress()) ? categoryInAddress() : ''))
  const shown = posts.filter((post) => !chosen || categorySlug(post.category) === chosen)

  // The address follows the chip (replacing the history entry), and Back or Forward follow the address.
  const choose = (slug: string) => {
    setChosen(slug)
    const url = new URL(window.location.href)
    if (slug) url.searchParams.set(param, slug)
    else url.searchParams.delete(param)
    history.replaceState(history.state, '', url)
  }
  useEffect(() => {
    const onPop = () => setChosen(known(categoryInAddress()) ? categoryInAddress() : '')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  })
  const years = [...new Set(shown.map((post) => post.date.slice(0, 4)))]

  return (
    <div className="panel panel--grow">
      <Header page="writing" />
      <main id="main" className="section container writing-index">
        <header className="section__header enter">
          <div>
            <h1 className="section__title">{copy.title}</h1>
            <p className="section__lead">{copy.lead}</p>
          </div>
          <p className="eyebrow">{copy.count.replace('{n}', String(posts.length))}</p>
        </header>

        {categories.length > 1 ? (
          <div className="writing-filter" role="group" aria-label="Filter by category">
            {[['', copy.all] as const, ...categories].map(([slug, name]) => (
              <button
                key={slug || 'all'}
                type="button"
                className="writing-filter__chip"
                aria-pressed={chosen === slug}
                onClick={() => choose(slug)}
              >
                {name}{' '}
                <span>{slug ? posts.filter((post) => categorySlug(post.category) === slug).length : posts.length}</span>
              </button>
            ))}
          </div>
        ) : null}

        {years.map((year) => (
          <section key={year} className="writing-year" aria-labelledby={`year-${year}`}>
            <h2 className="writing-year__label" id={`year-${year}`}>
              {year}
            </h2>
            <ul className="writing-list">
              {shown
                .filter((post) => post.date.startsWith(year))
                .map((post) => (
                  <li key={post.slug}>
                    <a className="writing-row" href={postHref(post.slug)}>
                      <span className="writing-row__meta">
                        <span className="writing-row__kind">{post.category}</span>
                        <span>{copy.kinds[post.kind]}</span>
                        {post.private ? (
                          <span className="writing-row__tag">
                            {post.private} · {copy.privateLabel}
                          </span>
                        ) : null}
                      </span>
                      <span className="writing-row__title">
                        <span className="link-dots">{post.title}</span>
                      </span>
                      <span className="writing-row__summary">{post.summary}</span>
                      <span className="writing-row__foot">
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        <span>{copy.minutes.replace('{n}', String(post.minutes))}</span>
                      </span>
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  )
}
