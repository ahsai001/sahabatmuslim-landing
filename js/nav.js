// Mobile navigation handler for Sahabat Muslim
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (!navLinks) return;
    const isOpen = navLinks.classList.toggle('active');
    if (toggleBtn) {
        toggleBtn.innerHTML = isOpen ? '<span>✕</span>' : '<span>☰</span>';
        toggleBtn.setAttribute('aria-expanded', isOpen);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Auto-close on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.querySelector('.nav-links');
            const toggleBtn = document.getElementById('mobile-menu-toggle');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (toggleBtn) toggleBtn.innerHTML = '<span>☰</span>';
            }
        });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.querySelector('nav');
        const navLinks = document.querySelector('.nav-links');
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        if (nav && !nav.contains(e.target) && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (toggleBtn) toggleBtn.innerHTML = '<span>☰</span>';
        }
    });
});
