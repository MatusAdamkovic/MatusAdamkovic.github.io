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

const renderTimeline = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map((item) => `
    <article class="timeline-item">
      <div class="date">${escapeHtml(item.date)}</div>
      <div>
        <h3>${itemTitle(item)}</h3>
        <p>${escapeHtml(item.place)}</p>
      </div>
    </article>
  `).join("");
};

const projectMarkup = (item) => `
  <article class="list-item project">
    <div class="date">${escapeHtml(item.date)}</div>
    <div>
      <h3>${itemTitle(item)}</h3>
      <p class="venue">${escapeHtml(item.label)}</p>
      <p>${escapeHtml(item.description)}</p>
    </div>
  </article>
`;

const renderProjects = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map(projectMarkup).join("");
};

const publicationLinks = (item) => {
  const links = [
    item.paperUrl
      ? `<a href="${escapeHtml(item.paperUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.paperLabel || "Paper")}</a>`
      : "",
    item.materialsUrl
      ? `<a href="${escapeHtml(item.materialsUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.materialsLabel || "Data/materials")}</a>`
      : ""
  ].filter(Boolean);
  return links.length ? `<p class="publication-links">${links.join("")}</p>` : "";
};

const publicationMarkup = (item) => `
  <article class="list-item publication ${item.score ? "score-publication" : ""}">
    <div class="date">${escapeHtml(item.year)}</div>
    <div>
      ${item.score ? '<p class="badge">SCORE</p>' : ""}
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

const renderGroupedPublications = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  const groups = [...new Set(items.map((item) => item.year))];
  container.innerHTML = groups.map((year) => `
    <section class="publication-year" aria-label="${escapeHtml(year)} publications">
      <h2>${escapeHtml(year)}</h2>
      <div class="list">${items.filter((item) => item.year === year).map(publicationMarkup).join("")}</div>
    </section>
  `).join("");
};

const renderPlainList = (selector, items) => {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
};

setText('[data-field="name"]', content.name);
setText('[data-field="role"]', content.role);
setText('[data-field="bio"]', content.bio);
setText('[data-field="score"]', content.scoreText);
setText('[data-field="overviewTitle"]', content.overviewTitle);
setText('[data-field="overviewIntro"]', content.overviewIntro);
setText("[data-footer]", `© ${new Date().getFullYear()} ${content.name}`);

const allPublications = Array.isArray(content.publications)
  ? content.publications
  : content.publications?.all || [];
const scorePublications = content.recentPublications?.score ||
  allPublications.filter((item) => item.score);
const selectedPublications = content.recentPublications?.selected ||
  allPublications
    .filter((item) => !item.score && ["2026", "2025"].includes(item.year))
    .slice(0, Math.max(0, content.overviewPublicationCount - scorePublications.length));

if (document.body.dataset.page === "home") {
  const overviewProjects = content.projects
    .filter((item) => item.status === "ongoing")
    .slice(0, content.overviewProjectCount);

  renderLinks("[data-profile-links]", content.profileLinks);
  renderPlainList("[data-overview-highlights]", content.overviewHighlights || []);
  renderProjects("[data-overview-projects]", overviewProjects);
  renderPublications("[data-overview-publications]", [...scorePublications, ...selectedPublications]);
}

if (document.body.dataset.page === "research") {
  renderLinks("[data-profile-links]", content.profileLinks);
  renderTags("[data-research-areas]", content.researchAreas);
  renderTimeline("[data-research-appointments]", content.researchAppointments);
  renderTimeline("[data-teaching-appointments]", content.teachingAppointments);
  renderTimeline("[data-education]", content.education);
  renderPlainList("[data-teaching]", content.teaching);
  renderPlainList("[data-service]", content.service);
}

if (document.body.dataset.page === "projects") {
  renderProjects("[data-ongoing-projects]", content.projects.filter((item) => item.status === "ongoing"));
  renderProjects("[data-finished-projects]", content.projects.filter((item) => item.status === "finished"));
}

if (document.body.dataset.page === "publications") {
  renderPublications("[data-score-publications]", scorePublications);
  renderGroupedPublications("[data-all-publications]", allPublications);
}

if (document.body.dataset.page === "contact") {
  renderLinks("[data-contact]", content.contact);
}
