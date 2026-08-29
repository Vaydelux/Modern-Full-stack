import type { LessonContent } from "./types";

export const LESSON_CONTENT_P36: Record<string, LessonContent> = {
  "p36-l1": {
    id: "p36-l1",
    phaseId: "p36",
    title: "Branches, Merges & Rebase Concepts",
    level: "Advanced",
    minutes: 35,
    summary:
      "Master professional Git history management. Compare `git merge`, `git rebase -i` (Interactive Rebasing), and Squash merges for pristine git commit graphs.",
    prerequisites: ["p00-l1 Development Setup"],
    objectives: [
      "Explain the exact DAG (Directed Acyclic Graph) differences between Merge commits and Rebase replays.",
      "Execute interactive rebases (`git rebase -i HEAD~N`) to squash, reword, and reorder commits.",
      "Safely recover lost commits using `git reflog`.",
    ],
    simple:
      "When working on a feature for 3 days while your teammates merge 10 commits to `main`, your branch falls behind. `git merge main` creates ugly 'Merge branch main into feature' clutter commits. `git rebase main` lifts your 3 feature commits and replays them cleanly on top of the latest `main`, creating a straight, linear, and readable git history.",
    why:
      "A clean linear git history makes `git bisect` automated bug hunting and rollback operations 10x faster.",
    mentalModel: {
      title: "The Stack of Paper Sheets",
      body:
        "Merging is taping two stacks of paper together with a giant staple (Merge commit). Rebasing is lifting your 3 new pages and placing them neatly on top of the newly updated book chapters.",
    },
    sections: [
      {
        heading: "1. Interactive Rebasing Workflow",
        body: [
          "- Clean up messy 'WIP' or 'fix typo' commits before submitting a Pull Request.",
          "- Commands: `pick` (keep), `squash` (combine into previous commit), `reword` (edit message), `drop` (delete).",
        ],
        code: [
          {
            file: "git-rebase.sh",
            lang: "bash",
            code: [
              "# 1. Fetch latest changes from remote",
              "git fetch origin",
              "",
              "# 2. Rebase feature branch onto latest main",
              "git rebase origin/main",
              "",
              "# 3. Squash the last 4 commits into one clean feature commit",
              "git rebase -i HEAD~4",
              "",
              "# 4. If something goes wrong, abort safely without losing work",
              "git rebase --abort",
            ].join("\n"),
            caption: "Professional git rebase and squash workflow.",
          },
        ],
      },
    ],
    mistake: {
      title: "Force-Pushing (git push -f) to Shared Public Branches like main",
      wrong: [
        "// ❌ Force pushing over public shared branches:",
        "git push origin main --force # Overwrites teammate commits and breaks everyone's local repos!",
      ].join("\n"),
      right: [
        "// ✅ Use `--force-with-lease` on your private personal feature branches only.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Clean a 5-Commit Branch with Interactive Rebase",
      description:
        "Create 5 messy commits (typos, WIPs), run `git rebase -i HEAD~5`, squash them into a single descriptive commit, and verify with `git log --oneline`.",
      tasks: [
        "Create branch and make 5 small commits.",
        "Run `git rebase -i HEAD~5` and set commits 2-5 to `squash`.",
        "Verify `git log` shows 1 clean commit.",
      ],
    },
    quiz: [
      {
        question: "Why is 'git push --force-with-lease' safer than raw 'git push --force'?",
        options: [
          "It refuses to overwrite remote changes if someone else pushed new commits to the branch since you last fetched, preventing accidental code destruction.",
          "It encrypts git commits with SSH.",
          "It runs ESLint before pushing.",
          "It works without an internet connection.",
        ],
        answer: 0,
        explanation:
          "--force-with-lease checks that the remote ref matches your local tracking ref before force-updating, protecting teammate commits from being erased.",
      },
    ],
  },

  "p36-l2": {
    id: "p36-l2",
    phaseId: "p36",
    title: "Pull Requests & Code Review Etiquette",
    level: "Advanced",
    minutes: 30,
    summary:
      "Craft high-signal Pull Requests that reviewers love. Master empathetic, actionable code review conventions using Conventional Comments (e.g. `praise:`, `nit:`, `blocking:`, `question:`).",
    prerequisites: ["p36-l1 Git Concepts"],
    objectives: [
      "Author structured PR descriptions with Context, Changes, Testing Steps, and UI Screenshots.",
      "Apply Conventional Comments standards for clear, non-confrontational review feedback.",
      "Keep PR diffs under 300 lines to maximize review depth and bug detection.",
    ],
    simple:
      "Code review is not an exam or a gatekeeping exercise — it's a team knowledge-sharing and quality habit. A 2,000-line PR gets reviewed with a quick 'LGTM 👍' (and 5 hidden bugs slip into production). A 200-line PR with clear before/after screenshots and testing instructions gets reviewed thoughtfully in 10 minutes.",
    why:
      "Clear PR etiquette builds high team velocity, high morale, and stops regressions before they reach production.",
    mentalModel: {
      title: "The Editorial Desk",
      body:
        "An author doesn't dump a 900-page unformatted manuscript on an editor's desk without a chapter summary. They present polished chapters with notes on character arcs so the editor can provide high-value polish.",
    },
    sections: [
      {
        heading: "1. Conventional Comments Prefixes",
        body: [
          "- **`suggestion:`**: A proposed alternative improvement (non-blocking).",
          "- **`blocking:`**: A critical security vulnerability or data loss bug that must be resolved before merge.",
          "- **`nit:`**: A minor formatting or styling detail (can be merged without fixing).",
          "- **`question:`**: Inquiring about context or intent without implying something is wrong.",
          "- **`praise:`**: Recognizing clean architecture, great test coverage, or elegant solutions.",
        ],
      },
    ],
    mistake: {
      title: "Submitting 2,500-Line PRs with Vague Titles like 'Fix stuff'",
      wrong: [
        "// ❌ PR Title: 'Updates and fixes'",
        "// Description: Empty. Diff: +2,480 / -1,230 across 45 files.",
      ].join("\n"),
      right: [
        "// ✅ PR Title: 'feat(billing): add stripe webhook handler for subscription renewals'",
        "// Description: Includes Problem, Solution, Screenshots, and Test plan. Diff < 250 lines.",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Draft a PR Description Template and Review Simulation",
      description:
        "Fill out a comprehensive PR markdown template including reproduction steps, test coverage report, and mock review comment feedback.",
      tasks: [
        "Create `.github/pull_request_template.md`.",
        "Draft simulated PR with summary, screenshots, and test checklist.",
        "Add 3 Conventional Comments (praise, suggestion, nit).",
      ],
    },
    quiz: [
      {
        question: "What is the primary benefit of prefixing code review comments with labels like 'nit:' or 'suggestion:'?",
        options: [
          "It communicates the urgency and blocking level of the comment explicitly, preventing authors from getting blocked by minor styling opinions.",
          "It automatically generates GitHub Actions.",
          "It translates comments into other languages.",
          "It compiles the code.",
        ],
        answer: 0,
        explanation:
          "Conventional Comments clarify whether feedback is a mandatory blocking issue or an optional polish suggestion, reducing friction and ambiguity.",
      },
    ],
  },

  "p36-l3": {
    id: "p36-l3",
    phaseId: "p36",
    title: "Conflict Resolution Drills",
    level: "Advanced",
    minutes: 40,
    summary:
      "Tackle complex 3-way merge conflicts with confidence. Master VS Code merge editors, resolve `package-lock.json` / `pnpm-lock.yaml` collisions, and handle schema migration conflicts.",
    prerequisites: ["p36-l1 Git Concepts"],
    objectives: [
      "Understand 3-way merge conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`).",
      "Safely resolve lockfile merge conflicts (`pnpm install --fix-lockfile`).",
      "Resolve database migration sequence conflicts without corrupting migration history.",
    ],
    simple:
      "Merge conflicts happen when two developers edit the exact same lines of code simultaneously. Git stops and asks: 'Which version should I keep?' Conflict resolution is simply reviewing both developers' changes, combining the best parts into valid code, and telling Git to continue.",
    why:
      "Fear of merge conflicts causes developers to hoard branches for weeks, which only makes eventual conflicts exponentially worse.",
    mentalModel: {
      title: "The Document Co-Author",
      body:
        "If you and your co-author both edit the final paragraph of Chapter 3, you sit down together, read both paragraphs, and write a unified final version that flows seamlessly.",
    },
    sections: [
      {
        heading: "1. Anatomy of a Git Conflict Block",
        body: [
          "```",
          "<<<<<<< HEAD (Current Change - Your Branch)",
          "export const API_TIMEOUT = 5000;",
          "=======",
          "export const API_TIMEOUT = 8000;",
          ">>>>>>> main (Incoming Change - Remote Main)",
          "```",
        ],
        code: [
          {
            file: "conflict-resolution.sh",
            lang: "bash",
            code: [
              "# 1. If a lockfile conflicts during rebase",
              "git checkout --ours pnpm-lock.yaml",
              "pnpm install",
              "",
              "# 2. After editing conflicting files, mark them resolved",
              "git add src/config.ts pnpm-lock.yaml",
              "",
              "# 3. Continue the rebase process",
              "git rebase --continue",
            ].join("\n"),
            caption: "Lockfile conflict resolution workflow.",
          },
        ],
      },
    ],
    mistake: {
      title: "Manually Editing Git Conflict Markers in Large JSON Lockfiles",
      wrong: [
        "// ❌ Trying to manually resolve 400 lines of conflict in package-lock.json with a text editor:",
        "// Almost always introduces JSON syntax errors and corrupted checksum hashes!",
      ].join("\n"),
      right: [
        "// ✅ Check out the incoming lockfile and let the package manager recalculate: `git checkout --theirs pnpm-lock.yaml && pnpm install`",
      ].join("\n"),
    },
    exercise: {
      title: "Lab: Resolve a 3-Way File Conflict in Git",
      description:
        "Create two conflicting branches modifying the same function signature, initiate a merge, resolve the conflict in VS Code, and commit the resolution.",
      tasks: [
        "Create `branch-a` and modify `calculateDiscount()`.",
        "Create `branch-b` from main and modify the same lines differently.",
        "Merge `branch-a` into `branch-b`, resolve markers, and verify tests pass.",
      ],
    },
    quiz: [
      {
        question: "What is the recommended approach for resolving a complex merge conflict in a package lockfile (e.g. pnpm-lock.yaml)?",
        options: [
          "Delete git repository and clone again.",
          "Check out one version of the lockfile and re-run the package manager install command to automatically regenerate a valid consistent lockfile state.",
          "Delete all dependencies from package.json.",
          "Manually edit all JSON hashes.",
        ],
        answer: 1,
        explanation:
          "Re-running package manager install ensures dependency tree consistency, integrity hashes, and deduplication are recalculated correctly by the tool.",
      },
    ],
  },
};
