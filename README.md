# Academic Portfolio Website

Static academic profile site for GitHub Pages.

## Key Files

- `content/`: Editable JSON source files. This is the only folder needed for content updates.
- `content/profile.json`: Profile, About Me, research interests, education/experience, and contact.
- `content/research-projects.json`: Editable bilingual research-project records.
- `content/publications.json`: Published papers and their quality metadata.
- `content/manuscripts.json`: Submitted, under-review, or revised papers.
- `generated/portfolio-data.js`: Generated data loaded by both the website and print view. Do not edit it directly.
- `scripts/build_portfolio_data.js`: Builds `generated/portfolio-data.js` from `content/*.json`.
- `scripts/portfolio-ui.js`: Renders the JSON data into the existing portfolio UI and print handoff. Do not edit it for ordinary content updates.
- `.github/workflows/publications.yml`: Builds the portfolio data and deploys GitHub Pages.

## Add a Publication

For a published paper, edit `content/publications.json` and add one object to
either the `international` or `domestic` array. For an unpublished paper, use
the matching array in `content/manuscripts.json` instead.

### DOI-only Entry

```json
{
  "id": "my-paper-2026",
  "doi": "10.xxxx/example",
  "journalGrade": "SCI, Q2 (Top 31.2%, JCR 2024)",
  "isSCI": true,
  "quartile": "Q2"
}
```

The build script looks up title, authors, venue, and year from Crossref.
`id` is an arbitrary but unique, stable identifier (for example,
`edge-storage-2026`). Do not reuse it for another paper.

Publication order follows the object order in each array. Published papers use
`publications.json`; manuscripts use `manuscripts.json` and appear at the top
when the manuscripts toggle is opened. `displayOrder` is not needed.

### BibTeX Entry

```json
{
  "id": "my-conference-paper-2026",
  "bibtex": "@inproceedings{example2026,\n  title={Paper Title},\n  author={Lim, Damsub and Nguyen, Tuan Anh},\n  booktitle={Conference Name},\n  year={2026},\n  doi={10.xxxx/example}\n}",
  "status": "Accepted"
}
```

### Manual Entry

```json
{
  "id": "manual-paper-2026",
  "isKSCI": true,
  "title": "Paper Title",
  "authors": "D Lim, TA Nguyen",
  "venue": "Journal Name",
  "year": 2026,
  "status": "Major Revision",
  "journalGrade": "KSCI",
  "links": { "doi": "10.xxxx/example" }
}
```

### Publication Status and Journal Grade

`status` accepts any English text and is shown exactly as entered, regardless
of the portfolio language: for example `Submitted`, `Minor Revision`, `Major
Revision`, `Accepted`, or `In Press`. Omit it (or use `Published`) for a
published paper with no status badge.

For a manuscript without a finalized author list, `authors` can be omitted
temporarily. The portfolio and print CV hide the empty author line.

Use `authorRole` in that case to show your role, for example:

```json
"authorRole": { "en": "First Author", "ko": "주저자" }
```

`First Author`, `Co-author`, and `Corresponding Author` are typical values.

Use `submittedDate` for a submission or resubmission date, in `YYYY-MM-DD`
format. It appears only in the website's manuscripts-in-progress view and is
not printed in the CV.

`journalGrade` accepts a manually written quality label such as `SCI, Q1 (Top
6%, JCR 2024)`. It overrides the automatic label created from `isSCI`,
`quartile`, `topPercent`, and `jcrYear`. `journalGradeKo` is optional for a
separate Korean grade label; status stays English by design.

## Build Locally

```bash
node scripts/build_portfolio_data.js
```

Check whether the generated file is current:

```bash
node scripts/build_portfolio_data.js --check
```

## Edit Portfolio Content

Use these source files instead of editing content directly in `index.html`:

- `content/profile.json`: profile, social links, About Me, research interests,
  education/experience, and contact.
- `content/publications.json`: published papers and their DOI/quality metadata.
- `content/manuscripts.json`: unpublished papers, their status, author role,
  and submission date.
- `content/research-projects.json`: research-project records.

After editing any JSON source locally, run `node scripts/build_portfolio_data.js`.
On GitHub, every push to `main` builds the browser-readable data file from the
JSON sources and deploys the updated Pages site automatically.

### Flexible JSON Entries

All section arrays render every item they contain, so adding or removing an
entry does not require an `index.html` edit. Optional fields are omitted from
the screen when empty.

`content/profile.json` supports rich About Me paragraphs. Each paragraph is one
array item with `en` and `ko` content. A content part can be a plain string or
an object with `text`, plus optional `href`, `bold`, or `italic`.

```json
{
  "en": [
    { "text": "Researcher at " },
    { "text": "KADA", "href": "https://example.org" },
    { "text": " working on " },
    { "text": "reliable systems", "bold": true }
  ],
  "ko": [
    { "text": "KADA에서 " },
    { "text": "신뢰성 있는 시스템", "bold": true },
    { "text": "을 연구합니다." }
  ]
}
```

For research projects, `period`, `funder`, `description`, and `focus` are
optional. A bilingual field may use either the existing `title` / `titleKo`
form or an object form such as `"title": { "en": "...", "ko": "..." }`.

## GitHub Workflow

Every push to `main` runs the data build and deploys a fresh GitHub Pages
artifact. This prevents a generated-data commit from being published separately
from the JSON change that produced it.

## Local Preview

Open `index.html` directly in a browser, or run a local static server:

```bash
npx http-server
```
