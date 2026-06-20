export function startMoviePlayer(videoUrl) {
  const video = document.getElementById('moviePlayer');
  const overlay = document.getElementById('playerOverlay');
  if (!video || !videoUrl) {
    return;
  }
  let ready = false;
  let hls = null;
  const attach = () => {
    if (ready) {
      return;
    }
    ready = true;
    const Hls = window.Hls;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
  };
  const play = () => {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };
  if (overlay) {
    overlay.addEventListener('click', play);
  }
  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', () => {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
  video.addEventListener('ended', () => {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
}
