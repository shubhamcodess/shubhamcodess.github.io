import type { CSSProperties } from "react";
import { Button, planStrokes } from "@portfolio/design/button";
import { SheetFrame } from "@portfolio/design/project-card";
import { Tooltip } from "@portfolio/design/tooltip";
import { site } from "@portfolio/site";
import { BATARANG_EDGES, BATARANG_OUTLINE } from "./batarang-shape";
import { BatFigure } from "./figure/BatFigure";
import { CompanyMark } from "./CompanyMark";
import { StoryStage } from "./StoryStage";
import { TOOL_LOGOS } from "./tool-logos";

const pad = (n: number) => String(n).padStart(2, "0");
/** How many chapters have their figure drawn. The rest stay marked as empty figures until theirs is built. */
const DRAWN = 1;
const toMark = ([x, y]: number[]) => [x! * 15 + 16, y! * 15 + 8];

/* A fine ink batarang for each stop on the line, in the icons' own pen, so it redraws on hover the same way. Its solid shape sits underneath for the stop you're on. */
const MARK_FILL = BATARANG_OUTLINE.map((p) => toMark(p).map((v) => v.toFixed(2)).join(",")).join(" ");
const MARK_STROKES = planStrokes(BATARANG_EDGES.map((edge) => edge.map(toMark)), 41, 0.28);

const Pen = ({ strokes }: { strokes: ReturnType<typeof planStrokes> }) => strokes.map((stroke, i) => (
  <g key={i} style={{ "--bp-from": stroke.from, "--bp-span": stroke.span } as CSSProperties}>
    <path pathLength={1} d={stroke.main} />
    <path className="second" pathLength={1} d={stroke.second} />
  </g>
));

/* Where it started and what it is now, told as scenes. Words, tools and whether it has a frame are all in `story` in content/site.ts. */
export function Story() {
  const { kicker, title, company, pace, frame, figure, scenes } = site.story;
  const titles = scenes.map((scene) => scene.title);
  const stops = scenes.slice(1), last = scenes.at(-1);
  return (
    <StoryStage id="story" count={scenes.length} pace={pace} titles={titles}>
      <div className="story-stage page-col">
        <header className="story-head">
          <p className="kicker">{kicker}</p>
          <h2 className="sec-title">
            <span className="ln"><span className="rv" style={{ "--i": 1 } as CSSProperties}>{title[0]} <CompanyMark name={company} /></span></span>
            <span className="ln"><span className="rv dim" style={{ "--i": 2 } as CSSProperties}>{title[1]}</span></span>
          </h2>
          {/* Now is this company; Archive will hold the ones before it. */}
          <div className="story-tabs" role="tablist" aria-label="Which job">
            <Button {...site.headerButton} size="xs" variant="primary" role="tab" aria-selected="true">Now</Button>
            <Tooltip label="Nothing here yet" align="end">
              <Button {...site.headerButton} size="xs" variant="secondary" role="tab" aria-selected="false" aria-disabled="true">Archive</Button>
            </Tooltip>
          </div>
        </header>
        <div className="pc story-frame" data-frame={frame ? "on" : "off"} data-figure-ceiling>
          {frame && <SheetFrame face={false} />}
          <div className="story-strip">
            <span className="story-sheet">Sheet <b data-sheet>{pad(1)}</b> / {pad(scenes.length)}</span>
            <span className="story-strip-title" data-strip>{titles[0]}</span>
            <span className="story-org">IBM</span>
          </div>
          <ol className="story-window">
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
                  <ul className="story-log">
                    {scene.log.map((entry) => (
                      <li key={entry.what}><span className="story-verb">{entry.verb}</span><span className="story-what">{entry.what}</span></li>
                    ))}
                  </ul>
                </div>
                {/* The chapter's part of the one Gotham drawing. Until it's built, it's marked the way a drawing marks an empty figure. */}
                <figure className="story-fig">
                  {i < DRAWN
                    ? <canvas className="story-canvas" data-chapter={i} aria-hidden="true" />
                    : <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="0" x2="100" y2="100" /><line x1="100" y1="0" x2="0" y2="100" /></svg>}
                  <figcaption>Fig. {i + 1}: {scene.figure}</figcaption>
                </figure>
                <div className="story-tools">
                  <span className="story-tools-label">With</span>
                  <ul>
                    {scene.tools.map((tool) => (
                      <li key={tool} className="story-tool">
                        <svg className="bp-icon" viewBox="0 0 24 24" aria-hidden="true"><Pen strokes={planStrokes(TOOL_LOGOS[tool].plan, tool.length * 11 + 3, 0.5)} /></svg>
                        {TOOL_LOGOS[tool].name}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <nav className="story-track" aria-label="Chapters of the story">
          <Tooltip label={titles[0]} align="start">
            {scenes[0]?.stop.kind === "text"
              ? <Button {...site.headerButton} href="#scene-1" size="xs" className="story-first" data-mark={0} aria-label={`${scenes[0].label}: ${titles[0]}`}>{scenes[0].stop.text}</Button>
              : null}
          </Tooltip>
          <span className="story-rule">
            <i className="story-rule-base" />
            <i className="story-rule-drawn" />
            <span className="story-figure" aria-hidden="true"><BatFigure {...figure} motion={site.flags.motion} /></span>
            {stops.map((scene, i) => scene.stop.kind === "text" ? null : (
              <span key={scene.title} className="story-stop" style={{ "--at": (i + 1) / stops.length } as CSSProperties}>
                <Tooltip label={scene.title} align={i === stops.length - 1 ? "end" : "center"}>
                  <a className="story-mark" href={`#scene-${i + 2}`} data-mark={i + 1} aria-label={`${scene.label}: ${scene.title}`}>
                    <svg className="bp-icon" viewBox="0 0 32 16" aria-hidden="true">
                      <polygon points={MARK_FILL} />
                      <Pen strokes={MARK_STROKES} />
                    </svg>
                  </a>
                </Tooltip>
              </span>
            ))}
          </span>
          {last?.stop.kind === "text" && (
            <Tooltip label={last.title} align="end">
              <Button {...site.headerButton} href={`#scene-${scenes.length}`} size="xs" className="story-first story-last" data-mark={scenes.length - 1} aria-label={`${last.label}: ${last.title}`}>{last.stop.text}</Button>
            </Tooltip>
          )}
        </nav>
      </div>
    </StoryStage>
  );
}
