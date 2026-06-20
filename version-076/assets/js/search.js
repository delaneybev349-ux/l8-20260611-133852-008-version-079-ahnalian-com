(function () {
    var input = document.getElementById("global-search-input");
    var results = document.getElementById("search-results");
    var note = document.getElementById("search-result-note");

    if (!input || !results || typeof SEARCH_MOVIES === "undefined") {
        return;
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function card(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\">" +
            "<a href=\"./" + escapeHtml(movie.url) + "\" class=\"movie-poster\">" +
                "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
                "<a href=\"./" + escapeHtml(movie.url) + "\" class=\"movie-title\">" + escapeHtml(movie.title) + "</a>" +
                "<p class=\"movie-line\">" + escapeHtml(movie.oneLine) + "</p>" +
                "<div class=\"movie-meta\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
                "<div class=\"tag-list\">" + tags + "</div>" +
            "</div>" +
        "</article>";
    }

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function render() {
        var keyword = normalize(input.value).trim();

        if (!keyword) {
            results.innerHTML = "<div class=\"empty-state\">请输入片名、类型、标签、地区或年份进行搜索</div>";
            if (note) {
                note.textContent = "";
            }
            return;
        }

        var matched = SEARCH_MOVIES.filter(function (movie) {
            return normalize([
                movie.title,
                movie.year,
                movie.type,
                movie.region,
                movie.genre,
                movie.category,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" ")).indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (note) {
            note.textContent = matched.length ? "已找到相关影视内容" : "未找到相关影视内容";
        }

        if (!matched.length) {
            results.innerHTML = "<div class=\"empty-state\">没有匹配的影片，请尝试其他关键词</div>";
            return;
        }

        results.innerHTML = "<div class=\"movie-grid\">" + matched.map(card).join("") + "</div>";
    }

    input.addEventListener("input", render);
    render();
})();
