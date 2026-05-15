const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('navDrawer');

if (hamburger && navDrawer) {
  hamburger.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navDrawer.contains(e.target)) {
      navDrawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  navDrawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navDrawer.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}
