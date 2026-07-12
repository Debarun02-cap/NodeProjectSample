// Landing page motion:
// - Cards start offset horizontally (LTR / RTL / LTR) on every page load
// - On first scroll to each card: it slides to center once, then stays fixed there

(function () {
  const cards = Array.from(document.querySelectorAll('.info-card--move-x'));
  if (!cards.length) return;

  function getTravel() {
    // responsive travel distance; looks good on desktop and doesn’t break mobile
    const w = window.innerWidth || 1000;
    return Math.max(160, Math.min(320, Math.round(w * 0.24)));
  }

  function dirSign(el) {
    const dir = (el.dataset.dir || 'ltr').toLowerCase();
    // ltr starts from left (-), rtl starts from right (+)
    return dir === 'rtl' ? 1 : -1;
  }

  function setInitialOffsets() {
    const travel = getTravel();
    for (const el of cards) {
      if (el.classList.contains('is-centered')) continue;
      const sign = dirSign(el);
      el.style.setProperty('--tx', `${(sign * travel).toFixed(2)}px`);
    }
  }

  // One-time settle per card when it enters the viewport the first time
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        if (el.classList.contains('is-centered')) {
          io.unobserve(el);
          continue;
        }
        // Slide to center and keep it there
        el.style.setProperty('--tx', '0px');
        el.classList.add('is-centered');
        io.unobserve(el);
      }
    },
    {
      // Trigger when the card is reasonably visible
      threshold: 0.25,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  for (const el of cards) io.observe(el);

  // Init and keep offsets correct if viewport changes (before cards have centered)
  setInitialOffsets();
  window.addEventListener('resize', setInitialOffsets);
})();


