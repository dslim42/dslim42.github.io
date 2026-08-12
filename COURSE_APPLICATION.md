# CV Short-Course Application Prototype

## Scope

This is a separate, static GitHub Pages-ready copy of the original portfolio.
The original `miaow89.github.io` folder is unchanged. No backend, database,
Supabase, build server, or secret is required.

## Verified source material

- Existing portfolio: `index.html`, `generated/portfolio-data.js`, and local assets.
- Latest published portfolio reviewed at `https://dslim42.github.io/` on
  2026-08-12. Its publication entries are the current source for the two
  verified JCR 2024 indicators included here.
- CV reviewed while creating this prototype, labelled `Updated 25.11.06` on
  its first page. The PDF is intentionally not included in this publishable
  folder.

The short-course notes for 2026-08-10 to 2026-08-11 were not present in this
workspace. Accordingly, this prototype uses only general CV-portfolio
practices and makes no claim that it is a verbatim implementation of material
that could not be inspected.

## Applied principles

1. **Evidence before decoration**: add a project section only where the CV
   supplies a project title, period, funder, and contribution context.
2. **Role and scope clarity**: each project explains what work was performed,
   rather than adding unverified outcome numbers.
3. **Content/presentation separation**: project facts are stored in
   `content/research-projects.json`; `index.html` renders them with the existing
   portfolio classes.
4. **Single live source for printing**: the print view reads the currently
   opened portfolio's project, publication, education, profile, and research
   interest content instead of relying on an uploaded PDF.

## Files changed from the original copy

- `index.html`: adds the `Research Projects` section between Publications and
  Education/Experience. It reuses the original typography, colors, spacing,
  language toggle, and responsive layout. Its editable profile sections are
  rendered from `content/profile.json` at runtime.
- `content/profile.json`: editable profile, introduction, research interests,
  education/experience, contact, social links, and project-introduction data.
- `content/research-projects.json`: holds bilingual, CV-backed project data used by
  both the portfolio section and print view.
- `generated/portfolio-data.js`: generated browser-readable data used by every section.
- `print-cv.html`: an A4 print-only view that reads the opened portfolio at
  print time; it does not load or create a PDF file.
- `content/publications.json`: publication source data. The two verified JCR 2024
  metrics shown are Q1 / Top 6% and Q2 / Top 31.2%; paper PDFs are excluded
  from the site and DOI is the only publication link.

## Print CV

Select the printer icon on the portfolio. It opens a print-only page in the
same language currently selected on the portfolio, reads the current
portfolio content, then opens the browser's print dialog. The page contains,
in order:

1. Profile
2. Education
3. Publications
4. Research Projects
5. Research Interests & Activities

Use the browser's `Save as PDF` destination only if a file is wanted. The
print page uses no backend service and does not upload or retain a PDF.

## GitHub Pages deployment

Publish this folder as the root of a GitHub Pages repository or copy its
contents into a separate branch/repository configured for Pages. All paths are
relative, so the page requires only static hosting.

## Review before publishing

- Replace or remove any project whose period, title, funder, or contribution
  is no longer current.
- Add measurable outcomes only with a citable source.
- Reconcile the homepage employment line with the CV if a newer formal CV is
  available; this prototype intentionally leaves the original header intact.
