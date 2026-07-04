# Matúš Adamkovič personal website

This is a simple static personal website designed for GitHub Pages.

## Edit the site text

Most editable text lives in `content/site-content.js`.

Update that file to change:

- name, role, and biography
- research areas
- appointments
- projects
- publications
- contact links
- homepage buttons

Publication items include `paperUrl` and `materialsUrl` fields. Leave them blank
to show no links, or paste a URL to show `Paper` and `Data/materials` links.

Project items include a `status` field. Use `ongoing` or `finished` to decide
which Projects section the item appears in.

## Update the portrait or CV

- Replace `assets/profile.png` to change the homepage photo.
- Edit the Research page content in `content/site-content.js` to update public CV information.

The original CV document included private information, so this repository uses a
public-safe Research page rather than publishing the source CV file directly.

## Publish on GitHub Pages

Push this repository to GitHub. The included workflow in `.github/workflows/pages.yml`
publishes the site automatically from the `master` branch.
