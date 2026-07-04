const content = window.siteContent;

const external = (url) =>
  url && !url.startsWith("mailto:") && !url.startsWith("#") && !url.endsWith(".html");

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const setText = (selector, text) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = text;
  });
};

const linkAttrs = (url) => external(url) ? ' target="_blank" rel="noreferrer"' : "";

const itemTitle = (item) => {
  const title = escapeHtml(item.title);
  if (!item.url) return title;
  return `<a href="${escapeHtml(item.url)}"${linkAttrs(item.url)}>${title}</a>`;
};

// Builds a doi.org link from "doi:10..." or "https://doi.org/10..." in the citation.
const doiUrl = (citation = "") => {
  const match = citation.match(/(?:doi:\s*|https?:\/\/(?:dx\.)?doi\.org\/)(10\.[^\s]+)/i);
  return match ? `https://doi.org/${match[1].replace(/[.,;]+$/, "")}` : "";
};

const renderLinks = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items
    .map((item) => `<a href="${escapeHtml(item.url)}"${linkAttrs(item.url)}>${escapeHtml(item.label)}</a>`)
    .join("");
};

const renderTags = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
};

const renderPositions = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map((item) => `
    <article class="position">
      <h3>${itemTitle(item)}</h3>
      <p class="venue">${escapeHtml(item.role)}</p>
    </article>
  `).join("");
};

const projectMarkup = (item) => `
  <article class="list-item project">
    <div class="date">${escapeHtml(item.date)}</div>
    <div>
      ${/principal investigator/i.test(item.label || "") ? '<p class="badge">PI</p>' : ""}
      <h3>${itemTitle(item)}</h3>
      <p class="venue">${escapeHtml(item.label)}</p>
      ${item.budget ? `<p class="venue">Budget: ${escapeHtml(item.budget)}</p>` : ""}
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
    </div>
  </article>
`;

const renderProjects = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map(projectMarkup).join("");
};

const publicationLinks = (item) => {
  const paper = item.paperUrl || doiUrl(item.citation);
  const links = [
    paper
      ? `<a href="${escapeHtml(paper)}" target="_blank" rel="noreferrer">${escapeHtml(item.paperLabel || "Paper")}</a>`
      : "",
    item.materialsUrl
      ? `<a href="${escapeHtml(item.materialsUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.materialsLabel || "Data/materials")}</a>`
      : ""
  ].filter(Boolean);
  return links.length ? `<p class="publication-links">${links.join("")}</p>` : "";
};

const publicationMarkup = (item) => `
  <article class="list-item publication">
    <div class="date">${escapeHtml(item.year)}</div>
    <div>
      <p>${escapeHtml(item.citation)}</p>
      ${publicationLinks(item)}
    </div>
  </article>
`;

const renderPublications = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map(publicationMarkup).join("");
};

const yearSlug = (year) => "y-" + String(year).toLowerCase().replace(/[^a-z0-9]+/g, "-");

const renderGroupedPublications = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  const groups = [...new Set(items.map((item) => item.year))];
  container.innerHTML = groups.map((year) => `
    <section class="publication-year" id="${yearSlug(year)}" aria-label="${escapeHtml(year)} publications">
      <h2>${escapeHtml(year)}</h2>
      <div class="list">${items.filter((item) => item.year === year).map(publicationMarkup).join("")}</div>
    </section>
  `).join("");

  const toc = document.querySelector("[data-publication-toc]");
  if (toc) {
    toc.innerHTML = groups
      .map((year) => `<a href="#${yearSlug(year)}">${escapeHtml(year)}</a>`)
      .join("");
  }
};

setText('[data-field="name"]', content.name);
setText('[data-field="role"]', content.role);
setText('[data-field="bio"]', content.bio);
setText('[data-field="overviewTitle"]', content.overviewTitle);
setText("[data-footer]", `© ${new Date().getFullYear()} ${content.name}`);

document.querySelectorAll("[data-cv-download]").forEach((node) => {
  node.setAttribute("href", content.cvFile);
});

if (document.body.dataset.page === "home") {
  renderLinks("[data-profile-links]", content.profileLinks);
  renderPositions("[data-overview-positions]", content.overviewPositions || []);
  renderTags("[data-research-areas]", content.researchAreas);
  renderProjects("[data-overview-projects]", content.projects.filter((item) => item.selected));
  renderPublications("[data-overview-publications]", content.publications.filter((item) => item.selected));
}

if (document.body.dataset.page === "projects") {
  renderProjects("[data-ongoing-projects]", content.projects.filter((item) => item.status === "ongoing"));
  renderProjects("[data-finished-projects]", content.projects.filter((item) => item.status === "finished"));
}

if (document.body.dataset.page === "publications") {
  renderGroupedPublications("[data-all-publications]", content.publications);
}

if (document.body.dataset.page === "contact") {
  renderLinks("[data-contact]", content.contact);
  renderLinks("[data-profile-links]", content.profileLinks);
}
