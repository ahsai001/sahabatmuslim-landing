// Mobile navigation handler for Sahabat Muslim
function toggleMobileMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const navLinks = document.querySelector('.nav-links');
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    if (!navLinks) return;
    
    const isOpen = navLinks.classList.toggle('active');
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        const icon = toggleBtn.querySelector('span') || toggleBtn;
        icon.textContent = isOpen ? '✕' : '☰';
    }
}

// Ensure function is available globally
window.toggleMobileMenu = toggleMobileMenu;

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMobileMenu(e);
        });
    }

    // Auto-close when clicking any navigation link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    const icon = toggleBtn.querySelector('span') || toggleBtn;
                    icon.textContent = '☰';
                }
            }
        });
    });

    // Close when clicking outside of navbar and dropdown
    document.addEventListener('click', (e) => {
        if (!navLinks || !navLinks.classList.contains('active')) return;
        
        // If clicked inside the menu or on toggle button, do nothing
        if (e.target.closest('.nav-links') || e.target.closest('#mobile-menu-toggle')) {
            return;
        }

        navLinks.classList.remove('active');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', 'false');
            const icon = toggleBtn.querySelector('span') || toggleBtn;
            icon.textContent = '☰';
        }
    });
});
