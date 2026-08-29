import { useMemo, useState } from "react";
import { BookOpen, Bug, ChevronDown, GitBranch, Search, Wrench } from "lucide-react";
import { Crumbs } from "../components/chrome";
import { Callout, PinnedBadge, Reveal } from "../components/ui";
import { ALL_LESSONS } from "../data/curriculum";
import { GLOSSARY, TROUBLESHOOTING, VERSION_MATRIX } from "../data/reference";
import { Link } from "../lib/router";

/* ---------------- Glossary ---------------- */

export function GlossaryPage() {
  const [q, setQ] = useState("");
  const terms = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
    if (!query) return list;
    return list.filter((t) => t.term.toLowerCase().includes(query) || t.def.toLowerCase().includes(query));
  }, [q]);

  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Glossary" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Glossary</h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
            Every term is defined before it is used in a lesson. {GLOSSARY.length} terms and counting.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} aria-hidden="true" />
          <input className="input pl-9" placeholder="Search terms…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search glossary" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mt-8">
        {terms.map((t, i) => (
          <Reveal key={t.term} delay={Math.min(i * 25, 200)}>
            <div className="panel p-4 h-full">
              <div className="font-display font-semibold text-[0.95rem] flex items-center gap-2">
                <BookOpen size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
                {t.term}
              </div>
              <p className="text-[0.86rem] mt-2 leading-relaxed" style={{ color: "var(--ink-2)" }}>{t.def}</p>
            </div>
          </Reveal>
        ))}
      </div>
      {terms.length === 0 && (
        <div className="panel p-8 text-center mt-6" style={{ color: "var(--muted)" }}>
          No term matches "{q}".
        </div>
      )}
    </div>
  );
}

/* ---------------- Troubleshooting ---------------- */

export function TroubleshootingPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(TROUBLESHOOTING[0]?.id ?? null);

  const entries = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return TROUBLESHOOTING;
    return TROUBLESHOOTING.filter(
      (t) =>
        t.symptom.toLowerCase().includes(query) ||
        t.layer.toLowerCase().includes(query) ||
        t.causes.some((c) => c.toLowerCase().includes(query)) ||
        t.fix.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Troubleshooting" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4 mt-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">Fix It — symptom-first</h1>
          <p className="text-sm mt-2 max-w-[64ch]" style={{ color: "var(--muted)" }}>
            Start from what you see, name the layer, diagnose, fix, prevent. The same nine-step method every lesson's
            debugging lab trains: read the error → identify the layer → reproduce → gather evidence → hypothesize →
            change one thing → verify → explain the root cause → prevent the regression.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} aria-hidden="true" />
          <input className="input pl-9" placeholder="Describe the symptom… e.g. CORS, P1001, 401" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search troubleshooting entries" />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {entries.map((t, i) => {
          const isOpen = open === t.id;
          return (
            <Reveal key={t.id} delay={Math.min(i * 30, 180)}>
              <div className="panel overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : t.id)}
                  aria-expanded={isOpen}
                >
                  <Wrench size={16} style={{ color: "var(--brand)", flexShrink: 0 }} />
                  <span className="flex-1">
                    <span className="font-display font-semibold text-[0.95rem] block leading-snug">{t.symptom}</span>
                    <span className="font-mono text-[0.64rem] uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                      layer: {t.layer}
                    </span>
                  </span>
                  <ChevronDown size={16} style={{ color: "var(--muted)", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform var(--t-fast)" }} />
                </button>
                {isOpen && (
                  <div className="fade-in px-5 pb-5 grid md:grid-cols-2 gap-5 border-t" style={{ borderColor: "var(--line)" }}>
                    <div className="pt-4">
                      <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--amber-ink)" }}>Likely causes</div>
                      <ul className="flex flex-col gap-1.5">
                        {t.causes.map((c) => (
                          <li key={c} className="text-[0.86rem] flex gap-2 items-start" style={{ color: "var(--ink-2)" }}>
                            <Bug size={13} className="mt-1 shrink-0" style={{ color: "var(--amber)" }} /> {c}
                          </li>
                        ))}
                      </ul>
                      <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mt-4 mb-2" style={{ color: "var(--sky-ink)" }}>Diagnose</div>
                      <ul className="flex flex-col gap-1.5">
                        {t.diagnose.map((d) => (
                          <li key={d} className="text-[0.83rem] font-mono leading-relaxed" style={{ color: "var(--ink-2)" }}>
                            <span style={{ color: "var(--brand)" }}>$</span> {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4">
                      <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--brand-ink)" }}>Fix</div>
                      <p className="text-[0.88rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>{t.fix}</p>
                      <div className="font-mono text-[0.62rem] uppercase tracking-[0.2em] mt-4 mb-2" style={{ color: "var(--brand-ink)" }}>Prevent</div>
                      <p className="text-[0.88rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>{t.prevent}</p>
                      <div className="mt-4">
                        <Link to={`lesson/${t.related}`} className="btn btn-ghost btn-sm">
                          <BookOpen size={13} /> Related lesson
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
        {entries.length === 0 && (
          <div className="panel p-8 text-center" style={{ color: "var(--muted)" }}>
            Nothing matches "{q}" — yet. Entries are added as new phases are authored.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Version Matrix ---------------- */

export function VersionsPage() {
  return (
    <div className="max-w-site py-8">
      <Crumbs items={[{ label: "Home", to: "" }, { label: "Version Matrix" }]} />
      <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mt-4">Version Matrix</h1>
      <p className="text-sm mt-2 max-w-[70ch]" style={{ color: "var(--muted)" }}>
        Verified 2026-02 during the scaffold pass. Policy: stable/LTS only, never preview builds as baseline, no silent
        upgrades of a working repository — and Prisma is pinned by decree, not by accident.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Callout variant="security" title="Pinned: prisma@7.9.15 + @prisma/client@7.9.15">
          The course teaches exactly this version's configuration, ESM/driver-adapter behavior, prisma.config.ts,
          migrations, generation, and deployment. Newer majors appear only in optional migration-awareness material
          (Phase 15) unless explicitly approved.
        </Callout>
        <Callout variant="info" title="Verification habit">
          Before any version-sensitive lesson is authored, the baseline is re-checked against official docs and this
          table is updated. Official changelogs and migration guides beat search snippets, old videos, and memory.
        </Callout>
      </div>

      <Reveal>
        <div className="tbl-wrap mt-6">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Course baseline</th>
                <th>Latest verified stable</th>
                <th>Source</th>
                <th>Compatibility & migration notes</th>
              </tr>
            </thead>
            <tbody>
              {VERSION_MATRIX.map((row) => (
                <tr key={row.tool}>
                  <td>
                    <span className="flex items-center gap-2" style={{ color: "var(--ink)" }}>
                      <GitBranch size={13} style={{ color: row.pinned ? "var(--sky)" : "var(--muted)" }} />
                      {row.tool}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[0.78rem]" style={{ color: row.pinned ? "var(--sky-ink)" : "var(--ink-2)" }}>
                      {row.baseline}
                    </span>{" "}
                    {row.pinned && <PinnedBadge />}
                  </td>
                  <td>{row.latest}</td>
                  <td className="font-mono text-[0.78rem]">{row.source}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      <p className="text-[0.78rem] font-mono mt-4" style={{ color: "var(--muted)" }}>
        Mirrored in COURSE_VERSION_MATRIX.md at the repository root. {ALL_LESSONS.length} lessons reference this matrix
        as their version context.
      </p>
    </div>
  );
}
