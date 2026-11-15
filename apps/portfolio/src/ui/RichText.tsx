import type { ReactNode } from 'react'
import './rich-text.css'

/*
 * A little inline markup for content strings, so a line can show what it is about:
 *   `find . -size +100M`   a command, path or name, in mono on a small plate
 *   **pruning**            a key word, in full ink and a touch heavier
 *   “find big files”       a quotation, its marks set apart
 *   [[Enter]]              a key to press
 * Anything else is plain text. Marks don't nest.
 */
const token = /(`[^`]+`|\*\*[^*]+\*\*|“[^”]+”|\[\[[^\]]+\]\])/g

interface RichTextProps {
  readonly text: string
}

export function RichText({ text }: RichTextProps) {
  const parts: ReactNode[] = text.split(token).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rich__code">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="rich__strong">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('“') && part.endsWith('”')) {
      return (
        <q key={i} className="rich__quote">
          {part.slice(1, -1)}
        </q>
      )
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      return (
        <kbd key={i} className="rich__key">
          {part.slice(2, -2)}
        </kbd>
      )
    }
    return part
  })
  return <>{parts}</>
}

