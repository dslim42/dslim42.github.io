# Academic Portfolio Website

Static academic profile site for GitHub Pages.

## Key Files

- `index.html`: Main page and publication rendering logic.
- `papers/papers.json`: Source publication list. Edit this file when adding papers.
- `papers/data.js`: Generated publication data loaded by the website.
- `scripts/build_papers_data.js`: Builds `papers/data.js` from `papers/papers.json`.
- `.github/workflows/publications.yml`: GitHub Action that regenerates publication data.

## Add a Publication

Edit `papers/papers.json` and add one object to the `papers` array.

### DOI-only Entry

```json
{
  "id": "my-paper-2026",
  "doi": "10.xxxx/example",
  "category": "international",
  "isSCI": true,
  "quartile": "Q2"
}
```

The build script looks up title, authors, venue, and year from Crossref.

### BibTeX Entry

```json
{
  "id": "my-conference-paper-2026",
  "bibtex": "@inproceedings{example2026,\n  title={Paper Title},\n  author={Lim, Damsub and Nguyen, Tuan Anh},\n  booktitle={Conference Name},\n  year={2026},\n  doi={10.xxxx/example}\n}",
  "category": "international"
}
```

### Manual Entry

```json
{
  "id": "manual-paper-2026",
  "category": "domestic",
  "isKSCI": true,
  "title": "Paper Title",
  "authors": "D Lim, TA Nguyen",
  "venue": "Journal Name",
  "year": 2026,
  "links": {
    "doi": "10.xxxx/example",
    "pdf": "papers/paper.pdf"
  }
}
```

## Build Locally

```bash
node scripts/build_papers_data.js
```

Check whether the generated file is current:

```bash
node scripts/build_papers_data.js --check
```

## GitHub Workflow

When `papers/papers.json` is changed on GitHub, the Action regenerates
`papers/data.js` and commits it back if the generated file changed.

This replaces the older Google Scholar scraping workflow, which was unreliable
because Scholar blocks GitHub Actions with HTTP 403 responses.

## Local Preview

Open `index.html` directly in a browser, or run a local static server:

```bash
npx http-server
```
