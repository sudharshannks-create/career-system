/* ============================================
   app.js – Application entry point
   ============================================ */
// NOTE: Pages namespace is declared in index.html before page scripts load

// ─── Boot sequence ───────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Initialize store (seed data if first run)
  Store.init();

  // Register all routes
  Router.register('login',            Pages.login);
  Router.register('register',         Pages.register);
  Router.register('forgot-password',  Pages.forgotPassword);
  Router.register('career-setup',     Pages.careerSetup);
  Router.register('dashboard',        Pages.dashboard);
  Router.register('profile',          Pages.profile);
  Router.register('assessment',       Pages.assessment);
  Router.register('careers',          Pages.careers);
  Router.register('coach',            Pages.coach);
  Router.register('interview',        Pages.interview);
  Router.register('resume',           Pages.resume);
  Router.register('portfolio',        Pages.portfolio);
  Router.register('jobs',             Pages.jobs);
  Router.register('admin',            Pages.admin);

  // Init router
  Router.init();

  // Init Lucide icons
  if (window.lucide) lucide.createIcons();

  // Mobile menu close on outside click
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('mobile-menu');
    const hamburger = document.getElementById('hamburger-btn');
    if (menu && menu.classList.contains('open') && !menu.contains(e.target) && e.target !== hamburger && !hamburger?.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  console.log('%c🚀 NextStep AI', 'color:#4f46e5;font-size:18px;font-weight:900');
  console.log('%cYour AI-powered path to the right career.', 'color:#7c3aed;font-size:12px');
});

// ─── Quick action hover effect ───────────────
document.addEventListener('mouseover', (e) => {
  const card = e.target.closest('.quick-action-card');
  if (card) { card.style.transform = 'translateY(-3px)'; card.style.boxShadow = '0 8px 20px rgba(0,0,0,.12)'; }
});
document.addEventListener('mouseout', (e) => {
  const card = e.target.closest('.quick-action-card');
  if (card) { card.style.transform = ''; card.style.boxShadow = ''; }
});
