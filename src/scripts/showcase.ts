const cards = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-card]'));
const modals = Array.from(document.querySelectorAll<HTMLElement>('[data-showcase]'));
const openTriggers = Array.from(document.querySelectorAll<HTMLElement>('[data-open]'));
const closeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-close]'));
const nav = document.querySelector<HTMLElement>('[data-nav]');
const scrollHint = document.querySelector<HTMLElement>('[data-scroll-hint]');
const tagButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-tag]'));
const tagNote = document.querySelector<HTMLElement>('[data-tag-note]');
const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));

let selected: string | null = null;
let lastFocused: HTMLElement | null = null;
let activeTag: string | null = new URLSearchParams(window.location.search).get('tag');

function openShowcase(id: string, trigger?: HTMLElement | null): void {
  selected = id;
  lastFocused = trigger ?? null;

  for (const card of cards) {
    card.setAttribute('aria-expanded', String(card.dataset.card === id));
  }

  const modal = modals.find((m) => m.dataset.showcase === id);
  if (!modal) return;

  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-open'));
  document.body.classList.add('modal-open');

  const close = modal.querySelector<HTMLButtonElement>('[data-close]');
  close?.focus();
}

function closeShowcase(): void {
  const modal = modals.find(
    (m) => !m.hidden && m.classList.contains('is-open')
  );
  if (modal) {
    modal.classList.remove('is-open');
    modal.hidden = true;
  }

  for (const card of cards) {
    card.setAttribute('aria-expanded', 'false');
  }

  document.body.classList.remove('modal-open');
  lastFocused?.focus();
  lastFocused = null;
  selected = null;
}

for (const card of cards) {
  card.addEventListener('click', () => {
    const id = card.dataset.card;
    if (!id) return;

    if (selected === id) {
      closeShowcase();
    } else {
      openShowcase(id, card);
    }
  });
}

for (const trigger of openTriggers) {
  trigger.addEventListener('click', () => {
    const id = trigger.dataset.open;
    if (!id) return;
    openShowcase(id, trigger);
  });
}

for (const button of closeButtons) {
  button.addEventListener('click', () => closeShowcase());
}

for (const backdrop of Array.from(document.querySelectorAll<HTMLElement>('[data-backdrop]'))) {
  backdrop.addEventListener('click', () => {
    const id = backdrop.dataset.backdrop;
    if (selected === id) closeShowcase();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && selected !== null) {
    closeShowcase();
  }
});

for (const row of Array.from(document.querySelectorAll<HTMLElement>('.row'))) {
  const scroller = row.querySelector<HTMLElement>('.section__row');
  const prev = row.querySelector<HTMLButtonElement>('[data-scroll-prev]');
  const next = row.querySelector<HTMLButtonElement>('[data-scroll-next]');

  if (!scroller) continue;

  prev?.addEventListener('click', () =>
    scroller.scrollBy({ left: -scroller.clientWidth, behavior: 'smooth' })
  );
  next?.addEventListener('click', () =>
    scroller.scrollBy({ left: scroller.clientWidth, behavior: 'smooth' })
  );
}

const onScroll = (): void => {
  nav?.classList.toggle('is-scrolled', window.scrollY > 80);
  scrollHint?.classList.toggle('is-hidden', window.scrollY > 0);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

function applyTagFilter(tag: string | null): void {
  const url = new URL(window.location.href);
  if (tag) url.searchParams.set('tag', tag);
  else url.searchParams.delete('tag');
  window.history.replaceState({}, '', url);

  for (const card of cards) {
    const cardTags = (card.dataset.tags ?? '').split(' ').filter(Boolean);
    card.hidden = Boolean(tag) && !cardTags.includes(tag ?? '');
  }

  for (const section of sections) {
    const sectionCards = section.querySelectorAll<HTMLElement>('[data-card]');
    if (sectionCards.length === 0) continue;
    const anyVisible = Array.from(sectionCards).some((card) => !card.hidden);
    section.hidden = !anyVisible;
  }

  for (const button of tagButtons) {
    const active = (button.dataset.tag ?? '') === (tag ?? '');
    button.setAttribute('aria-pressed', String(active));
    button.classList.toggle('is-active', active);
  }

  if (tagNote) {
    const count = cards.filter((card) => !card.hidden).length;
    tagNote.textContent = tag
      ? `Showing ${count} reference${count === 1 ? '' : 's'} tagged \u201c${tag}\u201d`
      : '';
    tagNote.hidden = !tag;
  }
}

tagButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const tag = button.dataset.tag ?? '';
    if (selected !== null) closeShowcase();
    activeTag = activeTag === tag ? null : tag;
    applyTagFilter(activeTag);
  });
});

applyTagFilter(activeTag);

const tagList = document.querySelector<HTMLElement>('.tag-list');

function markLastTagRow(): void {
  if (!tagList) return;
  const items = Array.from(
    tagList.querySelectorAll<HTMLElement>('.tag-list__item')
  );
  if (items.length === 0) return;
  const columns = getComputedStyle(tagList).gridTemplateColumns.split(' ').length;
  const rows = Math.ceil(items.length / columns);
  const firstOfLastRow = (rows - 1) * columns;
  items.forEach((item, index) => {
    item.classList.toggle('is-last-row', index >= firstOfLastRow);
  });
}

markLastTagRow();
window.addEventListener('resize', markLastTagRow);
