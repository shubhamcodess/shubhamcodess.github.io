import { site } from '../../config/site'
import { experience, highlights, recognition } from '../../content/experience'
import { Reveal } from '../../ui/Reveal'

/**
 * The employer record: one block per employer, its roles newest first, and the numbers and
 * recognition that came out of them. Built to be scanned. A new employer becomes a new block on top.
 */
export function ExperienceRecord() {
  const { employer, labels } = site.experience
  const roles = [...experience].reverse()

  return (
    <div className="record">
      <Reveal className="record__employer">
        <p className="record__name">{employer.name}</p>
        <p className="record__span">
          <span>{employer.span}</span>
          <span>{employer.place}</span>
          <span>
            {String(roles.length).padStart(2, '0')} {labels.roles.toLowerCase()}
          </span>
        </p>
      </Reveal>

      <ul className="record__highlights" aria-label={labels.highlights}>
        {highlights.map((item, index) => (
          <li key={item.label}>
            <Reveal index={index} className="reveal-fill record__highlight">
              <span className="record__value">{item.value}</span>
              <span className="record__label">{item.label}</span>
            </Reveal>
          </li>
        ))}
      </ul>

      <div className="record__roles">
        <h3 className="eyebrow">{labels.roles}</h3>
        {roles.map((chapter, index) => (
          <details key={chapter.title} className="record__role" open={index === 0} name="experience-role">
            <summary>
              <span className="record__role-stop">{chapter.stop}</span>
              <span className="record__role-title">{chapter.role.replace(`, ${employer.name}`, '')}</span>
              <span className="record__role-line">{chapter.title}</span>
              <span className="record__toggle" aria-hidden="true" />
            </summary>
            <div className="record__role-body">
              <p className="xp__line">{chapter.line}</p>
              <ul className="xp__log">
                {chapter.log.map((entry) => (
                  <li key={entry.what}>
                    <span className="xp__verb">{entry.verb}</span>
                    <span>{entry.what}</span>
                  </li>
                ))}
              </ul>
              <ul className="build-stack" aria-label="Worked with">
                {chapter.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>

      {recognition.length > 0 ? (
        <div className="record__recognition">
          <h3 className="eyebrow">{labels.recognition}</h3>
          <ul>
            {recognition.map((item) => (
              <li key={item.title}>
                <span>{item.title}</span>
                <span className="record__label">
                  {item.by} · {item.when}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
