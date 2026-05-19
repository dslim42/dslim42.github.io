# Developer Notes

This is a static GitHub Pages site.

## Publication Data Flow

- Edit source data in `papers/papers.json`.
- Generate site data with `node scripts/build_papers_data.js`.
- The website loads `papers/data.js`.
- Do not use Google Scholar scraping as the primary data source. GitHub Actions
  commonly receives HTTP 403 from Scholar.

## GitHub Action

`.github/workflows/publications.yml` builds publication data instead of
scraping Scholar. It runs when `papers/papers.json` or
`scripts/build_papers_data.js` changes, and it can also be run manually.

## Adding Papers

Preferred order:

1. Use a DOI-only entry if Crossref has the paper metadata.
2. Use BibTeX if DOI lookup is incomplete or unavailable.
3. Use manual fields for exact display text or domestic/KSCI entries.

For detailed examples, see `papers/README.md`.
