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
  assert.equal((node("[data-score-publications]").innerHTML.match(/>SCORE<\/a>/g) || []).length, 3);
  assert.match(node("[data-overview-publications]").innerHTML, /<h3>Confusion in gaming disorder measurement<\/h3>/);
  assert.doesNotMatch(node("[data-overview-publications]").innerHTML, /semantic priming/i);
});

test("future and ongoing grants are not mixed with finished projects", () => {
  const { node, content } = loadPage("projects");
  assert.equal(content.projects.length, 18);
  assert.match(node("[data-upcoming-projects]").innerHTML, /GAČR Junior Star/);
  assert.doesNotMatch(node("[data-ongoing-projects]").innerHTML, /GAČR Junior Star/);
  assert.match(node("[data-ongoing-projects]").innerHTML, /APVV-25-0711/);
  assert.equal(content.projects.filter((p) => p.status === "finished").length, 11);
});

test("all publications render once, with valid year links", () => {
  const { node, content } = loadPage("publications");
  const html = node("[data-all-publications]").innerHTML;
  assert.equal((html.match(/class="list-item publication"/g) || []).length, content.publications.length);
  assert.match(html, /id="y-2020"/);
  assert.match(node("[data-publication-toc]").innerHTML, /href="#y-2026"/);
});

test("all papers have reviewed, valid, overlapping topic categories", () => {
  const { content } = loadPage("publications");
  const ids = new Set(content.publicationTopics.map((topic) => topic.id));
  assert.equal(ids.size, 9);
  for (const paper of content.publications) {
    assert.ok(paper.topics.length);
    assert.equal(new Set(paper.topics).size, paper.topics.length);
    paper.topics.forEach((topic) => assert.ok(ids.has(topic)));
  }
  assert.ok(content.publications.some((paper) => paper.topics.length > 1));
});

test("topic filtering, empty results, and returning to all topics work", () => {
  const { node, content } = loadPage("publications");
  const topic = node("[data-publication-topic]");
  for (const category of content.publicationTopics) {
    topic.value = category.id;
    topic.listeners.change();
    const expected = content.publications.filter((p) => p.topics.includes(category.id)).length;
    assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, expected);
  }
  topic.value = "nonexistent-topic";
  topic.listeners.change();
  assert.equal(node("[data-no-results]").hidden, false);
  topic.value = "";
  topic.listeners.change();
  assert.equal(node("[data-no-results]").hidden, true);
  assert.equal((node("[data-all-publications]").innerHTML.match(/class="list-item publication"/g) || []).length, 65);
});

test("year shortcuts restore the full list before navigating", () => {
  const { node } = loadPage("publications");
  node("[data-publication-topic]").value = "gaming";
  node("[data-publication-topic]").listeners.change();
  node("[data-publication-toc]").listeners.click({ target: { closest: () => ({}) } });
  assert.equal(node("[data-publication-topic]").value, "");
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

test("research profile retains complete affiliations and collaborations", () => {
  const { node } = loadPage("research");
  assert.match(node("[data-collaborations]").innerHTML, /International Trauma Consortium/);
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

test("only Contact renders an obfuscated email address, without a mailto link", () => {
  for (const page of ["home", "research", "projects", "publications"]) {
    const { node } = loadPage(page);
    assert.equal(node("[data-contact]").innerHTML, "");
  }
  const { node } = loadPage("contact");
  assert.match(node("[data-contact]").innerHTML, /matho\.adamkovic \[\[at\]\] gmail\.com/);
  assert.doesNotMatch(node("[data-contact]").innerHTML, /mailto:/);
  assert.doesNotMatch(contentSource, /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/);
});

test("accepted reports use the supplied recommendation links", () => {
  const { content } = loadPage("publications");
  assert.deepEqual(Array.from(content.publications.slice(0, 3), (p) => p.paperUrl), [
    "https://rr.peercommunityin.org/articles/rec?id=604",
    "https://rr.peercommunityin.org/articles/rec?id=322",
    "https://rr.peercommunityin.org/articles/rec?id=778"
  ]);
});

test("PSA is labelled separately from SCORE", () => {
  const { content, node } = loadPage("publications");
  assert.equal(content.publications.filter((p) => p.psa).length, 9);
  assert.equal((node("[data-all-publications]").innerHTML.match(/>PSA<\/a>/g) || []).length, 9);
  assert.equal(content.publications.filter((p) => p.score && p.psa).length, 0);
});

test("finished APVV is absent from ongoing and selected projects", () => {
  const { node, content } = loadPage("projects");
  assert.match(node("[data-finished-projects]").innerHTML, /APVV-22-0458/);
  assert.doesNotMatch(node("[data-ongoing-projects]").innerHTML, /APVV-22-0458/);
  assert.equal(content.projects.find((p) => p.label.startsWith("APVV-22-0458")).selected, false);
});

test("removed publication and profile controls are absent", () => {
  const publications = fs.readFileSync(path.join(root, "publications.html"), "utf8");
  const research = fs.readFileSync(path.join(root, "research.html"), "utf8");
  assert.doesNotMatch(publications, /type="search"|data-publication-year/);
  assert.doesNotMatch(research, /data-teaching|data-service|data-talks|#talks|researchSummary/);
});

test("overview includes the informal automation paragraph without the removed research intro", () => {
  const { node, content } = loadPage("home");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /data-field="interestsText"/);
  assert.match(node('[data-field="interestsText"]').textContent, /the tedious bits of meta-research/);
  assert.equal(content.researchSummary, undefined);
  assert.equal(content.talks, undefined);
});
