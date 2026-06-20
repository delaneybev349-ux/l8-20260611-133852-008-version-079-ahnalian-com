function setupMoviePlayer(sourceUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function startVideo() {
        loadVideo();

        if (cover) {
            cover.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (cover) {
        cover.addEventListener("click", startVideo);
    }

    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            startVideo();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
