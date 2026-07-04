const content = window.siteContent;

const setText = (selector, text) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = text;
  });
};

const link = ({ label, url }) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.textContent = label;
  if (
    !url.startsWith("mailto:") &&
    !url.startsWith("#") &&
    !url.startsWith("assets/") &&
    !url.endsWith(".html")
  ) {
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
  }
  return anchor;
};

const titleNode = (item) => {
  if (!item.url) {
    return item.title;
  }
  return `<a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a>`;
};

setText('[data-field="name"]', content.name);
setText('[data-field="role"]', content.role);
setText('[data-field="bio"]', content.bio);
setText('[data-field="cvText"]', content.cvText);
setText('[data-field="score"]', content.score);

document.title = content.name;

const links = document.querySelector("[data-links]");
content.links.forEach((item) => links.appendChild(link(item)));

const areas = document.querySelector("[data-research-areas]");
content.researchAreas.forEach((area) => {
  const item = document.createElement("li");
  item.textContent = area;
  areas.appendChild(item);
});

const renderTimeline = (selector, items) => {
  const container = document.querySelector(selector);
  items.forEach((item) => {
    const row = document.createElement("article");
    row.className = "timeline-item";
    row.innerHTML = `
      <div class="date">${item.date}</div>
      <div>
        <h3>${titleNode(item)}</h3>
        <p>${item.place}</p>
      </div>
    `;
    container.appendChild(row);
  });
};

renderTimeline("[data-research-appointments]", content.researchAppointments);
renderTimeline("[data-teaching-appointments]", content.teachingAppointments);

const projects = document.querySelector("[data-projects]");
content.projects.forEach((item) => {
  const row = document.createElement("article");
  row.className = "publication project";
  row.innerHTML = `
    <div class="date">${item.date}</div>
    <div>
      <h3>${titleNode(item)}</h3>
      <p class="venue">${item.label}</p>
      <p>${item.description}</p>
    </div>
  `;
  projects.appendChild(row);
});

const publications = document.querySelector("[data-publications]");
content.publications.forEach((item) => {
  const row = document.createElement("article");
  row.className = "publication";
  row.innerHTML = `
    <div class="date">${item.date}</div>
    <div>
      <h3>${item.title}</h3>
      <p class="venue">${item.venue}</p>
    </div>
  `;
  publications.appendChild(row);
});

const contact = document.querySelector("[data-contact]");
content.contact.forEach((item) => contact.appendChild(link(item)));

document.querySelector("[data-footer]").textContent =
  `© ${new Date().getFullYear()} ${content.name}`;
