function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.mobile-nav');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) {
    return;
  }
  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-dots button'));
  if (!slides.length) {
    return;
  }
  let current = 0;
  let timer = null;
  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  };
  const start = () => {
    timer = window.setInterval(() => show(current + 1), 5200);
  };
  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stop();
      show(index);
      start();
    });
  });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  start();
}

function populateSelect(select, values) {
  if (!select) {
    return;
  }
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function initFilters() {
  const panel = document.querySelector('.filter-panel');
  if (!panel) {
    return;
  }
  const input = panel.querySelector('.filter-input');
  const yearSelect = panel.querySelector('.filter-year');
  const regionSelect = panel.querySelector('.filter-region');
  const cards = Array.from(document.querySelectorAll('.js-card'));
  const years = Array.from(new Set(cards.map(card => card.dataset.year).filter(Boolean))).sort((a, b) => b.localeCompare(a));
  const regions = Array.from(new Set(cards.map(card => card.dataset.region).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  populateSelect(yearSelect, years);
  populateSelect(regionSelect, regions);
  const apply = () => {
    const text = (input ? input.value : '').trim().toLowerCase();
    const year = yearSelect ? yearSelect.value : '';
    const region = regionSelect ? regionSelect.value : '';
    cards.forEach(card => {
      const haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre, card.dataset.type, card.textContent].join(' ').toLowerCase();
      const visible = (!text || haystack.includes(text)) && (!year || card.dataset.year === year) && (!region || card.dataset.region === region);
      card.classList.toggle('is-filtered-out', !visible);
    });
  };
  [input, yearSelect, regionSelect].forEach(control => {
    if (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    }
  });
}

function cardHtml(movie) {
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
  return `<article class="movie-card js-card">
    <a class="poster-link" href="${safe(movie.url)}" aria-label="观看${safe(movie.title)}">
      <img src="${safe(movie.cover)}" alt="${safe(movie.title)}" loading="lazy">
      <span class="card-badge">${safe(movie.type)}</span>
      <span class="card-score">${safe(movie.score)}</span>
    </a>
    <div class="movie-card-body">
      <h3><a href="${safe(movie.url)}">${safe(movie.title)}</a></h3>
      <p class="movie-meta">${safe(movie.year)} · ${safe(movie.region)} · ${safe(movie.genre)}</p>
      <p class="movie-desc">${safe(movie.one_line)}</p>
    </div>
  </article>`;
}

async function initSearchPage() {
  if (document.body.dataset.page !== 'search') {
    return;
  }
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') || '';
  if (input) {
    input.value = initial;
  }
  const module = await import('./movies-search.js');
  const movies = module.movies || [];
  const render = query => {
    const keyword = query.trim().toLowerCase();
    const list = movies.filter(movie => {
      if (!keyword) {
        return true;
      }
      return [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.one_line].join(' ').toLowerCase().includes(keyword);
    }).slice(0, 120);
    results.innerHTML = list.map(cardHtml).join('');
  };
  render(initial);
  if (input) {
    input.addEventListener('input', () => render(input.value));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHero();
  initFilters();
  initSearchPage();
});
