# Repository Guidelines

## Project Structure & Module Organization
This is an Astro portfolio/blog repository. Application code lives in `src/`: reusable UI in `src/components`, page shells in `src/layouts`, route files in `src/pages`, shared helpers in `src/lib`, and global styles in `src/styles`. Content is schema-driven under `src/content`:

- `src/content/blog/<slug>/index.md` or `index.mdx`
- `src/content/projects/<slug>/index.md`
- `src/content/work/*.md`

Static assets such as images, fonts, and headers belong in `public/`. Content schemas are defined in `src/content/config.ts`; update that file first if you introduce new frontmatter fields.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the local Astro dev server on `localhost:4321`.
- `npm run dev:network`: expose the dev server on the local network.
- `npm run build`: run Astro type/content checks, then build into `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across `.ts`, `.astro`, and content-adjacent files.
- `npm run lint:fix`: apply safe lint fixes.

## Coding Style & Naming Conventions
Use 2-space indentation in Markdown frontmatter and existing Astro/TS files. ESLint enforces semicolons and double quotes; run `npm run lint` before opening a PR. Follow the existing content naming pattern: folder-based slugs for blog/projects (`src/content/blog/09-understanding-langgraph/index.md`) and descriptive filenames for work entries (`src/content/work/fnb.md`).

Keep blog and project frontmatter minimal and valid:

- blog/projects: `title`, `description`, `date`, optional `draft`
- work: `company`, `role`, `dateStart`, `dateEnd`

## Testing Guidelines
There is no dedicated unit test suite in this checkout. Treat `npm run build` as the required validation step because it runs Astro content/schema checks. Run `npm run lint` alongside it for every change. If you add interactive behavior, verify the affected route locally with `npm run dev` or `npm run preview`.

For browser smoke testing, start Astro in one terminal with `npm run dev`, then use `playwright-cli` against `http://localhost:4321`. A minimal pass is: open the home page, confirm the title, click `blog`, and open one content entry. Example:

```bash
playwright-cli open --browser=chromium http://localhost:4321
playwright-cli eval "document.title"
playwright-cli click e8
playwright-cli click e23
```

In this environment Astro listened on IPv6 localhost (`[::1]:4321`), so `curl http://127.0.0.1:4321` failed even while Playwright succeeded. Prefer browser-based verification over `curl` if that happens again.

## Commit & Pull Request Guidelines
Recent commits favor short, imperative summaries such as `add new blog post` or `enhance blog post on LangGraph`. Keep commit subjects concise, lowercase is acceptable, and lead with the user-facing change. PRs should include:

- a short description of the change
- linked issue/context when applicable
- screenshots for visible UI changes
- confirmation that `npm run lint` and `npm run build` passed
