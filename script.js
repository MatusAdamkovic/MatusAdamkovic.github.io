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
  if (!url.startsWith("mailto:") && !url.startsWith("#") && !url.startsWith("assets/")) {
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
  }
  return anchor;
};

setText('[data-field="name"]', content.name);
setText('[data-field="role"]', content.role);
setText('[data-field="bio"]', content.bio);
setText('[data-field="researchIntro"]', content.researchIntro);
setText('[data-field="cvText"]', content.cvText);

document.title = content.name;

const links = document.querySelector("[data-links]");
content.links.forEach((item) => links.appendChild(link(item)));

const stats = document.querySelector("[data-stats]");
content.stats.forEach((item) => {
  const stat = document.createElement("div");
  stat.className = "stat";
  stat.innerHTML = `<strong>${item.value}</strong><span>${item.label}</span>`;
  stats.appendChild(stat);
});

const areas = document.querySelector("[data-research-areas]");
content.researchAreas.forEach((area) => {
  const item = document.createElement("li");
  item.textContent = area;
  areas.appendChild(item);
});

const appointments = document.querySelector("[data-appointments]");
content.appointments.forEach((item) => {
  const row = document.createElement("article");
  row.className = "timeline-item";
  row.innerHTML = `
    <div class="date">${item.date}</div>
    <div>
      <h3>${item.title}</h3>
      <p>${item.place}</p>
    </div>
  `;
  appointments.appendChild(row);
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
