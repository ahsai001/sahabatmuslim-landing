// ==========================================================================
// Sahabat Muslim - Navigation Handler (Dropdowns & Mobile Drawer)
// ==========================================================================

let lastNavToggleTime = 0;

function toggleMobileMenu(event) {
    const now = Date.now();
    if (now - lastNavToggleTime < 250) {
        if (event) event.stopPropagation();
        return;
    }
    lastNavToggleTime = now;

    if (event) {
        event.stopPropagation();
    }

    const wrapper = document.getElementById('nav-menu-wrapper') || document.querySelector('.nav-links');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (!wrapper) return;

    const isOpen = wrapper.classList.toggle('active');
    if (toggleBtn) {
        toggleBtn.classList.toggle('active', isOpen);
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    // Toggle body scrolling lock
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    const wrapper = document.getElementById('nav-menu-wrapper') || document.querySelector('.nav-links');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (wrapper && wrapper.classList.contains('active')) {
        wrapper.classList.remove('active');
        document.body.style.overflow = '';
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    }
}

// Expose globally for inline onclick
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const wrapper = document.getElementById('nav-menu-wrapper') || document.querySelector('.nav-links');

    // Desktop dropdown click support (especially for touch devices / iPad)
    const dropdownBtns = document.querySelectorAll('.nav-dropdown-btn');
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const parentItem = btn.closest('.nav-item.has-dropdown');
            if (!parentItem) return;

            const isAlreadyOpen = parentItem.classList.contains('is-open');

            // Close any other open dropdowns first
            document.querySelectorAll('.nav-item.has-dropdown.is-open').forEach(openItem => {
                if (openItem !== parentItem) {
                    openItem.classList.remove('is-open');
                    const otherBtn = openItem.querySelector('.nav-dropdown-btn');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current dropdown
            parentItem.classList.toggle('is-open', !isAlreadyOpen);
            btn.setAttribute('aria-expanded', !isAlreadyOpen ? 'true' : 'false');
        });
    });

    // Auto-close when clicking any link
    document.querySelectorAll('.sm-navbar a, .nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
            // Also close any open desktop dropdowns
            document.querySelectorAll('.nav-item.has-dropdown.is-open').forEach(item => {
                item.classList.remove('is-open');
            });
        });
    });

    // Close when clicking outside of navbar, dropdowns, and drawer
    document.addEventListener('click', (e) => {
        // Close desktop dropdowns if clicked outside
        if (!e.target.closest('.nav-item.has-dropdown')) {
            document.querySelectorAll('.nav-item.has-dropdown.is-open').forEach(item => {
                item.classList.remove('is-open');
                const btn = item.querySelector('.nav-dropdown-btn');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });
        }

        // Close mobile drawer if clicked outside
        if (wrapper && wrapper.classList.contains('active')) {
            if (e.target.closest('#nav-menu-wrapper') || e.target.closest('.nav-links') || e.target.closest('#mobile-menu-toggle')) {
                return;
            }
            closeMobileMenu();
        }
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
            document.querySelectorAll('.nav-item.has-dropdown.is-open').forEach(item => {
                item.classList.remove('is-open');
            });
        }
    });
});
