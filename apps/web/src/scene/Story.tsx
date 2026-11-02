import type { CSSProperties } from "react";
import { Tooltip } from "@portfolio/design/tooltip";
import { site } from "@portfolio/site";
import { BATARANG_OUTLINE } from "./batarang-shape";
import { BatFigure } from "./figure/BatFigure";
import { StoryDrawing } from "./StoryDrawing";
import { StoryStage } from "./StoryStage";

/* A fine ink outline of the batarang, for each stop on the line. */
const MARK = BATARANG_OUTLINE.map(([x, y]) => `${(x! * 17 + 18).toFixed(2)},${(y! * 17 + 8).toFixed(2)}`).join(" ");

/* Where it started and what it is now, told as scenes rather than a timeline. The words are all in `story` in content/site.ts. */
export function Story() {
  const { kicker, pace, figure, scenes } = site.story;
  const last = scenes.length - 1;
  return (
    <StoryStage id="story" count={scenes.length} pace={pace}>
      <div className="story-stage">
        <p className="kicker story-kicker">{kicker}</p>
        <ol className="story-scenes">
          {scenes.map((scene, i) => (
            <li key={scene.title} id={`scene-${i + 1}`} className="story-scene" data-scene>
              <div className="story-text">
                <p className="story-label">{scene.label}</p>
                <h3 className="story-title">
                  <span className="story-wire" aria-hidden="true">{scene.title}</span>
                  <span className="story-face">{scene.title}</span>
                </h3>
                <p className="story-role">{scene.role}</p>
                <p className="story-line">{scene.line}</p>
                <ul className="story-proof">
                  {scene.proof.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
              <StoryDrawing name={scene.drawing} />
            </li>
          ))}
        </ol>
        <nav className="story-track" aria-label="Chapters of the story">
          <span className="story-rule">
            <i className="story-rule-base" />
            <i className="story-rule-drawn" />
            <span className="story-figure" aria-hidden="true"><BatFigure {...figure} motion={site.flags.motion} /></span>
            {scenes.map((scene, i) => (
              <span key={scene.title} className="story-stop" style={{ "--at": i / last } as CSSProperties}>
                <Tooltip label={scene.title} align={i === 0 ? "start" : i === last ? "end" : "center"}>
                  <a className="story-mark" href={`#scene-${i + 1}`} data-mark={i} aria-label={`${scene.label}: ${scene.title}`}>
                    <svg viewBox="0 0 36 18" aria-hidden="true"><polygon points={MARK} /></svg>
                  </a>
                </Tooltip>
              </span>
            ))}
          </span>
        </nav>
      </div>
    </StoryStage>
  );
}
