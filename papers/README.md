# Publications Data Guide

The source file is `papers/papers.json`.

The website loads `papers/data.js`, but that file is generated. Do not edit
`papers/data.js` by hand unless you are making an emergency one-off fix.

## Add a Paper With DOI

Add a new object to the `papers` array:

```json
{
  "id": "sinas-2026",
  "doi": "10.1007/s10922-025-10005-6",
  "category": "international",
  "isSCI": true,
  "quartile": "Q2"
}
```

When the GitHub Action runs, `scripts/build_papers_data.js` queries Crossref
for the title, authors, venue, and year, then regenerates `papers/data.js`.

Use `links` for extra buttons:

```json
{
  "id": "my-paper-2026",
  "doi": "10.xxxx/example",
  "category": "international",
  "links": {
    "pdf": "papers/my-paper.pdf",
    "code": "https://github.com/user/repo"
  }
}
```

## Add a Paper With BibTeX

Use BibTeX when DOI lookup is unavailable or when you want to control the venue
text exactly:

```json
{
  "id": "metacom-2025",
  "bibtex": "@inproceedings{metacom2025,\n  title={Paper Title},\n  author={Lim, Damsub and Nguyen, Tuan Anh},\n  booktitle={2025 International Conference on Metaverse Computing, Networking and Applications},\n  year={2025},\n  doi={10.xxxx/example}\n}",
  "category": "international"
}
```

The parser reads `title`, `author`, `journal`, `booktitle`, `year`, `doi`,
`url`, `pdf`, `code`, `demo`, `arxiv`, and `abstract`.

## Manual Override

Any field in `papers/papers.json` wins over DOI or BibTeX data. This is useful
for fixing abbreviation, category, SCI/KSCI labels, or links:

```json
{
  "id": "custom-paper",
  "doi": "10.xxxx/example",
  "title": "Preferred Display Title",
  "authors": "D Lim, TA Nguyen",
  "venue": "Preferred Venue Name",
  "year": 2026,
  "category": "international",
  "isSCI": false,
  "links": {
    "doi": "10.xxxx/example",
    "url": "https://example.com/paper"
  }
}
```

## Local Build

```bash
node scripts/build_papers_data.js
```

To only check whether `papers/data.js` is current:

```bash
node scripts/build_papers_data.js --check
```
