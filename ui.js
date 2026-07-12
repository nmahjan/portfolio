(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const uiLocale = ['es', 'fr'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
  const uiText = {
    en: { language: 'Change language', light: 'Switch to light mode', dark: 'Switch to dark mode' },
    es: { language: 'Cambiar idioma', light: 'Cambiar al modo claro', dark: 'Cambiar al modo oscuro' },
    fr: { language: 'Changer de langue', light: 'Passer au mode clair', dark: 'Passer au mode sombre' }
  }[uiLocale];
  const themeButton = document.createElement('button');
  themeButton.className = 'theme-toggle';
  themeButton.type = 'button';

  const syncThemeButton = () => {
    const isDark = document.documentElement.dataset.theme !== 'light';
    themeButton.innerHTML = `<span aria-hidden="true">${isDark ? '☼' : '◐'}</span>${isDark ? 'LIGHT' : 'DARK'}`;
    themeButton.setAttribute('aria-label', isDark ? uiText.light : uiText.dark);
    themeButton.setAttribute('aria-pressed', String(!isDark));
  };

  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    const buttonRect = themeButton.getBoundingClientRect();
    document.documentElement.style.setProperty('--theme-x', `${buttonRect.left + buttonRect.width / 2}px`);
    document.documentElement.style.setProperty('--theme-y', `${buttonRect.top + buttonRect.height / 2}px`);
    const applyTheme = () => {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      localStorage.setItem('portfolio-theme', next);
      syncThemeButton();
    };

    themeButton.classList.add('is-switching');

    if (!reduceMotion && document.startViewTransition) {
      const transition = document.startViewTransition(applyTheme);
      transition.finished.finally(() => themeButton.classList.remove('is-switching'));
      return;
    }

    if (!reduceMotion) document.documentElement.classList.add('theme-transitioning');
    applyTheme();
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      themeButton.classList.remove('is-switching');
    }, reduceMotion ? 0 : 500);
  });

  syncThemeButton();

  const languageLabels = { en: 'EN', es: 'ES', fr: 'FR' };
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const localeIndex = pathParts.findIndex((part) => part === 'es' || part === 'fr');
  const currentLocale = localeIndex >= 0 ? pathParts[localeIndex] : 'en';
  const lastPart = pathParts[pathParts.length - 1] || '';
  const pageName = lastPart.endsWith('.html') ? lastPart : 'index.html';
  let baseParts;

  if (localeIndex >= 0) {
    baseParts = pathParts.slice(0, localeIndex);
  } else {
    baseParts = [...pathParts];
    if (lastPart.endsWith('.html')) baseParts.pop();
  }

  const localeHref = (locale) => {
    const base = baseParts.length ? `/${baseParts.join('/')}/` : '/';
    return `${base}${locale === 'en' ? '' : `${locale}/`}${pageName}`;
  };

  const languageSwitcher = document.createElement('div');
  languageSwitcher.className = 'language-switcher';
  const languageButton = document.createElement('button');
  languageButton.className = 'language-toggle';
  languageButton.type = 'button';
  languageButton.textContent = languageLabels[currentLocale];
  languageButton.setAttribute('aria-label', uiText.language);
  languageButton.setAttribute('aria-expanded', 'false');
  languageButton.setAttribute('aria-haspopup', 'menu');

  const languageMenu = document.createElement('div');
  languageMenu.className = 'language-menu';
  languageMenu.setAttribute('role', 'menu');
  Object.keys(languageLabels).filter((locale) => locale !== currentLocale).forEach((locale) => {
    const link = document.createElement('a');
    link.href = localeHref(locale);
    link.textContent = languageLabels[locale];
    link.hreflang = locale;
    link.lang = locale;
    link.setAttribute('role', 'menuitem');
    languageMenu.append(link);
  });

  const closeLanguageMenu = () => {
    languageSwitcher.classList.remove('is-open');
    languageButton.setAttribute('aria-expanded', 'false');
  };

  languageButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = languageSwitcher.classList.toggle('is-open');
    languageButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', closeLanguageMenu);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLanguageMenu();
      languageButton.focus();
    }
  });

  languageSwitcher.append(languageButton, languageMenu);
  const headerRight = document.querySelector('.header-right');
  headerRight?.append(languageSwitcher, themeButton);

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  let progressFrame = 0;
  const updateProgress = () => {
    progressFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progress.style.transform = `scaleX(${ratio})`;
  };

  window.addEventListener('scroll', () => {
    if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();

  const motionTargets = document.querySelectorAll([
    '.project-card',
    '.project-detail-card',
    '.overview-card',
    '.skill-category',
    '.interest-card',
    '.value-item',
    '.timeline-content',
    '.award-item',
    '.contact-method-card',
    '.faq-item',
    '.form-container',
    '.education-card'
  ].join(', '));

  motionTargets.forEach((item) => {
    item.classList.add('spotlight-card', 'reveal');
  });

  document.querySelectorAll(
    '.overview-grid, .projects-grid, .interests-grid, .values-grid, .skills-grid, .contact-methods, .faq-grid'
  ).forEach((grid) => {
    [...grid.children].forEach((item, index) => {
      item.style.setProperty('--reveal-delay', `${Math.min(index * 75, 300)}ms`);
    });
  });

  document.querySelectorAll(
    '.project-image, .project-image-large, .about-image, .hero-image'
  ).forEach((image) => image.classList.add('image-reveal'));

  document.querySelectorAll(
    'section h2, .page-header h1, .projects-section .project-kicker'
  ).forEach((heading) => heading.classList.add('heading-reveal', 'reveal'));

  document.querySelectorAll('.hero-text, .about-text').forEach((text) => {
    text.classList.add('reveal', 'reveal-right');
  });

  const timeline = document.querySelector('.timeline');
  if (timeline) timeline.classList.add('timeline-animate');

  const cards = document.querySelectorAll('.spotlight-card');

  cards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    });
  });

  const reveals = document.querySelectorAll('.reveal, .image-reveal, .timeline-animate');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  reveals.forEach((item) => observer.observe(item));
})();
