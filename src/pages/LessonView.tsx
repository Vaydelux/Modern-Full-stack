import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Clock,
  FlaskConical,
  GraduationCap,
  Layers,
  ListChecks,
  Target,
} from "lucide-react";
import { Crumbs, PrevNext } from "../components/chrome";
import { ChallengeBlock, Checkpoint, Flashcards, Quiz, SectionAnchor, slugify } from "../components/widgets";
import { SectionDemo } from "../components/demos";
import { Callout, CodeBlock, Reveal, SectionHeading, StatusBadge } from "../components/ui";
import { TableOfContents, calculateLessonReadingStats } from "../components/TableOfContents";
import { FloatingToc } from "../components/FloatingToc";
import { PersistentLessonNav } from "../components/PersistentLessonNav";
import { LessonFeedback } from "../components/LessonFeedback";
import { CopyLessonButton } from "../components/CopyLessonButton";
import { MarkAsReadButton } from "../components/MarkAsReadButton";
import { ALL_LESSONS, lessonById } from "../data/curriculum";
import { LESSON_CONTENT } from "../data/lessons";

export default function LessonView({ id }: { id: string }) {
  const found = lessonById(id);
  const content = LESSON_CONTENT[id];
  const idx = ALL_LESSONS.findIndex((l) => l.id === id);
  const prev = idx > 0 ? ALL_LESSONS[idx - 1] : undefined;
  const next = idx >= 0 && idx < ALL_LESSONS.length - 1 ? ALL_LESSONS[idx + 1] : undefined;

  const lessonContainerRef = useRef<HTMLDivElement>(null);

  const readingStats = useMemo(() => {
    if (!content) return null;
    return calculateLessonReadingStats(content);
  }, [content]);

  if (!found) {
    return (
      <div className="max-w-site py-16">
        <div className="panel p-10 max-w-xl mx-auto text-center">
          <h1 className="font-display font-bold text-2xl">Lesson not on the manifest</h1>
          <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>
            "{id}" does not exist in the curriculum inventory. Check the roadmap for real lesson IDs.
          </p>
          <a href="#/roadmap" className="btn btn-primary mt-6">Open roadmap</a>
        </div>
      </div>
    );
  }

  const { lesson, phase } = found;

  /* ---------- honest status page for unauthored lessons ---------- */
  if (!content) {
    return (
      <div className="max-w-site py-8">
        <div className="max-w-3xl">
          <Crumbs
            items={[
              { label: "Home", to: "" },
              { label: `P${String(phase.n).padStart(2, "0")} · ${phase.title}`, to: "roadmap" },
              { label: lesson.title },
            ]}
          />
          <div className="flex flex-wrap items-center justify-between gap-2.5 mt-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={lesson.status} />
              <span className="chip"><Clock size={11} /> ~{lesson.minutes} min planned</span>
              <span className="chip" style={{ textTransform: "none", letterSpacing: 0 }}>
                <GraduationCap size={11} /> {phase.stage.replace("-", " ")} stage
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MarkAsReadButton lessonId={lesson.id} lessonTitle={lesson.title} />
              <CopyLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-3">{lesson.title}</h1>
          <p className="mt-4 leading-relaxed" style={{ color: "var(--ink-2)" }}>
            This lesson is inventoried in the manifest but its body is not authored yet — and this page refuses to
            pretend otherwise. {lesson.status === "draft"
              ? "It is a draft: the outline below is committed; the full quality-contract body ships in a later pass."
              : "It is planned: scoped, sequenced, and scheduled by the curriculum's bounded generation passes."}
          </p>

          <div className="panel p-6 mt-6">
            <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em] mb-3" style={{ color: "var(--brand-ink)" }}>
              What this phase covers
            </div>
            <p className="text-[0.95rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>{phase.focus}</p>
          </div>

          {lesson.outline && lesson.outline.length > 0 && (
            <div className="panel p-6 mt-4">
              <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em] mb-3" style={{ color: "var(--amber-ink)" }}>
                Committed outline
              </div>
              <ul className="flex flex-col gap-2">
                {lesson.outline.map((o) => (
                  <li key={o} className="flex gap-2.5 items-start text-[0.92rem]" style={{ color: "var(--ink-2)" }}>
                    <ClipboardList size={15} className="mt-0.5 shrink-0" style={{ color: "var(--amber)" }} />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Callout variant="info" title="How authoring works">
            The course advances in bounded passes (one module or 3–5 lessons per batch), each recorded in the course
            status with scope, decisions, and the next batch. See what is next below, or jump to the nearest authored
            lesson.
          </Callout>

          <div className="flex flex-wrap gap-2 mt-6">
            <a href="#/status" className="btn btn-ghost btn-sm">Course status & next batch</a>
            <a href="#/manifest" className="btn btn-soft btn-sm">Manifest</a>
            <a href="#/roadmap" className="btn btn-soft btn-sm">Roadmap</a>
          </div>

          <LessonFeedback lessonId={id} lessonTitle={lesson.title} />

          <PrevNext
            prev={prev ? { id: prev.id, title: prev.title } : undefined}
            next={next ? { id: next.id, title: next.title } : undefined}
          />
        </div>
        <PersistentLessonNav currentId={id} />
      </div>
    );
  }

  /* ---------- full authored lesson ---------- */
  return (
    <div className="max-w-site py-8 pb-28 sm:pb-32 w-full min-w-0">
      <div className="grid xl:grid-cols-[1fr_240px] gap-8 w-full min-w-0">
        <div ref={lessonContainerRef} className="w-full max-w-[800px] min-w-0 lesson">
          <Crumbs
            items={[
              { label: "Home", to: "" },
              { label: `P${String(phase.n).padStart(2, "0")} · ${phase.title}`, to: "roadmap" },
              { label: content.title },
            ]}
          />

          <header className="mt-5 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="implemented" />
                <span className="chip"><GraduationCap size={11} /> {content.level}</span>
                <span className="chip" title={`Planned curriculum time: ~${content.minutes} min`}>
                  <Clock size={11} /> ~{content.minutes} min planned
                </span>
                {readingStats && (
                  <span
                    className="chip"
                    title={`Estimated reading time based on ${readingStats.wordCount.toLocaleString()} words (~200 wpm)`}
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--brand-ink)",
                      borderColor: "var(--brand)",
                    }}
                  >
                    <BookOpen size={11} /> ~{readingStats.readingTimeMinutes} min read ({readingStats.wordCount.toLocaleString()} words)
                  </span>
                )}
                <span className="chip"><Layers size={11} /> Phase {String(phase.n).padStart(2, "0")}</span>
              </div>

              <div className="flex items-center gap-2">
                <MarkAsReadButton lessonId={id} lessonTitle={content.title} />
                <CopyLessonButton lessonId={id} lessonTitle={content.title} />
              </div>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-[2.6rem] tracking-tight mt-4 leading-[1.08]">
              {content.title}
            </h1>
            <p className="mt-4 text-[1.05rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              {content.summary}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="panel p-5">
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em] mb-2.5" style={{ color: "var(--brand-ink)" }}>
                  Prerequisites
                </div>
                <ul className="flex flex-col gap-1.5">
                  {content.prerequisites.map((p) => {
                    const pid = p.split(" ")[0];
                    const target = lessonById(pid);
                    return (
                      <li key={p} className="text-[0.86rem] flex gap-2 items-start" style={{ color: "var(--ink-2)" }}>
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                        {target ? (
                          <a href={`#/lesson/${pid}`} className="hover:underline" style={{ color: "var(--brand-ink)" }}>
                            {target.lesson.title}
                          </a>
                        ) : (
                          p
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="panel p-5">
                <div className="font-mono text-[0.64rem] uppercase tracking-[0.22em] mb-2.5" style={{ color: "var(--brand-ink)" }}>
                  <span className="inline-flex items-center gap-1.5"><Target size={11} /> You will be able to</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {content.objectives.map((o) => (
                    <li key={o} className="text-[0.86rem] flex gap-2 items-start" style={{ color: "var(--ink-2)" }}>
                      <span className="mt-[0.5em] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--brand)" }} aria-hidden="true" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <section id="simply-put">
            <Callout variant="info" title="Simply put">{content.simple}</Callout>
          </section>

          <section id="why" className="mt-6">
            <Callout variant="warn" title="Why it matters">{content.why}</Callout>
          </section>

          <section id="mental-model" className="mt-6">
            <Callout variant="mental" title={`Mental model — ${content.mentalModel.title}`}>
              {content.mentalModel.body}
            </Callout>
          </section>

          {content.sections.map((s) => {
            const headingId = slugify(s.heading);
            return (
              <section key={s.heading} id={headingId} className="mt-12">
                <Reveal>
                  <SectionAnchor s={s} />
                  <h2 id={headingId} className="text-2xl font-semibold mb-4">{s.heading}</h2>
                  {s.body.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                  {s.code?.map((c) => (
                    <CodeBlock key={c.file} file={c.file} lang={c.lang} code={c.code} caption={c.caption} />
                  ))}
                  {s.demo && <SectionDemo kind={s.demo} />}
                </Reveal>
              </section>
            );
          })}

          {/* Common Mistake */}
          {(content.mistake || content.commonMistake) && (
            <section id="common-mistake" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Learn from the scar tissue" title="Common mistake" />
                <div className="flex items-start gap-2.5 mb-4" style={{ color: "var(--amber-ink)" }}>
                  <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                  <h3 className="font-display font-semibold text-lg" style={{ color: "var(--ink)" }}>
                    {content.mistake?.title || content.commonMistake?.title || "Anti-Pattern & The Trap"}
                  </h3>
                </div>
                <div className="mistake-grid">
                  <div>
                    <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--rose-ink)" }}>
                      ✗ The trap
                    </div>
                    <CodeBlock file="what goes wrong" lang="js" code={content.mistake?.wrong || content.commonMistake?.wrong || ""} />
                  </div>
                  <div>
                    <div className="font-mono text-[0.64rem] uppercase tracking-[0.2em] mb-1.5" style={{ color: "var(--brand-ink)" }}>
                      ✓ The fix
                    </div>
                    <CodeBlock file="what ships instead" lang="js" code={content.mistake?.right || content.commonMistake?.right || ""} />
                  </div>
                </div>
                <Callout variant="danger" title="Why this hurts">
                  {content.mistake?.explain || content.commonMistake?.explain || content.commonMistake?.explanation || ""}
                </Callout>
              </Reveal>
            </section>
          )}

          {/* Try it yourself */}
          {(content.tryIt || content.tryItYourself) && (
            <section id="try-it" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Guided practice" title={content.tryItYourself?.title || "Try it yourself"} />
                <div className="panel p-5">
                  <ul className="flex flex-col gap-3">
                    {(content.tryIt || content.tryItYourself?.instructions || []).map((t, i) => (
                      <li key={t.slice(0, 40)} className="flex gap-3 items-start text-[0.93rem]" style={{ color: "var(--ink-2)" }}>
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[0.68rem] shrink-0 mt-0.5"
                          style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
                        >
                          {i + 1}
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                  {content.tryItYourself?.expected && (
                    <div className="mt-4 pt-3 border-t text-[0.84rem]" style={{ borderColor: "var(--line)", color: "var(--brand-ink)" }}>
                      <strong>Expected result:</strong> {content.tryItYourself.expected}
                    </div>
                  )}
                </div>
              </Reveal>
            </section>
          )}

          {/* Exercise / Lab */}
          {content.exercise && (
            <section id="exercise" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Hands-on lab" title={content.exercise.title} />
                <div className="panel p-5">
                  <p className="text-[0.93rem] mb-4" style={{ color: "var(--ink-2)" }}>{content.exercise.description}</p>
                  <ul className="flex flex-col gap-2.5">
                    {content.exercise.tasks.map((task, i) => (
                      <li key={task.slice(0, 40)} className="flex gap-3 items-start text-[0.93rem]" style={{ color: "var(--ink-2)" }}>
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[0.68rem] shrink-0 mt-0.5"
                          style={{ background: "var(--brand-soft)", color: "var(--brand-ink)" }}
                        >
                          {i + 1}
                        </span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </section>
          )}

          {/* Challenge */}
          {content.challenge && (
            <section id="challenge" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Independent practice" title={content.challenge.title ? `Challenge: ${content.challenge.title}` : "Challenge — attempt before revealing"} />
                <ChallengeBlock
                  prompt={content.challenge.prompt || content.challenge.description || ""}
                  hints={content.challenge.hints}
                  solution={content.challenge.solution}
                />
              </Reveal>
            </section>
          )}

          <section id="quiz" className="mt-12">
            <Reveal>
              <SectionHeading kicker="Check understanding" title="Quiz" />
              <Quiz lessonId={content.id} questions={content.quiz} />
            </Reveal>
          </section>

          {content.flashcards && content.flashcards.length > 0 && (
            <section id="flashcards" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Vocabulary that sticks" title="Flashcards" />
                <Flashcards lessonId={content.id} cards={content.flashcards} />
              </Reveal>
            </section>
          )}

          <section id="checkpoint-sec" className="mt-12">
            <Checkpoint lessonId={content.id} />
          </section>

          {content.recap && content.recap.length > 0 && (
            <section id="recap" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Seal it" title="Recap" />
                <div className="panel p-5">
                  <ul className="flex flex-col gap-2.5">
                    {content.recap.map((r, i) => (
                      <li key={r.slice(0, 40)} className="flex gap-3 items-start text-[0.93rem]" style={{ color: "var(--ink-2)" }}>
                        <ListChecks size={16} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} />
                        <span><span className="font-mono text-[0.68rem] mr-2" style={{ color: "var(--muted)" }}>{String(i + 1).padStart(2, "0")}</span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {content.nextBridge && (
                  <div className="mt-5">
                    <Callout variant="success" title="Where this leads">{content.nextBridge}</Callout>
                  </div>
                )}
              </Reveal>
            </section>
          )}

          {content.references && content.references.length > 0 && (
            <section id="references" className="mt-12">
              <Reveal>
                <SectionHeading kicker="Official sources only" title="References" />
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {content.references.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="panel p-3.5 no-underline flex items-center gap-2 text-[0.86rem] transition-colors hover:border-[var(--brand)]"
                      style={{ color: "var(--ink-2)" }}
                    >
                      <FlaskConical size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                      <span className="flex-1">{r.label}</span>
                      <ArrowUpRight size={13} style={{ color: "var(--muted)" }} />
                    </a>
                  ))}
                </div>
              </Reveal>
            </section>
          )}

          <LessonFeedback lessonId={id} lessonTitle={content.title} />

          <PrevNext
            prev={prev ? { id: prev.id, title: prev.title } : undefined}
            next={next ? { id: next.id, title: next.title } : undefined}
          />
        </div>

        <div className="hidden xl:block">
          <TableOfContents content={content} containerRef={lessonContainerRef} />
        </div>
      </div>

      {/* Floating interactive Table of Contents for seamless reading navigation */}
      <FloatingToc content={content} containerRef={lessonContainerRef} />

      <PersistentLessonNav currentId={id} />
    </div>
  );
}
