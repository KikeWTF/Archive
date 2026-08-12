const hero = document.querySelector<HTMLElement>('[data-billboard]');
const slides = Array.from(document.querySelectorAll<HTMLElement>('[data-slide]'));
const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-dot]'));
const titles = Array.from(
  document.querySelectorAll<HTMLElement>('.slide__title, .card__name')
);

const SLIDE_MS = 6000;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let current = 0;
let timer: number | undefined;

function show(index: number): void {
  current = index;

  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    if (active) slide.removeAttribute('inert');
    else slide.setAttribute('inert', '');
  });

  dots.forEach((dot, i) => {
    dot.setAttribute('aria-current', i === index ? 'true' : 'false');
  });
}

function startTimer(): void {
  stopTimer();
  timer = window.setInterval(() => {
    if (document.hidden) return;
    show((current + 1) % slides.length);
  }, SLIDE_MS);
}

function stopTimer(): void {
  if (timer !== undefined) window.clearInterval(timer);
  timer = undefined;
}

if (slides.length > 1 && !reduceMotion) {
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.dot));
      startTimer();
    });
  });

  hero?.addEventListener('focusin', (event) => {
    if ((event.target as HTMLElement).closest?.('[data-dot]')) stopTimer();
  });
  hero?.addEventListener('focusout', (event) => {
    if (!(event.relatedTarget as HTMLElement)?.closest?.('[data-dot]')) startTimer();
  });

  startTimer();
}

show(0);

function fitTitles(): void {
  for (const title of titles) {
    const maxWidth = title.clientWidth;
    title.style.fontSize = '';
    if (title.scrollWidth <= maxWidth) continue;

    let low = 10;
    let high = parseFloat(getComputedStyle(title).fontSize) || 48;
    while (high - low > 0.5) {
      const mid = (low + high) / 2;
      title.style.fontSize = `${mid}px`;
      if (title.scrollWidth <= maxWidth) low = mid;
      else high = mid;
    }
    title.style.fontSize = `${low}px`;
  }
}

fitTitles();
if (document.fonts?.ready) void document.fonts.ready.then(fitTitles);
window.addEventListener('load', fitTitles);
window.addEventListener('resize', fitTitles);
