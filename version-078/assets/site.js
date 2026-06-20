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
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-slider]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector(".hero-prev");
        var next = root.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupSearch() {
        var form = document.querySelector("[data-search-form]");
        var list = document.querySelector("[data-search-list]");
        if (!form || !list) {
            return;
        }
        var input = form.querySelector("[data-search-input]");
        var select = form.querySelector("[data-category-filter]");
        var status = document.querySelector("[data-search-status]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input.value);
            var category = normalize(select.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.textContent
                ].join(" "));
                var textMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var categoryMatch = !category || haystack.indexOf(category) !== -1;
                var match = textMatch && categoryMatch;
                card.classList.toggle("hidden", !match);
                if (match) {
                    visible += 1;
                }
            });
            if (status) {
                status.textContent = visible ? "已显示匹配影片。" : "没有找到匹配影片。";
            }
        }

        input.addEventListener("input", apply);
        select.addEventListener("change", apply);
        form.addEventListener("reset", function () {
            window.setTimeout(apply, 0);
        });
    }

    window.initMoviePlayer = function (source) {
        ready(function () {
            var video = document.querySelector("[data-player-video]");
            var overlay = document.querySelector("[data-player-overlay]");
            if (!video || !source) {
                return;
            }
            var loaded = false;
            var hls = null;

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                load();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                video.setAttribute("controls", "controls");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                load();
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
