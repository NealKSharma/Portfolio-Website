// Mobile Navigation Handler
(function() {
    const nav = document.querySelector('.side-rail nav');
    if (!nav) return;

    // Check if we're on mobile (navigation is horizontal)
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', 'Toggle menu');
    hamburger.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';

    // Insert hamburger into side-rail before nav
    const sideRail = document.querySelector('.side-rail');
    sideRail.insertBefore(hamburger, nav);
    document.body.appendChild(backdrop);

    // Toggle menu
    function toggleMenu(e) {
        if (e) e.stopPropagation();
        nav.classList.toggle('active');
        backdrop.classList.toggle('active');
        hamburger.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    // Close menu
    function closeMenu() {
        nav.classList.remove('active');
        backdrop.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    // Event listeners
    hamburger.addEventListener('click', toggleMenu);
    backdrop.addEventListener('click', closeMenu);

    // Close menu when clicking nav links
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on window resize to desktop
    window.addEventListener('resize', function() {
        if (!isMobile() && nav.classList.contains('active')) {
            closeMenu();
        }
    });

    // Show/hide hamburger based on screen size
    function updateNavigation() {
        if (isMobile()) {
            hamburger.style.display = 'flex';
            backdrop.style.display = 'block';
        } else {
            hamburger.style.display = 'none';
            backdrop.style.display = 'none';
            closeMenu();
        }
    }

    // Initial check
    updateNavigation();
    window.addEventListener('resize', updateNavigation);
})();