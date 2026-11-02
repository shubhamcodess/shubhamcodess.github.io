import type { CSSProperties } from "react";
import { sketch } from "@portfolio/design/button";
import { STORY_DRAWINGS, STORY_VIEW, type StoryDrawingName } from "./story-drawings";

/* A chapter's drawing. The pen goes through its strokes in order as the chapter arrives: each one draws between `--a` and `--a` plus `--s` of the scene's `--ink`. */
export function StoryDrawing({ name }: { name: StoryDrawingName }) {
  const { strokes, notes } = STORY_DRAWINGS[name]();
  const pace = (i: number) => ({ "--a": ((i / Math.max(1, strokes.length)) * 0.72).toFixed(3), "--s": "0.28" }) as CSSProperties;
  return (
    <svg className="story-plate" viewBox={`0 0 ${STORY_VIEW.w} ${STORY_VIEW.h}`} aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {strokes.map((stroke, i) => {
        const main = sketch(stroke.pts, 11 + i * 7, 0.9);
        if (stroke.dashed) return <path key={i} className="story-dashed" d={main} />;
        return (
          <g key={i} style={pace(i)}>
            <path className={stroke.fine ? "story-pen story-fine" : "story-pen"} d={main} pathLength={1} />
            {!stroke.fine && <path className="story-pen story-second" d={sketch(stroke.pts, 97 + i * 13, 1.5)} pathLength={1} />}
          </g>
        );
      })}
      {notes?.map((note) => <text key={note.text} className="story-note" x={note.at[0]} y={note.at[1]}>{note.text}</text>)}
    </svg>
  );
}
