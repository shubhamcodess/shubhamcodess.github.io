import { useEffect, useState } from 'react'

export type StaticData<T> = { readonly state: 'loading' } | { readonly state: 'ready'; readonly data: T } | { readonly state: 'failed' }

/** One request per file per page load, shared by every component that asks for it. */
const requests = new Map<string, Promise<unknown>>()

/**
 * Loads a JSON file from /public at runtime, so data that changes on its own schedule stays out of the bundle.
 * `path` is relative to the site base, for example "data/credentials.json".
 */
export function loadStaticData<T>(path: string): Promise<T> {
  let request = requests.get(path)
  if (!request) {
    request = fetch(`${import.meta.env.BASE_URL}${path}`).then((response) => {
      if (!response.ok) throw new Error(`${path}: ${response.status}`)
      return response.json()
    })
    requests.set(path, request)
  }
  return request as Promise<T>
}

export function useStaticData<T>(path: string): StaticData<T> {
  const [result, setResult] = useState<StaticData<T>>({ state: 'loading' })

  useEffect(() => {
    let live = true
    loadStaticData<T>(path).then(
      (data) => live && setResult({ state: 'ready', data }),
      () => live && setResult({ state: 'failed' }),
    )
    return () => {
      live = false
    }
  }, [path])

  return result
}
