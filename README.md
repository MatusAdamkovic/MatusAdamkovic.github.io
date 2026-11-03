# Matúš Adamkovič personal website

A simple static personal website designed for GitHub Pages.

## Pages

- `index.html` — bio, selected publications (including SCORE), and selected projects
- `research.html` — research, teaching, supervision, education, service, and CV download
- `projects.html` — projects and grants (ongoing / upcoming / finished)
- `publications.html` — full publication list, searchable by author/title/keyword and year
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
- **Academic profile**: edit `researchAppointments`, `teaching`, `supervision`,
  `education`, `service`, `collaborations`, and `awards` in the same content file.
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
  "selected": true
}
```

The site works without a build step or an account-based editor. You can edit
`content/site-content.js` directly in GitHub and commit the change. GitHub Pages
then publishes it through the included workflow. Refresh the browser after editing.

## Check changes

Run `node --test tests/site.test.cjs` for the dependency-free content and rendering
checks. The site has no installation or build step.

## Update the portrait

Replace `assets/profile.png` to change the homepage photo.

## Publish on GitHub Pages

Push this repository to GitHub. The included workflow in `.github/workflows/pages.yml`
publishes the site automatically from the `master` branch.
