const players = document.querySelectorAll('[data-player]');

players.forEach((player) => {
  const video = player.querySelector('video');
  const cover = player.querySelector('.player-cover');
  const stream = player.getAttribute('data-stream');
  let prepared = false;
  let hls = null;

  const prepare = () => {
    if (prepared || !video || !stream) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (globalThis.Hls && globalThis.Hls.isSupported()) {
      hls = new globalThis.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  };

  const play = async () => {
    prepare();

    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (video) {
      video.controls = true;
      try {
        await video.play();
      } catch (error) {
        video.controls = true;
      }
    }
  };

  if (cover) {
    cover.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });
  }

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
