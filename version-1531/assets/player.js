(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector("[data-player-overlay]");
    var button = shell.querySelector("[data-play-start]");
    var source = video ? video.getAttribute("data-stream") : "";
    var loaded = false;
    var hls = null;

    function attachSource() {
      if (!video || loaded || !source) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function beginPlayback(event) {
      if (event) {
        event.preventDefault();
      }
      attachSource();
      shell.classList.add("is-playing");
      if (overlay) {
        overlay.setAttribute("aria-hidden", "true");
      }
      if (video) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", beginPlayback);
    }
    if (overlay) {
      overlay.addEventListener("click", beginPlayback);
    }
    if (video) {
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  if (document.readyState !== "loading") {
    document.querySelectorAll(".player-shell").forEach(setupPlayer);
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll(".player-shell").forEach(setupPlayer);
    });
  }
})();
