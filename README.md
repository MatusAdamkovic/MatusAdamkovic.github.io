# Matúš Adamkovič personal website

A simple static personal website designed for GitHub Pages.

## Pages

- `index.html` — overview: bio, research work, interests, selected projects and publications
- `research.html` — CV download page (serves `assets/adamkovic_academic_cv.pdf`)
- `projects.html` — projects and grants (ongoing / finished)
- `publications.html` — full publication list with a year table of contents
- `contact.html` — email and profile links

## Edit the site text

All editable text lives in `content/site-content.js`. The HTML pages are only
layout shells; `script.js` fills them from that file.

Things worth knowing:

- **Publications** get a `Paper` link automatically from the DOI in the citation
  text. Every item has empty `paperUrl` and `materialsUrl` placeholders: fill in
  `paperUrl` to override the automatic link, and `materialsUrl` to show a
  `Data/materials` link. Mark an item with `"selected": true` to feature it on
  the homepage.
- **Projects** use a `status` field (`ongoing` or `finished`) to pick their
  section and a `"selected": true` flag for the homepage. Each item has an empty
  `description` placeholder for a manual write-up; any label containing
  "Principal investigator" gets a PI badge.
- **CV**: replace `assets/adamkovic_academic_cv.pdf` (or change `cvFile` in
  `content/site-content.js`) to update the downloadable CV.

## Update the portrait

Replace `assets/profile.png` to change the homepage photo.

## Publish on GitHub Pages

Push this repository to GitHub. The included workflow in `.github/workflows/pages.yml`
publishes the site automatically from the `master` branch.
