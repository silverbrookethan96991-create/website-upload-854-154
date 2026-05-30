(function () {
  function setup(videoId, playButtonId, overlayId, source) {
    var video = document.getElementById(videoId);
    var playButton = document.getElementById(playButtonId);
    var overlay = document.getElementById(overlayId);
    var hls = null;
    var loaded = false;

    if (!video || !source) {
      return;
    }

    function showMessage(text) {
      var oldMessage = video.parentNode.querySelector('.player-message');
      if (oldMessage) {
        oldMessage.remove();
      }
      var message = document.createElement('div');
      message.className = 'player-message';
      message.textContent = text;
      video.parentNode.appendChild(message);
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放暂时不可用，请稍后再试');
          }
        });
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      loadSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          showMessage('点击视频控件开始播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.SitePlayer = {
    setup: setup
  };
})();
