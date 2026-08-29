import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from "react";

/** Minimal hash router: deep links survive static hosting, no server rewrites needed. */

const readHash = (): string => {
  if (typeof window === "undefined") return "";
  const h = window.location.hash;
  if (!h || h === "#" || h === "#/") return "";
  return h.replace(/^#\/?/, "");
};

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(readHash);
  useEffect(() => {
    const onChange = () => setRoute(readHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function navigate(to: string): void {
  const target = to.startsWith("#") ? to : `#/${to}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
}

export function splitRoute(route: string): { name: string; param: string } {
  const [name = "", param = ""] = route.split("/");
  return { name, param };
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export function Link({ to, children, ...rest }: LinkProps) {
  const href = to.startsWith("#") ? to : `#/${to}`;
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

/** Imperative scroll to an element id without touching the hash router. */
export function scrollToId(id: string): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
