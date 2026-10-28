(() => {
  const FPS = 30;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- video frame ---------------------------------------------------------
  const frame = document.querySelector('[data-frame]');
  const video = frame.querySelector('[data-video]');
  const playBtn = frame.querySelector('[data-play]');
  const soundBtn = frame.querySelector('[data-sound]');
  const timecode = frame.querySelector('[data-timecode]');
  const rec = frame.querySelector('[data-rec]');

  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const formatTimecode = (t) =>
    `${pad(t / 3600)}:${pad((t / 60) % 60)}:${pad(t % 60)}:${pad((t % 1) * FPS)}`;

  const renderState = () => {
    frame.classList.toggle('is-paused', video.paused);
    playBtn.textContent = video.paused ? '▶ Play signal' : '❚❚ Pause';
    rec.textContent = video.paused ? '■ Hold' : '● Rec';
    soundBtn.textContent = video.muted ? 'Sound off ◌' : 'Sound on ●';
    soundBtn.setAttribute('aria-pressed', String(!video.muted));
  };

  let raf = 0;
  const tick = () => {
    timecode.textContent = formatTimecode(video.currentTime);
    raf = requestAnimationFrame(tick);
  };

  let userPaused = false;
  const togglePlay = () => {
    if (!hasVideo()) return;
    userPaused = !video.paused;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  video.addEventListener('play', () => { renderState(); cancelAnimationFrame(raf); tick(); });
  video.addEventListener('pause', () => { renderState(); cancelAnimationFrame(raf); });
  video.addEventListener('volumechange', renderState);

  playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  frame.addEventListener('click', togglePlay);
  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    if (!video.muted && video.paused) { userPaused = false; video.play().catch(() => {}); }
  });

  // No playable source (e.g. video not uploaded yet) -> show "no signal" state.
  const hasVideo = () => !frame.classList.contains('no-video');
  const noVideo = () => { frame.classList.add('no-video'); video.pause(); };
  const sources = video.querySelectorAll('source');
  sources[sources.length - 1].addEventListener('error', noVideo);
  video.addEventListener('loadeddata', () => frame.classList.remove('no-video'));
  addEventListener('load', () => {
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && video.readyState === 0) noVideo();
  });

  // Autoplay muted while the frame is on screen, pause when scrolled away.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !userPaused && hasVideo()) video.play().catch(() => {});
      else if (!entry.isIntersecting && !video.paused) video.pause();
    }, { threshold: 0.35 }).observe(frame);
  }
  renderState();

  // --- band photos: fall back to the silhouette placeholder ----------------
  document.querySelectorAll('[data-photo]').forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  });

  // --- gigs: hide past dates ------------------------------------------------
  const today = new Date().toISOString().slice(0, 10);
  const gigs = [...document.querySelectorAll('[data-gigs] [data-date]')];
  gigs.forEach((gig) => { if (gig.dataset.date < today) gig.remove(); });
  if (!document.querySelector('[data-gigs] [data-date]')) {
    document.querySelector('[data-gigs]').remove();
    document.querySelector('[data-gigs-empty]').hidden = false;
  }

  // --- logo: click to copy the name with the real Ø -----------------------
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts / older browsers.
      const field = Object.assign(document.createElement('textarea'), { value: text });
      field.style.cssText = 'position:fixed;opacity:0';
      document.body.append(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
  };
  document.querySelectorAll('[data-copy]').forEach((el) => {
    const label = el.querySelector('[data-copied]');
    let timer = 0;
    el.addEventListener('click', async () => {
      await copyText(el.dataset.copy);
      el.classList.remove('is-copied');
      void el.offsetWidth; // restart the animations on repeated clicks
      el.classList.add('is-copied');
      label.textContent = 'Copied';
      clearTimeout(timer);
      timer = setTimeout(() => { el.classList.remove('is-copied'); label.textContent = ''; }, 1800);
    });
  });

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
