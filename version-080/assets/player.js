(function () {
    const player = document.querySelector("[data-player]");

    if (!player) {
        return;
    }

    const video = player.querySelector("video");
    const overlay = player.querySelector("[data-player-overlay]");
    const status = player.querySelector("[data-player-status]");
    const source = video ? video.dataset.src : "";
    let hlsInstance = null;
    let started = false;

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function playVideo() {
        if (!video || !source || started) {
            return;
        }

        started = true;
        video.controls = true;

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {
                setStatus("点击播放器继续播放");
            });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                autoStartLoad: true,
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    setStatus("点击播放器继续播放");
                });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    setStatus("当前网络暂时无法加载播放内容");
                }
            });
            return;
        }

        setStatus("当前浏览器不支持此播放内容");
    }

    if (overlay) {
        overlay.addEventListener("click", playVideo);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!started) {
                playVideo();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
