const filterGroup = document.querySelector('.filters');
const papers = [...document.querySelectorAll('.paper')];
const filterStatus = document.querySelector('#filter-status');
const navLinks = [...document.querySelectorAll('.section-nav a')];
const sections = navLinks.map(link => document.getElementById(link.hash.slice(1)));
const authorRows = [...document.querySelectorAll('.author-row')];
const backToTop = document.querySelector('.back-to-top');
const figureDialog = document.querySelector('.figure-dialog');
const fullFigure = figureDialog.querySelector('.figure-full');
const figureCaption = figureDialog.querySelector('figcaption');
const isEnglish = document.documentElement.lang === 'en';
const authorLabels = isEnglish
  ? { expand: 'Expand author list', collapse: 'Collapse author list' }
  : { expand: '展开作者列表', collapse: '收起作者列表' };

for (const link of document.querySelectorAll('.paper-image')) {
  const thumbnail = link.querySelector('img');
  if (!link.hasAttribute('href')) link.href = thumbnail.src;
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof figureDialog.showModal !== 'function') return;
    event.preventDefault();
    fullFigure.src = thumbnail.currentSrc || thumbnail.src;
    figureCaption.textContent = thumbnail.alt;
    figureDialog.showModal();
  });
}

figureDialog.querySelector('.figure-close').addEventListener('click', () => figureDialog.close());
figureDialog.addEventListener('click', event => {
  if (event.target !== figureDialog) return;
  const { left, right, top, bottom } = figureDialog.getBoundingClientRect();
  const clickedBackdrop = event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;
  if (clickedBackdrop) figureDialog.close();
});

function filterPapers(category) {
  for (const button of filterGroup.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  }
  for (const paper of papers) {
    paper.hidden = category !== 'all' && paper.dataset.category !== category;
  }
  const count = papers.filter(paper => !paper.hidden).length;
  filterStatus.textContent = isEnglish ? `Publications shown: ${count}` : `显示 ${count} 项成果`;
  updateAuthorToggles();
}

function revealLinkedPaper(hash) {
  const paper = papers.find(item => `#${item.id}` === hash);
  if (!paper?.hidden) return;
  filterPapers('all');
  paper.scrollIntoView();
}

filterGroup.addEventListener('click', event => {
  const button = event.target.closest('button[data-filter]');
  if (button) filterPapers(button.dataset.filter);
});
filterGroup.hidden = false;
window.addEventListener('hashchange', () => revealLinkedPaper(window.location.hash));
for (const link of document.querySelectorAll('.news-list a')) {
  link.addEventListener('click', () => revealLinkedPaper(link.hash));
}

function updateAuthorToggles() {
  for (const row of authorRows) {
    if (!row.offsetWidth) continue;
    const authors = row.querySelector('.paper-authors');
    const toggle = row.querySelector('.author-toggle');
    row.classList.remove('is-collapsible');
    toggle.hidden = true;
    const lineHeight = Number.parseFloat(getComputedStyle(authors).lineHeight);
    if (authors.scrollHeight <= lineHeight + 1) continue;
    row.classList.add('is-collapsible');
    toggle.hidden = false;
  }
}

for (const row of authorRows) {
  const toggle = row.querySelector('.author-toggle');
  toggle.addEventListener('click', () => {
    const expanded = row.classList.toggle('is-expanded');
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', expanded ? authorLabels.collapse : authorLabels.expand);
    toggle.textContent = expanded ? '⌃' : '⌄';
  });
}

function updateNavigation() {
  backToTop.hidden = window.scrollY <= 300;
  const endOfPage = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  let current = 0;
  for (const [index, section] of sections.entries()) {
    if (section.getBoundingClientRect().top <= 120 || endOfPage) current = index;
  }
  for (const [index, link] of navLinks.entries()) {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

let scheduled = false;
function scheduleNavigation() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(() => {
    scheduled = false;
    updateNavigation();
  });
}

window.addEventListener('scroll', scheduleNavigation, { passive: true });
window.addEventListener('resize', () => {
  updateAuthorToggles();
  scheduleNavigation();
});
updateAuthorToggles();
updateNavigation();
