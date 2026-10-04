/* ============================================
   router.js – Client-side routing
   ============================================ */

const Router = {
  routes: {},
  current: null,

  register(name, handler) { this.routes[name] = handler; },

  navigate(route, params = {}) {
    this.current = route;
    window.location.hash = route;
    this._render(route, params);
  },

  _render(route, params = {}) {
    const handler = this.routes[route];
    if (!handler) { this.navigate('login'); return; }

    // Auth guards
    const publicRoutes  = ['login', 'register', 'forgot-password'];
    const noNavRoutes   = ['login', 'register', 'forgot-password', 'career-setup'];
    if (!publicRoutes.includes(route) && !Auth.isLoggedIn()) { this.navigate('login'); return; }
    if (route === 'admin' && !Auth.isAdmin()) { this.navigate('dashboard'); return; }

    // Render navbar (hidden on auth pages and career-setup)
    const navEl = document.getElementById('app-navbar');
    if (!noNavRoutes.includes(route)) {

      if (!navEl) {
        const nav = document.createElement('div');
        nav.id = 'app-navbar';
        document.getElementById('app').prepend(nav);
      }
      document.getElementById('app-navbar').innerHTML = UI.renderNavbar(route);
      UI.initNavbar();
    } else {
      if (navEl) navEl.remove();
    }

    // Render page
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    handler(container, params);

    // Re-init lucide icons
    if (window.lucide) lucide.createIcons();
    window.scrollTo(0, 0);
  },

  init() {
    const hash = window.location.hash.replace('#', '') || '';
    const route = hash || (Auth.isLoggedIn() ? 'dashboard' : 'login');
    this._render(route);

    window.addEventListener('hashchange', () => {
      const r = window.location.hash.replace('#', '') || 'login';
      this._render(r);
    });
  }
};
