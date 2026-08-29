import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Info, Lightbulb, Shield, FlaskConical } from "lucide-react";

/* ---------- motion primitives ---------- */

const prefersReduced = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || prefersReduced()) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** Signature decode effect — settles left to right; instant under reduced motion. */
export function useScramble(text: string): string {
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (prefersReduced()) {
      setOut(text);
      return;
    }
    const CHARS = "!<>-_\\/[]{}=+*^?#";
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const revealCount = Math.floor(frame * 1.6);
      const next = text
        .split("")
        .map((ch, i) => {
          if (ch === " " || ch === "\n" || i < revealCount) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");
      setOut(next);
      if (revealCount >= text.length) window.clearInterval(id);
    }, 24);
    return () => window.clearInterval(id);
  }, [text]);
  return out;
}

/* ---------- badges ---------- */

const STATUS_LABEL: Record<string, string> = {
  implemented: "Implemented",
  draft: "Draft",
  planned: "Planned",
  partial: "Partial",
};

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "implemented"
      ? "badge-implemented"
      : status === "draft"
        ? "badge-draft"
        : status === "partial"
          ? "badge-draft"
          : "badge-planned";
  return (
    <span className={`badge ${cls}`}>
      <span className="dot" aria-hidden="true" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PinnedBadge() {
  return (
    <span className="badge badge-pinned">
      <span className="dot" aria-hidden="true" />
      Pinned
    </span>
  );
}

/* ---------- callouts ---------- */

const CO_ICON: Record<string, ReactNode> = {
  info: <Info size={18} />,
  mental: <Lightbulb size={18} />,
  warn: <AlertTriangle size={18} />,
  danger: <AlertTriangle size={18} />,
  success: <CheckCircle2 size={18} />,
  security: <Shield size={18} />,
  practice: <FlaskConical size={18} />,
};

export function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: keyof typeof CO_ICON;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`callout callout-${variant}`} role="note">
      <span className="co-icon" aria-hidden="true">
        {CO_ICON[variant]}
      </span>
      <div>
        <div className="callout-title">{title}</div>
        <div className="text-[0.92rem] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- code blocks with a small tokenizer ---------- */

interface Tok {
  text: string;
  cls: string | null;
}

const JS_KW = new Set([
  "const","let","var","function","return","if","else","for","while","import","from","export","default",
  "new","async","await","class","extends","interface","type","enum","public","private","readonly","try",
  "catch","throw","switch","case","break","continue","typeof","instanceof","in","of","null","undefined",
  "true","false","this","void","static","get","set","module","require","process",
]);

const SQL_KW = new Set([
  "SELECT","FROM","WHERE","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE","TABLE","INDEX",
  "ON","JOIN","LEFT","RIGHT","INNER","GROUP","BY","ORDER","LIMIT","OFFSET","AND","OR","NOT","NULL",
  "PRIMARY","KEY","REFERENCES","UNIQUE","CONSTRAINT","BEGIN","COMMIT","ROLLBACK","TRANSACTION","AS","WITH",
]);

type TokKind = "js" | "sh" | "json" | "sql";

const RE_JS =
  /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$]*)/g;
const RE_SH =
  /("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(#[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][A-Za-z0-9_$-]*)/g;
const RE_JSON = /("(?:[^"\\\n]|\\.)*")|(-?\b\d+(?:\.\d+)?\b)/g;
const RE_SQL = /('(?:[^'\\]|\\.)*')|(--[^\n]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

function tokenize(code: string, lang: string): Tok[] {
  const kind: TokKind =
    lang === "bash" ? "sh" : lang === "json" ? "json" : lang === "sql" ? "sql" : "js";
  const re = kind === "sh" ? RE_SH : kind === "json" ? RE_JSON : kind === "sql" ? RE_SQL : RE_JS;
  const cls =
    kind === "js"
      ? ["tk-str", "tk-com", "tk-com", "tk-num", "IDENT"]
      : kind === "sh"
        ? ["tk-str", "tk-com", "tk-num", "IDENT"]
        : kind === "json"
          ? ["tk-str", "tk-num"]
          : ["tk-str", "tk-com", "tk-num", "IDENT"];
  const kwSet = kind === "sql" ? SQL_KW : kind === "js" ? JS_KW : null;

  re.lastIndex = 0;
  const toks: Tok[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) toks.push({ text: code.slice(last, m.index), cls: null });
    const full = m[0];
    let groupCls: string | null = null;
    for (let g = 1; g < m.length; g += 1) {
      if (m[g] !== undefined) {
        groupCls = cls[g - 1] === "IDENT" ? null : cls[g - 1];
        if (cls[g - 1] === "IDENT" && kwSet) {
          const word = kind === "sql" ? full.toUpperCase() : full;
          if (kwSet.has(word)) groupCls = "tk-kw";
        }
        break;
      }
    }
    toks.push({ text: full, cls: groupCls });
    last = m.index + full.length;
    if (full.length === 0) re.lastIndex += 1;
  }
  if (last < code.length) toks.push({ text: code.slice(last), cls: null });
  return toks;
}

export function CodeBlock({
  file,
  lang,
  code,
  caption,
}: {
  file: string;
  lang: string;
  code: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toks = tokenize(code, lang);

  return (
    <figure className="codeblock my-4">
      <div className="codeblock-header">
        <span style={{ color: "var(--brand-ink)" }}>{file}</span>
        <span
          className="chip"
          style={{ padding: "0.1rem 0.5rem", fontSize: "0.62rem", background: "transparent" }}
        >
          {lang}
        </span>
        <button type="button" className="copy-btn" onClick={copy} aria-label={`Copy code from ${file}`}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>
          {toks.map((t, i) =>
            t.cls ? (
              <span key={i} className={t.cls}>
                {t.text}
              </span>
            ) : (
              t.text
            ),
          )}
        </code>
      </pre>
      {caption ? (
        <figcaption
          className="px-4 pb-3 text-[0.8rem]"
          style={{ color: "var(--muted)", background: "var(--code-bg)" }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/* ---------- misc ---------- */

export function Meter({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className={`meter ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.22em] mb-2" style={{ color: "var(--brand-ink)" }}>
        {kicker}
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
    </div>
  );
}
