(function () {
    function all(selector, context) {
        return Array.prototype.slice.call((context || document).querySelectorAll(selector));
    }

    function one(selector, context) {
        return (context || document).querySelector(selector);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMenu() {
        var button = one('[data-menu-toggle]');
        var nav = one('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.hidden = !nav.hidden;
        });
    }

    function resultLink(item) {
        var link = document.createElement('a');
        link.className = 'search-result-link';
        link.href = item.href;

        var title = document.createElement('span');
        title.textContent = item.title;

        var meta = document.createElement('small');
        meta.textContent = [item.year, item.type, item.category].filter(Boolean).join(' · ');

        link.appendChild(title);
        link.appendChild(meta);
        return link;
    }

    function renderResults(input, container, limit) {
        if (!container) {
            return;
        }
        var query = normalize(input.value);
        container.innerHTML = '';
        if (!query || typeof SiteSearchItems === 'undefined') {
            return;
        }
        var words = query.split(/\s+/).filter(Boolean);
        var matches = SiteSearchItems.filter(function (item) {
            var haystack = normalize([item.title, item.year, item.type, item.category, item.genre, item.region].join(' '));
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, limit || 10);
        matches.forEach(function (item) {
            container.appendChild(resultLink(item));
        });
    }

    function initGlobalSearch() {
        var dialog = one('[data-search-dialog]');
        if (!dialog) {
            return;
        }
        var input = one('[data-global-search-input]', dialog);
        var results = one('[data-global-search-results]', dialog);
        all('[data-search-open]').forEach(function (button) {
            button.addEventListener('click', function () {
                dialog.hidden = false;
                document.body.classList.add('search-lock');
                setTimeout(function () {
                    if (input) {
                        input.focus();
                    }
                }, 20);
            });
        });
        all('[data-search-close]', dialog).forEach(function (button) {
            button.addEventListener('click', function () {
                dialog.hidden = true;
                document.body.classList.remove('search-lock');
            });
        });
        if (input) {
            input.addEventListener('input', function () {
                renderResults(input, results, 12);
            });
        }
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !dialog.hidden) {
                dialog.hidden = true;
                document.body.classList.remove('search-lock');
            }
        });
    }

    function initInlineSearch() {
        all('[data-inline-search]').forEach(function (box) {
            var input = one('[data-inline-search-input]', box);
            var results = one('[data-inline-search-results]', box);
            if (!input) {
                return;
            }
            input.addEventListener('input', function () {
                renderResults(input, results, 8);
            });
        });
    }

    function initCategoryFilters() {
        all('[data-category-filter]').forEach(function (toolbar) {
            var section = toolbar.closest('.site-section') || document;
            var input = one('[data-filter-input]', toolbar);
            var buttons = all('[data-type-filter]', toolbar);
            var cards = all('[data-movie-card]', section);
            var activeType = 'all';

            function apply() {
                var query = normalize(input ? input.value : '');
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-keywords')
                    ].join(' '));
                    var type = card.getAttribute('data-type') || '';
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passType = activeType === 'all' || type.indexOf(activeType) !== -1;
                    card.classList.toggle('is-hidden', !(passQuery && passType));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeType = button.getAttribute('data-type-filter') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    apply();
                });
            });
        });
    }

    function initHero() {
        var root = one('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = all('[data-hero-slide]', root);
        var dots = all('[data-hero-dot]', root);
        var previous = one('[data-hero-prev]', root);
        var next = one('[data-hero-next]', root);
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initImages() {
        all('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-broken');
                image.removeAttribute('src');
            }, { once: true });
        });
    }

    function initPlayer() {
        var video = one('[data-player-video]');
        var button = one('[data-player-button]');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var hlsInstance = null;

        function attach() {
            if (!stream) {
                return;
            }
            if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            }
        }

        function start() {
            if (!video.src && !hlsInstance) {
                attach();
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        attach();
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initGlobalSearch();
        initInlineSearch();
        initCategoryFilters();
        initHero();
        initImages();
        initPlayer();
    });
}());
