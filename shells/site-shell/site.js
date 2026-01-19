(function () {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[data-link]'));
    const header = document.querySelector('header');

    const sections = navLinks
      .map(a => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);

    let sectionTops = [];

    function setActive(id) {
      navLinks.forEach(a => {
        a.dataset.active = (a.dataset.link === id) ? "true" : "false";
      });
    }

    function getNavHeight() {
      // Prefer actual header height for accuracy across breakpoints
      return header ? header.getBoundingClientRect().height : 0;
    }

    function computeSectionTops() {
      sectionTops = sections.map(sec => ({
        id: sec.id,
        top: sec.getBoundingClientRect().top + window.scrollY
      }));
      // Ensure sorted by position (safety)
      sectionTops.sort((a, b) => a.top - b.top);
    }

    function isAtBottom() {
      const scrollPos = window.scrollY + window.innerHeight;
      return scrollPos >= (document.documentElement.scrollHeight - 2);
    }

    function updateActiveFromScroll() {
      if (!sectionTops.length) computeSectionTops();

      // If at bottom, always highlight last section (Contact)
      if (isAtBottom()) {
        const last = sectionTops[sectionTops.length - 1];
        if (last) setActive(last.id);
        return;
      }

      const line = getNavHeight() + 18;
      const y = window.scrollY + line;

      // Find the last section whose top is <= y
      let current = sectionTops[0]?.id || "home";
      for (let i = 0; i < sectionTops.length; i++) {
        if (sectionTops[i].top <= y) current = sectionTops[i].id;
        else break;
      }

      setActive(current);
    }

    // Click: set immediately (feels responsive)
    navLinks.forEach(a => {
      a.addEventListener('click', () => {
        const id = a.getAttribute('href').slice(1);
        setActive(id);
      });
    });

    // Keep year current
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Recompute after load (fonts/layout settle), and on resize
    window.addEventListener('load', () => {
      computeSectionTops();
      updateActiveFromScroll();
      setTimeout(() => { computeSectionTops(); updateActiveFromScroll(); }, 250);
    });

    window.addEventListener('resize', () => {
      computeSectionTops();
      updateActiveFromScroll();
    });

    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });

        // Mobile menu
    const menuBtn = document.querySelector('.menu-btn');
    const menuOverlay = document.getElementById('mobileMenu');
    const menuClose = document.querySelector('.menu-close');

    function openMenu(){
      if (!menuOverlay) return;
      menuOverlay.dataset.open = "true";
      menuOverlay.setAttribute('aria-hidden', 'false');
      menuBtn?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu(){
      if (!menuOverlay) return;
      delete menuOverlay.dataset.open;
      menuOverlay.setAttribute('aria-hidden', 'true');
      menuBtn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    menuBtn?.addEventListener('click', openMenu);
    menuClose?.addEventListener('click', closeMenu);

    // Close when clicking the dim backdrop
    menuOverlay?.addEventListener('click', (e) => {
      if (e.target === menuOverlay) closeMenu();
    });

    // Close when selecting a link
    menuOverlay?.querySelectorAll('a[href^="#"][data-link]').forEach(a => {
      a.addEventListener('click', () => {
        setActive(a.dataset.link);
        closeMenu();
      });
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    // Initial
    computeSectionTops();
    updateActiveFromScroll();
  })();
