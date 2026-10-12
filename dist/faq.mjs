// Keep native details/summary behavior while bridging the height change.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const easing = getComputedStyle(document.documentElement)
  .getPropertyValue('--ease-out').trim() || 'cubic-bezier(.23,1,.32,1)';
const finishAnimations = [];

document.querySelectorAll('.faq details').forEach(details => {
  const summary = details.querySelector(':scope > summary');
  if (!summary) return;

  const originalHeight = details.style.height;
  const originalOverflow = details.style.overflow;
  let animation = null;
  let targetOpen = details.open;

  function restoreStyles() {
    details.style.height = originalHeight;
    details.style.overflow = originalOverflow;
  }

  function finish() {
    const previous = animation;
    animation = null;
    previous?.cancel();
    details.open = targetOpen;
    restoreStyles();
  }

  finishAnimations.push(() => { if (animation) finish(); });

  summary.addEventListener('click', event => {
    // Native keyboard activation also emits click; nested links retain their action.
    if (event.defaultPrevented || (event.button != null && event.button !== 0)
      || event.target.closest('a, button, input, select, textarea')) return;
    event.preventDefault();
    targetOpen = animation ? !targetOpen : !details.open;

    if (reducedMotion.matches || typeof details.animate !== 'function') {
      finish();
      return;
    }

    // Read the visible height before cancelling so rapid toggles reverse in place.
    const from = parseFloat(getComputedStyle(details).height);
    animation?.cancel();
    animation = null;
    restoreStyles();
    details.open = targetOpen;
    const to = parseFloat(getComputedStyle(details).height);
    // Content must remain rendered until the collapse finishes.
    details.open = true;

    if (!Number.isFinite(from) || !Number.isFinite(to) || Math.abs(to - from) < 1) {
      finish();
      return;
    }

    details.style.height = `${from}px`;
    details.style.overflow = 'hidden';
    const next = details.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: 200, easing, fill: 'both' }
    );
    animation = next;
    next.onfinish = () => { if (animation === next) finish(); };
  });
});

reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) finishAnimations.forEach(finish => finish());
});
