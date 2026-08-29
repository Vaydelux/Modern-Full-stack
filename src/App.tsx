import { useEffect, useState, type ReactElement } from "react";
import { Compass } from "lucide-react";
import { Footer, MobileDrawer, Sidebar, TopBar, UpdateToast } from "./components/chrome";
import { SearchOverlay, useSearchHotkey } from "./components/SearchOverlay";
import { CelebrationOverlay } from "./components/CelebrationOverlay";
import { lessonById } from "./data/curriculum";
import { AppProviders } from "./lib/store";
import { splitRoute, useHashRoute } from "./lib/router";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import LessonView from "./pages/LessonView";
import { GlossaryPage, TroubleshootingPage, VersionsPage } from "./pages/Reference";
import { ManifestPage, MasteryPage, ReadinessPage, StatusPage, TokensPage } from "./pages/Meta";
import Roadmap from "./pages/Roadmap";

function NotFound() {
  return (
    <div className="max-w-site py-16">
      <div className="panel p-10 max-w-xl mx-auto text-center">
        <Compass size={34} style={{ color: "var(--muted)" }} className="mx-auto" />
        <h1 className="font-display font-bold text-2xl mt-4">Route not on the map</h1>
        <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>
          This path is not part of the course. The roadmap has everything that is.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <a href="#/" className="btn btn-primary">Home</a>
          <a href="#/roadmap" className="btn btn-ghost">Roadmap</a>
        </div>
      </div>
    </div>
  );
}

const TITLES: Record<string, string> = {
  "": "Zero to Mastery — Modern Full-Stack Web Development",
  dashboard: "Dashboard — Zero to Mastery",
  roadmap: "Roadmap & Mastery Ladder — Zero to Mastery",
  glossary: "Glossary — Zero to Mastery",
  troubleshooting: "Fix It: Troubleshooting — Zero to Mastery",
  versions: "Version Matrix — Zero to Mastery",
  tokens: "Design Tokens — Zero to Mastery",
  manifest: "Course Manifest — Zero to Mastery",
  status: "Course Status — Zero to Mastery",
  mastery: "Mastery Levels — Zero to Mastery",
  readiness: "Production Readiness — Zero to Mastery",
};

function Shell() {
  const route = useHashRoute();
  const { name, param } = splitRoute(route);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchHotkey(() => setSearchOpen((v) => !v));

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    setMenuOpen(false);
  }, [route]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (name === "lesson") {
      const found = lessonById(param);
      document.title = found
        ? `${found.lesson.title} — Zero to Mastery`
        : "Lesson — Zero to Mastery";
    } else {
      document.title = TITLES[name] ?? "Zero to Mastery — Modern Full-Stack Web Development";
    }
  }, [name, param]);

  let page: ReactElement;
  switch (name) {
    case "":
      page = <Landing />;
      break;
    case "dashboard":
      page = <Dashboard />;
      break;
    case "roadmap":
      page = <Roadmap />;
      break;
    case "lesson":
      page = <LessonView id={param} key={param} />;
      break;
    case "glossary":
      page = <GlossaryPage />;
      break;
    case "troubleshooting":
      page = <TroubleshootingPage />;
      break;
    case "versions":
      page = <VersionsPage />;
      break;
    case "tokens":
      page = <TokensPage />;
      break;
    case "manifest":
      page = <ManifestPage />;
      break;
    case "status":
      page = <StatusPage />;
      break;
    case "mastery":
      page = <MasteryPage />;
      break;
    case "readiness":
      page = <ReadinessPage />;
      break;
    default:
      page = <NotFound />;
  }

  const isLanding = route === "";

  return (
    <div className="min-h-screen flex flex-col w-full max-w-full">
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          if (main) {
            main.focus({ preventScroll: false });
            main.scrollIntoView();
          }
        }}
      >
        Skip to content
      </a>
      <TopBar route={route} onMenu={() => setMenuOpen(true)} onSearch={() => setSearchOpen(true)} />
      <MobileDrawer route={route} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CelebrationOverlay />
      <UpdateToast />
      <div className="flex flex-1 w-full max-w-full min-w-0">
        {!isLanding && <Sidebar route={route} />}
        <main id="main" tabIndex={-1} className="flex-1 min-w-0 w-full outline-none">
          {page}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Shell />
    </AppProviders>
  );
}
