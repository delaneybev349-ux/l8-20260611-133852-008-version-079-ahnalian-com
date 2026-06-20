(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (slides.length <= 1) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector(".filter-panel");
        if (!panel) {
            return;
        }
        var input = panel.querySelector(".filter-input");
        var year = panel.querySelector(".filter-year");
        var type = panel.querySelector(".filter-type");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            var t = type ? type.value : "";
            cards.forEach(function (card) {
                var text = ((card.dataset.title || "") + " " + (card.dataset.tags || "")).toLowerCase();
                var okText = !q || text.indexOf(q) !== -1;
                var okYear = !y || (card.dataset.year || "").indexOf(y) !== -1;
                var okType = !t || (card.dataset.type || "").indexOf(t) !== -1;
                card.style.display = okText && okYear && okType ? "" : "none";
            });
        }
        [input, year, type].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.SearchIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var input = root.querySelector(".filter-input");
        var note = root.querySelector(".search-results-note");
        var results = root.querySelector(".movie-grid");
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        function render(value) {
            var q = (value || "").trim().toLowerCase();
            var pool = window.SearchIndex.filter(function (item) {
                if (!q) {
                    return item.hot;
                }
                return item.text.toLowerCase().indexOf(q) !== -1;
            }).slice(0, 80);
            if (note) {
                note.textContent = q ? "相关影片" : "热门影片";
            }
            if (results) {
                results.innerHTML = pool.map(function (item) {
                    return '<article class="movie-card"><a class="poster-link" href="' + item.href + '"><img src="' + item.image + '" alt="' + item.title + '" loading="lazy"><span class="play-dot">▶</span></a><div class="movie-card-body"><div class="movie-meta"><span>' + item.category + '</span><span>' + item.year + '</span><span>' + item.region + '</span></div><h3><a href="' + item.href + '">' + item.title + '</a></h3><p>' + item.line + '</p><div class="tag-row"><span>' + item.type + '</span><span>' + item.genre + '</span></div></div></article>';
                }).join("");
            }
        }
        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
        render(query);
    }

    function initPlayer(url) {
        var video = document.getElementById("movie-player");
        var overlay = document.querySelector(".player-overlay");
        if (!video || !url) {
            return;
        }
        var attached = false;
        var hlsInstance = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            }
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("click", function () {
            attach();
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });

    window.MovieSite = {
        initPlayer: initPlayer
    };
})();
