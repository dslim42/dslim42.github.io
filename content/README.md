# Portfolio Content Guide

Edit only JSON source files in this folder:

- `profile.json`: profile, About Me, research interests, education, and contact.
- `research-projects.json`: research-project records.
- `publications.json`: published papers and their quality metadata.
- `manuscripts.json`: unpublished papers, including status, submission date,
  and author role.

The website loads `generated/portfolio-data.js`, which is generated. Do not
edit that generated file by hand.

## Korean and English Fields

Every displayed text field accepts either a bilingual object or suffix fields.
Use the object form for new entries; it keeps both languages together.

```json
{
  "funder": {
    "en": "National Research Foundation of Korea",
    "ko": "한국연구재단(NRF)"
  },
  "pi": {
    "en": "Prof. Example Name",
    "ko": "예시 교수"
  }
}
```

The existing suffix form is also supported: `funder` / `funderKo` and
`pi` / `piKo`. The same rule applies to `title`,
`description`, `focus`, `venue`, and other text fields. When a preferred
language is missing or blank, the value written in the other language is shown
instead. No external machine translation is used.

## Publication Lists and Order

Both `publications.json` and `manuscripts.json` have `international` and
`domestic` arrays. Add published papers to `publications.json`; add submitted,
under-review, or revised papers to `manuscripts.json`. Within each array, the
written JSON order is the displayed order, so place a new paper at the
beginning to show it first.

## Add a Paper With DOI

Add a published paper to the `international` or `domestic` array in
`publications.json`:

```json
{
  "id": "sinas-2026",
  "doi": "10.1007/s10922-025-10005-6",
  "journalGrade": "SCI, Q2 (Top 31.2%, JCR 2024)",
  "isSCI": true,
  "quartile": "Q2"
}
```

When the GitHub Action runs, `scripts/build_portfolio_data.js` queries Crossref
for the title, authors, venue, and year, then regenerates
`generated/portfolio-data.js`. Publication links on the portfolio are DOI-only.

## Add a Paper With BibTeX

Use BibTeX when DOI lookup is unavailable or when you want to control the venue
text exactly:

```json
{
  "id": "metacom-2025",
  "bibtex": "@inproceedings{metacom2025,\n  title={Paper Title},\n  author={Lim, Damsub and Nguyen, Tuan Anh},\n  booktitle={2025 International Conference on Metaverse Computing, Networking and Applications},\n  year={2025},\n  doi={10.xxxx/example}\n}",
  "status": "Accepted"
}
```

The parser reads `title`, `author`, `journal`, `booktitle`, `year`, `doi`,
`url`, `arxiv`, and `abstract`. The rendered portfolio exposes DOI links only.

## Manual Override

Any field in either paper JSON file wins over DOI or BibTeX data. This is useful
for fixing abbreviation, category, SCI/KSCI labels, or links:

```json
{
  "id": "custom-paper",
  "doi": "10.xxxx/example",
  "title": "Preferred Display Title",
  "authors": "D Lim, TA Nguyen",
  "venue": "Preferred Venue Name",
  "year": 2026,
  "status": "Major Revision",
  "journalGrade": "SCI, Q1 (Top 6%, JCR 2024)",
  "isSCI": false,
  "links": { "doi": "10.xxxx/example" }
}
```

## Publication Status and Journal Grade

`status` is a free English text field. It is displayed exactly as entered in
both English and Korean portfolio views. Examples include
`Submitted`, `Minor Revision`, `Major Revision`, `Accepted`, and `In Press`.
Omit `status`, or set it to `Published`, for a published paper without a
status badge.

For a manuscript that does not yet have a finalized author list, `authors` may
be omitted temporarily. The author line is hidden on the portfolio and print
CV until you add it.

When authors are unavailable, use `authorRole` to state your contribution. It
supports either a single value or a bilingual object:

```json
"authorRole": {
  "en": "First Author",
  "ko": "주저자"
}
```

Common values are `First Author`, `Co-author`, and `Corresponding Author`.

Use `submittedDate` for the submission or resubmission date. Write it as
`YYYY-MM-DD` so it remains unambiguous:

```json
"submittedDate": "2026-06-26"
```

It is shown only in the website's manuscripts-in-progress view, not in the
print CV. All entries in `manuscripts.json` are also excluded from the print
CV.

Use `journalGrade` for any manually written journal-quality label, such as
`SCI, Q1 (Top 6%, JCR 2024)`. It overrides the automatic label created from
`isSCI`, `quartile`, `topPercent`, and `jcrYear`. Add `journalGradeKo` only if
you want the journal-grade label itself to be different in Korean; the
publication status remains English by design.

## Local Build

```bash
node scripts/build_portfolio_data.js
```

To only check whether `generated/portfolio-data.js` is current:

```bash
node scripts/build_portfolio_data.js --check
```
