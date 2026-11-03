const content = window.siteContent;

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const setText = (selector, text = "") => {
  document.querySelectorAll(selector).forEach((node) => { node.textContent = text; });
};

const safeUrl = (value = "") => /^(https?:\/\/|mailto:)/i.test(value) ? value : "";
const linkAttrs = (url) => /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
const itemTitle = (item) => {
  const url = safeUrl(item.url);
  const title = escapeHtml(item.title);
  return url ? `<a href="${escapeHtml(url)}"${linkAttrs(url)}>${title}</a>` : title;
};

const doiUrl = (citation = "") => {
  const match = citation.match(/(?:doi:\s*|https?:\/\/(?:dx\.)?doi\.org\/)(10\.[^\s]+)/i);
  return match ? `https://doi.org/${match[1].replace(/[.,;]+$/, "")}` : "";
};

const render = (selector, markup) => {
  const container = document.querySelector(selector);
  if (container) container.innerHTML = markup;
};

const renderLinks = (selector, items = []) => render(selector, items.map((item) => {
  const url = safeUrl(item.url);
  return url ? `<a href="${escapeHtml(url)}"${linkAttrs(url)}>${escapeHtml(item.label)}</a>` : "";
}).join(""));

const renderPlainList = (selector, items = []) => render(selector,
  items.map((item) => `<li>${escapeHtml(item)}</li>`).join(""));

const projectMarkup = (item, compact = false) => `
  <article class="list-item project${compact ? " selected-project" : ""}">
    <div class="item-meta">
      <span class="date">${escapeHtml(item.date)}</span>
      ${item.status === "upcoming" ? '<span class="badge">Upcoming</span>' : ""}
      ${/principal investigator/i.test(item.label || "") ? '<span class="badge">Principal investigator</span>' : ""}
    </div>
    <h3>${itemTitle(item)}</h3>
    <p class="venue">${escapeHtml(compact ? item.label.replace(/ · Principal investigator/i, "") : item.label)}</p>
    ${!compact && item.funder ? `<p class="venue">${escapeHtml(item.funder)}</p>` : ""}
    ${!compact && item.budget ? `<p class="venue">Funding: ${escapeHtml(item.budget)}</p>` : ""}
    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
  </article>`;

const renderProjects = (selector, items, compact = false) => render(selector,
  items.map((item) => projectMarkup(item, compact)).join(""));

const publicationLinks = (item) => {
  const paper = safeUrl(item.paperUrl) || doiUrl(item.citation);
  const materials = safeUrl(item.materialsUrl);
  const links = [
    paper ? `<a href="${escapeHtml(paper)}"${linkAttrs(paper)}>${escapeHtml(item.paperLabel || "Paper")}</a>` : "",
    materials ? `<a href="${escapeHtml(materials)}"${linkAttrs(materials)}>${escapeHtml(item.materialsLabel || "Data / materials")}</a>` : ""
  ].filter(Boolean);
  return links.length ? `<div class="publication-links">${links.join("")}</div>` : "";
};

const publicationMarkup = (item, compact = false) => {
  // Keep the full citation in the content file; expose its DOI as the Paper link.
  const citation = item.citation
    .replace(/(?:doi:\s*|https?:\/\/(?:dx\.)?doi\.org\/)10\.\S+/gi, "")
    .trim();
  const formatted = escapeHtml(citation).replace(/Adamkovi[čc], M\./g, "<strong>$&</strong>");
  return `<article class="list-item publication">
    <div class="item-meta"><span class="date">${escapeHtml(item.year)}</span>${item.score ? '<span class="badge">SCORE</span>' : ""}</div>
    ${compact && item.title ? `<h3>${escapeHtml(item.title)}</h3><p class="venue">${escapeHtml(item.venue)}</p>` : `<p>${formatted}</p>`}
    ${publicationLinks(item)}
  </article>`;
};

const renderPublications = (selector, items, compact = false) => render(selector,
  items.map((item) => publicationMarkup(item, compact)).join(""));
const yearSlug = (year) => "y-" + String(year).toLowerCase().replace(/[^a-z0-9]+/g, "-");
const publicationYears = [...new Set(content.publications.map((item) => item.year))];

const renderGroupedPublications = (items) => {
  const groups = publicationYears.filter((year) => items.some((item) => item.year === year));
  render("[data-all-publications]", groups.map((year) => `
    <section class="publication-year" id="${yearSlug(year)}" aria-labelledby="heading-${yearSlug(year)}">
      <h2 id="heading-${yearSlug(year)}">${escapeHtml(year)}</h2>
      <div class="list">${items.filter((item) => item.year === year).map((item) => publicationMarkup(item)).join("")}</div>
    </section>`).join(""));
  const empty = document.querySelector("[data-no-results]");
  if (empty) empty.hidden = items.length > 0;
};

const renderTimeline = (selector, items = []) => render(selector, items.map((item) => `
  <article class="timeline-item">
    <div class="item-meta"><span class="date">${escapeHtml(item.date)}</span></div>
    <h3>${itemTitle(item)}</h3>
    <p>${escapeHtml(item.organization)}</p>
    ${item.note ? `<p class="note">${escapeHtml(item.note)}</p>` : ""}
  </article>`).join(""));

["name", "role", "bio", "researchSummary", "scoreText", "updated"].forEach((field) => {
  setText(`[data-field="${field}"]`, content[field]);
});
setText("[data-footer]", `© ${new Date().getFullYear()} ${content.name}`);
document.querySelectorAll("[data-cv-download]").forEach((node) => {
  node.setAttribute("href", content.cvFile);
});

const page = document.body.dataset.page;
if (page === "home") {
  renderLinks("[data-profile-links]", content.profileLinks);
  renderProjects("[data-overview-projects]", content.projects.filter((item) => item.selected), true);
  renderPublications("[data-overview-publications]", content.publications.filter((item) => item.selected && !item.score), true);
  renderPublications("[data-score-publications]", content.publications.filter((item) => item.score && item.selected), true);
}
if (page === "research") {
  renderPlainList("[data-research-areas]", content.researchAreas);
  renderTimeline("[data-research-appointments]", content.researchAppointments);
  renderTimeline("[data-previous-appointments]", content.previousAppointments);
  renderTimeline("[data-teaching]", content.teaching);
  renderTimeline("[data-supervision]", content.supervision);
  renderTimeline("[data-education]", content.education);
  renderPlainList("[data-service]", content.service);
  renderPlainList("[data-collaborations]", content.collaborations);
  renderPlainList("[data-awards]", content.awards);
}
if (page === "projects") {
  for (const status of ["upcoming", "ongoing", "finished"]) {
    const projects = content.projects.filter((item) => item.status === status)
      .sort((a, b) => Number(b.date.slice(0, 4)) - Number(a.date.slice(0, 4)));
    renderProjects(`[data-${status}-projects]`, projects);
    if (!projects.length) document.querySelector(`[data-project-section="${status}"]`)?.setAttribute("hidden", "");
  }
}
if (page === "publications") {
  const search = document.querySelector("[data-publication-search]");
  const yearSelect = document.querySelector("[data-publication-year]");
  render("[data-publication-toc]", publicationYears.map((year) => `<a href="#${yearSlug(year)}">${escapeHtml(year)}</a>`).join(""));
  yearSelect.innerHTML += publicationYears.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join("");
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const updateResults = () => {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    const results = content.publications.filter((item) => {
      const text = normalize(`${item.citation} ${item.year} ${item.score ? "SCORE" : ""}`);
      return (!yearSelect.value || item.year === yearSelect.value) && terms.every((term) => text.includes(term));
    });
    renderGroupedPublications(results);
    setText("[data-search-status]", `${results.length} publications found`);
  };
  search.addEventListener("input", updateResults);
  yearSelect.addEventListener("change", updateResults);
  document.querySelector("[data-publication-toc]").addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    search.value = "";
    yearSelect.value = "";
    updateResults();
  });
  updateResults();
}
if (page === "contact") {
  renderLinks("[data-contact]", content.contact);
  renderLinks("[data-profile-links]", content.profileLinks);
}
