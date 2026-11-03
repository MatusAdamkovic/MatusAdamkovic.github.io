# Matúš Adamkovič personal website

A simple static personal website designed for GitHub Pages.

## Pages

- `index.html` — bio, some recent publications (including SCORE), and selected projects
- `research.html` — research, selected talks, supervision, education, collaborations, and CV download
- `projects.html` — projects and grants (ongoing / upcoming / finished)
- `publications.html` — full publication list, with overlapping topics and year navigation
- `contact.html` — email and profile links

## Edit the site text

All editable text lives in `content/site-content.js`. The HTML pages are only
layout shells; `script.js` fills them from that file.

Things worth knowing:

- **Publications** get a `Paper` link automatically from the DOI in the citation
  text. Every item has empty `paperUrl` and `materialsUrl` placeholders: fill in
  `paperUrl` to override the automatic link, and `materialsUrl` to show a
  `Data/materials` link. Mark an item with `"selected": true` to feature it on
  the homepage. Optional `title` and `venue` fields give selected papers a short
  homepage presentation; the full citation is always used on Publications.
- **Projects** use a `status` field (`ongoing` or `finished`) to pick their
  section (`upcoming` is also supported) and a `"selected": true` flag for the homepage. Each item has an empty
  `description` placeholder for a manual write-up; any label containing
  "Principal investigator" gets a PI badge.
- **CV**: replace `assets/adamkovic_academic_cv.pdf` (or change `cvFile` in
  `content/site-content.js`) to update the downloadable CV. Remove private information
  such as your phone number and date of birth before publishing a replacement.
- **SCORE**: set `"score": true` on its three papers; selected SCORE papers are
  grouped together on the overview and marked in the full list.
- **PSA**: set `"psa": true` on Psychological Science Accelerator papers.
- **Topics**: each paper has a `topics` array of IDs, for example
  `"topics": ["gaming", "measurement", "networks"]`. A paper can belong to several
  topics without duplicating its record. Edit the labels in `publicationTopics`.
- **Academic profile**: edit `researchAppointments`, `interestsText`, `talks`,
  `supervision`, `education`, `collaborations`, and `awards` in the same content file.
- **Contact**: the address is plain text with `[[at]]`, without a mailto link.
  The public CV uses the same notation. This discourages simple scrapers but is
  not a guarantee against sophisticated bots or copies of earlier versions.
- **Updated date**: change the `updated` field when refreshing the content.

Keep publication years as four-digit strings (for example `"2026"`), or use
`"Accepted in principle"` for registered reports at that stage. Each paper appears
only once in the `publications` array. Homepage selections use those same records.

Example publication (replace the text and leave unused links empty):

```js
{
  "year": "2026",
  "citation": "Authors. (2026). Paper title. Journal. doi:10.xxxx/example.",
  "paperUrl": "",
  "materialsUrl": "https://osf.io/your-project/",
  "topics": ["meta-research", "measurement"],
  "selected": true
}
```

The site works without a build step or an account-based editor. You can edit
`content/site-content.js` directly in GitHub and commit the change. GitHub Pages
then publishes it through the included workflow. Refresh the browser after editing.

## Check changes

Run `node --test tests/site.test.cjs` for the dependency-free content and rendering
checks. The site has no installation or build step.

## Topic categories

The initial categories used an exploratory TF-IDF + NMF model of the 65 paper
titles (8 components, scikit-learn 1.9.1, seed 42). The final nine reader-facing
categories and overlapping assignments were manually reviewed. They are thematic
navigation labels, not a full-text or abstract-based classification.
Method and source notes are in `docs/publication-topics.md`.

## Update the portrait

Replace `assets/profile.png` to change the homepage photo.

## Publish on GitHub Pages

Push this repository to GitHub. The included workflow in `.github/workflows/pages.yml`
publishes the site automatically from the `master` branch.
