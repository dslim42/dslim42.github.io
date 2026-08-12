const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLICATIONS_FILE = path.join(ROOT, "content", "publications.json");
const MANUSCRIPTS_FILE = path.join(ROOT, "content", "manuscripts.json");
const PROFILE_FILE = path.join(ROOT, "content", "profile.json");
const PROJECTS_FILE = path.join(ROOT, "content", "research-projects.json");
const OUTPUT_FILE = path.join(ROOT, "generated", "portfolio-data.js");

const CHECK_MODE = process.argv.includes("--check");

function stripOuter(value) {
  if (value == null) return null;
  return String(value)
    .trim()
    .replace(/^["{]+/, "")
    .replace(/["}]+$/, "")
    .trim();
}

function cleanDoi(doi) {
  if (!doi) return null;
  return String(doi)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .trim();
}

function titleCaseNameFromBibtex(author) {
  const cleaned = author.replace(/[{}]/g, "").trim();
  if (cleaned.includes(",")) {
    const [last, first] = cleaned.split(",").map((part) => part.trim());
    return [first, last].filter(Boolean).join(" ");
  }
  return cleaned;
}

function isSamePerson(nameA, nameB) {
  if (!nameA || !nameB) return false;
  const normalize = (name) =>
    String(name)
      .toLowerCase()
      .replace(/[{}.,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const a = normalize(nameA);
  const b = normalize(nameB);
  if (a === b) return true;

  const aParts = a.split(" ").filter(Boolean);
  const bParts = b.split(" ").filter(Boolean);
  if (aParts.length < 2 || bParts.length < 2) return false;

  const aLast = aParts[aParts.length - 1];
  const bLast = bParts[bParts.length - 1];
  if (aLast !== bLast) return false;

  const aGiven = new Set(aParts.slice(0, -1));
  const bGiven = new Set(bParts.slice(0, -1));
  return [...aGiven].every((part) => bGiven.has(part)) || [...bGiven].every((part) => aGiven.has(part));
}

function parseAuthors(authors, yourName) {
  if (!authors) return null;
  if (Array.isArray(authors)) return authors;
  return String(authors)
    .split(/\s+and\s+/i)
    .map(titleCaseNameFromBibtex)
    .filter(Boolean)
    .map((name) => ({
      name,
      bold: isSamePerson(name, yourName),
    }));
}

function extractBibtexField(bibtex, fieldName) {
  const pattern = new RegExp(`${fieldName}\\s*=\\s*`, "i");
  const match = bibtex.match(pattern);
  if (!match) return null;

  let index = match.index + match[0].length;
  while (/\s/.test(bibtex[index])) index += 1;

  if (bibtex[index] === "{") {
    let depth = 0;
    let value = "";
    for (let i = index; i < bibtex.length; i += 1) {
      const char = bibtex[i];
      if (char === "{") {
        depth += 1;
        if (depth > 1) value += char;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) break;
        value += char;
      } else {
        value += char;
      }
    }
    return value.trim();
  }

  if (bibtex[index] === '"') {
    let escaped = false;
    let value = "";
    for (let i = index + 1; i < bibtex.length; i += 1) {
      const char = bibtex[i];
      if (char === '"' && !escaped) break;
      value += char;
      escaped = char === "\\" && !escaped;
    }
    return value.trim();
  }

  const end = bibtex.slice(index).search(/[,}]/);
  if (end === -1) return null;
  return stripOuter(bibtex.slice(index, index + end));
}

function parseBibtex(bibtex, yourName) {
  if (!bibtex) return {};

  const entryType = bibtex.match(/@(\w+)/)?.[1]?.toLowerCase() || "misc";
  const title = extractBibtexField(bibtex, "title");
  const authors = parseAuthors(extractBibtexField(bibtex, "author"), yourName);
  const year = Number.parseInt(extractBibtexField(bibtex, "year"), 10) || null;
  const venue =
    extractBibtexField(bibtex, "journal") ||
    extractBibtexField(bibtex, "journaltitle") ||
    extractBibtexField(bibtex, "booktitle") ||
    extractBibtexField(bibtex, "conference") ||
    extractBibtexField(bibtex, "venue") ||
    null;

  const doi = cleanDoi(extractBibtexField(bibtex, "doi"));
  const url = extractBibtexField(bibtex, "url");
  const eprint = extractBibtexField(bibtex, "eprint");
  const arxivField = extractBibtexField(bibtex, "arxiv");
  const arxiv =
    arxivField ||
    (url && /arxiv\.org\/abs\//i.test(url) ? url : null) ||
    (eprint ? `https://arxiv.org/abs/${eprint}` : null);

  return {
    entryType,
    title,
    authors,
    venue,
    year,
    links: {
      doi,
      url,
      pdf: extractBibtexField(bibtex, "pdf") || null,
      code: extractBibtexField(bibtex, "code") || extractBibtexField(bibtex, "github") || null,
      demo: extractBibtexField(bibtex, "demo") || null,
      arxiv,
    },
    abstract: extractBibtexField(bibtex, "abstract") || null,
  };
}

async function fetchCrossref(doi, yourName) {
  const cleaned = cleanDoi(doi);
  if (!cleaned) return {};

  const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleaned)}`, {
    headers: {
      "User-Agent": "miaow89.github.io publication updater (https://miaow89.github.io)",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Crossref returned ${response.status} for DOI ${cleaned}`);
  }

  const data = await response.json();
  const item = data.message || {};
  const authorNames = (item.author || [])
    .map((author) => [author.given, author.family].filter(Boolean).join(" "))
    .filter(Boolean);

  const containerTitle = item["container-title"]?.[0] || item["short-container-title"]?.[0] || null;
  const year =
    item.published?.["date-parts"]?.[0]?.[0] ||
    item["published-print"]?.["date-parts"]?.[0]?.[0] ||
    item["published-online"]?.["date-parts"]?.[0]?.[0] ||
    null;

  return {
    title: item.title?.[0] || null,
    authors: authorNames.length ? authorNames.map((name) => ({ name, bold: isSamePerson(name, yourName) })) : null,
    venue: containerTitle,
    year,
    links: {
      doi: cleaned,
      url: item.URL || null,
    },
  };
}

function hasKorean(text) {
  return /[\u3131-\u318e\uac00-\ud7a3]/.test(String(text || ""));
}

function mergeLinks(...linksList) {
  const merged = {};
  for (const links of linksList) {
    if (!links) continue;
    for (const [key, value] of Object.entries(links)) {
      if (key !== "doi") continue;
      if (value !== undefined && value !== null && value !== "") {
        merged[key] = key === "doi" ? cleanDoi(value) : value;
      }
    }
  }
  return merged;
}

async function normalizePaper(entry, index, yourName, fallbackCategory) {
  const bibtexData = parseBibtex(entry.bibtex, yourName);
  const entryDoi = cleanDoi(entry.doi || entry.links?.doi || bibtexData.links?.doi);

  let doiData = {};
  const needsDoiLookup =
    entryDoi &&
    ((!entry.title && !bibtexData.title) ||
      (!entry.authors && !bibtexData.authors) ||
      (!entry.venue && !bibtexData.venue) ||
      (!entry.year && !bibtexData.year));
  if (needsDoiLookup) {
    doiData = await fetchCrossref(entryDoi, yourName);
  }

  const title = entry.title || bibtexData.title || doiData.title;
  const authors = entry.authors || bibtexData.authors || doiData.authors;
  const venue = entry.venue || bibtexData.venue || doiData.venue;
  const year = entry.year ?? bibtexData.year ?? doiData.year;
  const category =
    entry.category ||
    fallbackCategory ||
    (hasKorean(title) || hasKorean(venue) ? "domestic" : "international");
  const status = entry.status || "published";

  const links = mergeLinks(doiData.links, bibtexData.links, { doi: entryDoi }, entry.links);

  const normalized = {
    id: entry.id || `paper-${index + 1}`,
    category,
    status,
    title,
    authors,
    venue,
    year,
    links,
  };

  for (const key of ["isSCI", "isKSCI", "quartile", "topPercent", "jcrYear", "journalGrade", "journalGradeKo", "authorRole", "authorRoleKo", "submittedDate", "titleLink", "abstract"]) {
    if (entry[key] !== undefined && entry[key] !== null && entry[key] !== "") {
      normalized[key] = entry[key];
    }
  }

  if (entry.abstract == null && bibtexData.abstract) {
    normalized.abstract = bibtexData.abstract;
  }

  // Manuscripts under review may not have a finalized author list yet.
  // Title, venue, and year are enough to render a useful provisional entry.
  const missing = ["title", "venue", "year"].filter((key) => !normalized[key]);
  if (missing.length) {
    throw new Error(
      `Paper ${normalized.id} is missing ${missing.join(", ")}. Add the field manually or provide a resolvable DOI/BibTeX.`
    );
  }

  return normalized;
}

function renderDataJs(data) {
  return [
    "// Generated from content/*.json by scripts/build_portfolio_data.js.",
    "// Edit JSON files in content/, then run: node scripts/build_portfolio_data.js",
    `window.portfolioData = ${JSON.stringify(data, null, 2)};`,
    "window.profileData = window.portfolioData.profile;",
    "window.researchProjects = window.portfolioData.researchProjects;",
    "window.papersData = window.portfolioData.publications;",
    "",
  ].join("\n");
}

async function main() {
  const source = JSON.parse(fs.readFileSync(PUBLICATIONS_FILE, "utf8"));
  const manuscriptsSource = JSON.parse(fs.readFileSync(MANUSCRIPTS_FILE, "utf8"));
  const profile = JSON.parse(fs.readFileSync(PROFILE_FILE, "utf8"));
  const researchProjects = JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf8"));
  if (!profile.profile || typeof profile.profile !== "object") throw new Error("content/profile.json must contain a profile object.");
  if (!Array.isArray(researchProjects)) throw new Error("content/research-projects.json must contain a JSON array.");
  if (!Array.isArray(manuscriptsSource.international) || !Array.isArray(manuscriptsSource.domestic)) {
    throw new Error("content/manuscripts.json must contain international and domestic arrays.");
  }

  const yourName = source.yourName || "Damsub Lim";
  const papers = [];
  const ids = new Set();

  const publicationGroups = Array.isArray(source.international) || Array.isArray(source.domestic)
    ? [
      ["international", source.international || []],
      ["domestic", source.domestic || []],
    ]
    : [[null, source.papers || []]];
  // Manuscripts are placed first so opening the website toggle preserves their
  // current top-of-list position. The print snapshot filters them out.
  const groupedSource = [
    ["international", manuscriptsSource.international],
    ["domestic", manuscriptsSource.domestic],
    ...publicationGroups,
  ];

  let sourceIndex = 0;
  for (const [fallbackCategory, entries] of groupedSource) {
    for (const entry of entries) {
      const paper = await normalizePaper(entry, sourceIndex, yourName, fallbackCategory);
      sourceIndex += 1;
    if (ids.has(paper.id)) {
      throw new Error(`Duplicate paper id: ${paper.id}`);
    }
    ids.add(paper.id);
    papers.push(paper);
    }
  }

  const output = renderDataJs({
    profile,
    researchProjects,
    publications: {
      yourName,
      // Preserve the order written in content/publications.json.
      papers,
    },
  });

  if (CHECK_MODE) {
    const current = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, "utf8") : "";
    if (current !== output) {
      throw new Error("generated/portfolio-data.js is out of date. Run node scripts/build_portfolio_data.js and commit the result.");
    }
    console.log("generated/portfolio-data.js is up to date.");
    return;
  }

  fs.writeFileSync(OUTPUT_FILE, output, "utf8");
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_FILE)} from content/*.json.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
