(() => {
  const navigation = performance.getEntriesByType?.('navigation')[0];
  const isReload = navigation ? navigation.type === 'reload' : performance.navigation?.type === 1;
  if (!isReload) return;

  // Run before any app restores progress; leave other projects' storage intact.
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      const storage = window[name];
      // Snapshot first: removing keys can reorder Storage.key() during iteration.
      const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
      for (const key of keys) {
        if (key?.startsWith('hkchat-')) storage.removeItem(key);
      }
    } catch {}
  }
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', () => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, { once: true });
})();
