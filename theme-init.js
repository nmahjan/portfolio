(() => {
  const stored = localStorage.getItem('portfolio-theme');
  const theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
