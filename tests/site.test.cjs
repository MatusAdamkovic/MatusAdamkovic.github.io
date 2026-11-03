const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const contentSource = fs.readFileSync(path.join(root, "content/site-content.js"), "utf8");
const scriptSource = fs.readFileSync(path.join(root, "script.js"), "utf8");

function loadPage(page) {
  const nodes = new Map();
  const node = (selector) => {
    if (!nodes.has(selector)) nodes.set(selector, {
      innerHTML: "", textContent: "", value: "", hidden: true, listeners: {}, attributes: {},
      addEventListener(event, callback) { this.listeners[event] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; }
    });
    return nodes.get(selector);
  };
  const context = vm.createContext({
    window: {},
    document: {
      body: { dataset: { page } },
      querySelector: node,
      querySelectorAll: (selector) => [node(selector)]
    }
  });
  vm.runInContext(contentSource, context);
  vm.runInContext(scriptSource, context);
  return { context, node, content: context.window.siteContent };
}

test("November CV publications are complete, unique, and free of impact factors", () => {
  const { content } = loadPage("home");
  assert.equal(content.publications.length, 65);
  assert.equal(new Set(content.publications.map((p) => p.citation)).size, 65);
  assert.equal(content.publications.filter((p) => p.year === "Accepted in principle").length, 3);
  assert.equal(content.publications.filter((p) => p.year === "2026").length, 12);
  for (const p of content.publications) {
    assert.equal(typeof p.paperUrl, "string");
    assert.equal(typeof p.materialsUrl, "string");
    assert.doesNotMatch(p.citation, /\bIF\s*=/);
  }
});

test("overview uses a separate SCORE group and compact selected publications", () => {
  const { node } = loadPage("home");
  assert.equal((node("[data-score-publications]").innerHTML.match(/class="badge">SCORE/g) || []).length, 3);
  assert.match(node("[data-overview-publications]").innerHTML, /<h3>Confusion in gaming disorder measurement<\/h3>/);
  assert.doesNotMatch(node("[data-overview-publications]").innerHTML, /semantic priming/i);
});

test("future and ongoing grants are not mixed with finished projects", () => {
  const { node, content } = loadPage("projects");
  assert.equal(content.projects.length, 18);
  assert.match(node("[data-upcoming-projects]").innerHTML, /GAČR Junior Star/);
  assert.doesNotMatch(node("[data-ongoing-projects]").innerHTML, /GAČR Junior Star/);
  assert.match(node("[data-ongoing-projects]").innerHTML, /APVV-25-0711/);
  assert.equal(content.projects.filter((p) => p.status === "finished").length, 10);
});

test("all publications render once, with valid year links", () => {
  const { node, content } = loadPage("publications");
  const html = node("[data-all-publications]").innerHTML;
  assert.equal((html.match(/class="list-item publication"/g) || []).length, content.publications.length);
  assert.match(html, /id="y-2020"/);
  assert.match(node("[data-publication-toc]").innerHTML, /href="#y-2026"/);
});

test("search supports SCORE, multiple keywords, and unaccented names", () => {
  const { node } = loadPage("publications");
  const search = node("[data-publication-search]");
  search.value = "SCORE";
  search.listeners.input();
  assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, 3);
  search.value = "adamkovic confusion";
  search.listeners.input();
  assert.match(node("[data-all-publications]").innerHTML, /Confusion in gaming disorder measurement/);
  assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, 1);
});

test("year filtering, empty results, and clearing the search work", () => {
  const { node } = loadPage("publications");
  const search = node("[data-publication-search]");
  const year = node("[data-publication-year]");
  year.value = "2026";
  year.listeners.change();
  assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, 12);
  search.value = "no-matching-publication-xyz";
  search.listeners.input();
  assert.equal(node("[data-no-results]").hidden, false);
  assert.match(node("[data-publication-toc]").innerHTML, /href="#y-2026"/);
  search.value = "";
  year.value = "";
  search.listeners.input();
  assert.equal(node("[data-no-results]").hidden, true);
  assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, 65);
});

test("year shortcuts restore the full list before navigating", () => {
  const { node } = loadPage("publications");
  node("[data-publication-search]").value = "SCORE";
  node("[data-publication-search]").listeners.input();
  node("[data-publication-toc]").listeners.click({ target: { closest: () => ({}) } });
  assert.equal(node("[data-publication-search]").value, "");
  assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, 65);
});

test("paper DOI links and optional custom links are rendered safely", () => {
  const { context } = loadPage("home");
  assert.equal(vm.runInContext('doiUrl("Example. doi: 10.1098/rsos.262017.")', context), "https://doi.org/10.1098/rsos.262017");
  const html = vm.runInContext('publicationLinks({ paperUrl: "https://example.org/paper", materialsUrl: "https://osf.io/md86u/" })', context);
  assert.match(html, /href="https:\/\/example.org\/paper"/);
  assert.match(html, /Data \/ materials/);
  assert.equal(vm.runInContext('publicationLinks({ paperUrl: "javascript:alert(1)", materialsUrl: "javascript:alert(2)" })', context), "");
  assert.equal(vm.runInContext('escapeHtml("<script>")', context), "&lt;script&gt;");
});

test("research profile includes new teaching and complete Jyväskylä affiliation", () => {
  const { node } = loadPage("research");
  assert.match(node("[data-teaching]").innerHTML, /Metropolitan University, Prague/);
  assert.match(node("[data-research-appointments]").innerHTML, /Faculty of Humanities and Social Sciences/);
  assert.doesNotMatch(node("[data-research-areas]").innerHTML, /methodology of behavioral research/);
});

test("all page shells have accessible navigation, a main target, and existing assets", () => {
  for (const file of ["index.html", "research.html", "projects.html", "publications.html", "contact.html"]) {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1);
    assert.match(html, /id="main"/);
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      const target = match[1].split("?")[0];
      if (!target.includes(":")) assert.ok(fs.existsSync(path.join(root, target)), `${file}: missing ${target}`);
    }
  }
});

test("only the Contact page renders an email link", () => {
  for (const page of ["home", "research", "projects", "publications"]) {
    const { node } = loadPage(page);
    assert.equal(node("[data-contact]").innerHTML, "");
  }
  const { node } = loadPage("contact");
  assert.match(node("[data-contact]").innerHTML, /mailto:matho.adamkovic@gmail.com/);
});
