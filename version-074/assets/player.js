(function () {
  function initMoviePlayer(src) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var trigger = document.getElementById("play-trigger");
    var hls = null;
    var attached = false;

    if (!video || !src) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function play() {
      attachSource();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        play();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
