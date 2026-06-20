(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            mobileButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            mobileButton.textContent = open ? '×' : '☰';
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === activeSlide);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === activeSlide);
        });
    }

    function nextSlide() {
        showSlide(activeSlide + 1);
    }

    function startCarousel() {
        if (slides.length < 2) {
            return;
        }
        stopCarousel();
        timer = window.setInterval(nextSlide, 5200);
    }

    function stopCarousel() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            stopCarousel();
            showSlide(Number(dot.getAttribute('data-slide')) || 0);
            startCarousel();
        });
    });

    var prevButton = document.querySelector('[data-hero-prev]');
    var nextButton = document.querySelector('[data-hero-next]');

    if (prevButton) {
        prevButton.addEventListener('click', function () {
            stopCarousel();
            showSlide(activeSlide - 1);
            startCarousel();
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', function () {
            stopCarousel();
            nextSlide();
            startCarousel();
        });
    }

    startCarousel();

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var input = document.querySelector('.js-card-search');
        var buttons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
        var activeType = 'all';

        if (!cards.length) {
            return;
        }

        function cardText(card) {
            return normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' '));
        }

        function apply() {
            var keyword = input ? normalize(input.value) : '';
            cards.forEach(function (card) {
                var type = card.getAttribute('data-type') || '';
                var matchesType = activeType === 'all' || type.indexOf(activeType) !== -1;
                var matchesKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !(matchesType && matchesKeyword));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                activeType = button.getAttribute('data-filter') || 'all';
                apply();
            });
        });

        apply();
    }

    setupFilters();

    window.applyInitialSearchQuery = function () {
        var params = new URLSearchParams(window.location.search);
        var value = params.get('q') || '';
        var input = document.querySelector('.js-card-search');
        if (input && value) {
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    };

    window.initMoviePlayer = function (source) {
        var shell = document.querySelector('[data-player]');
        if (!shell || !source) {
            return;
        }

        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var bound = false;
        var instance = null;

        if (!video || !overlay) {
            return;
        }

        function bindSource() {
            if (bound) {
                return;
            }
            bound = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({ enableWorker: true });
                instance.loadSource(source);
                instance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playMovie() {
            bindSource();
            overlay.classList.add('is-hidden');
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', playMovie);
        video.addEventListener('click', function () {
            if (video.paused) {
                playMovie();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (instance) {
                instance.destroy();
            }
        });
    };
})();
