# Claude Web Design Cheat Sheet

A practical guide to extending Claude Code with **Skills** so it produces production-grade frontends instead of the generic, AI-flavored output it gives by default.

> **Note:** Every command and repo in this guide has been verified. Where the source material was ambiguous or wrong, this document corrects it and explains why.

---

## 1. Prerequisite: Claude Code

Skills only work inside **Claude Code** — Anthropic's CLI agent that runs in your terminal and can read, write, and execute code on your machine. Get it from <https://claude.ai/code>.

The web-based `claude.ai` chat product cannot install or invoke these skills.

---

## 2. How Skills Actually Work

A **Skill** is a directory containing a `SKILL.md` file with structured prompts, optional helper scripts, and reference material. Claude Code discovers skills automatically and loads them when a user prompt matches the skill's trigger description.

There are two common install paths:

### a) `npx skills` — Vercel's open agent-skills CLI

The [`vercel-labs/skills`](https://github.com/vercel-labs/skills) package installs skills from any GitHub repo following the open `SKILL.md` standard:

```bash
npx skills add <github-org>/<repo>
# or pick specific skills out of a multi-skill repo:
npx skills add <github-org>/<repo> --skill <skill-name>
```

### b) `skillfish` — cross-agent skill manager

[`knoxgraeme/skillfish`](https://github.com/knoxgraeme/skillfish) syncs skills across Claude Code, Cursor, Copilot, and other agents:

```bash
npx skillfish add <github-org>/<repo> <skill-name>
npx skillfish list
npx skillfish update
```

Either tool drops the skill into `~/.claude/skills/` (user scope) or `.claude/skills/` (project scope), which is also where you'd place a hand-written `SKILL.md` if you wanted to author one yourself.

---

## 3. Recommended Skills for Web Design

### Frontend Design (Anthropic, official)

Teaches Claude visual hierarchy, distinctive typography, restrained color palettes, and how to avoid the "AI-generated landing page" look. Lives in the [`anthropics/claude-code`](https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design) repo as a plugin.

```bash
npx skills add anthropics/claude-code --skill frontend-design
```

> The widely shared command `npx skills add anthropics/claude-code-skill-frontend-design` points at a repo name that does not exist. Use the form above instead.

### Animation: motion-framer + gsap-scrolltrigger

High-performance motion with Framer Motion and GSAP ScrollTrigger, with `prefers-reduced-motion` handling baked in. From [`freshtechbro/claudedesignskills`](https://github.com/freshtechbro/claudedesignskills), a 23-skill repo focused on modern web animation and 3D.

```bash
npx skills add freshtechbro/claudedesignskills --skill motion-framer --skill gsap-scrolltrigger
```

> The widely shared command `npx skillfish add itsimonfredlingjack/codex-dev-plugin animation-libraries` does not work. That repo exists but has no skill named `animation-libraries`. Use the command above instead.

### Web Design Architecture

Mobile-first layout, WCAG accessibility, Tailwind conventions. From [`aviflombaum/claude-code-in-avinyc`](https://github.com/aviflombaum/claude-code-in-avinyc), a multi-skill repo.

```bash
npx skills add aviflombaum/claude-code-in-avinyc --skill avinyc:web-design
```

> Note the `avinyc:` namespace — without it, the installer reports "no matching skills found." All skills in this repo are namespaced.

---

## 4. Using Skills in a Session

Skills are **auto-triggered by context**, not chained inline. Once installed, you don't need to type `/frontend-design` to invoke it — Claude Code reads the skill descriptions and loads the relevant one(s) when your prompt matches.

A good prompt looks like this:

> Build a landing page for a luxury watch brand. Hero with a dark, editorial feel; full-bleed product photography; smooth scroll-linked entry transitions for each section; mobile-first; WCAG AA contrast.

Claude will load `frontend-design`, `animation-libraries`, and `web-design` together because the prompt describes work each one covers. You can also list installed skills with `/skill` (or `npx skillfish list`) and force-invoke one as `/skill-name` if needed.

---

## 5. Iterating

- `/simplify` — review changed code for reuse, quality, and efficiency, then fix issues.
- `/review` — review a pull request before you ship.
- `/security-review` — audit pending changes on the current branch for security issues.

Run these after the first build pass; they're meant for cleanup, not greenfield work.

---

## TL;DR

The leverage isn't asking Claude to "design a site." It's giving Claude the same reference material a senior designer would have on hand — typography rules, motion principles, accessibility checklists — and letting the model apply them. Skills are how you load that reference material in once and reuse it on every project.
