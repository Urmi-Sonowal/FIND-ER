/**
 * FIND-ER UI Manager
 * Centralized UI state management and component handling
 */

const UI = (function() {
    
    // UI State
    let state = {
        sidebarOpen: false,
        activeModal: null,
        notificationsOpen: false,
        currentUser: null,
        loading: false,
        theme: 'light',
        mobileMenuOpen: false
    };
    
    // Event listeners registry
    let eventListeners = [];
    
    // Initialize UI
    function init() {
        loadTheme();
        setupThemeToggle();
        setupSidebar();
        setupMobileMenu();
        setupQuickReportButton();
        setupBackToTop();
        setupScrollReveal();
        setupRippleEffects();
        updateUIFromState();
        // Initialize lucide icons so sidebar/logo icons render
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            try { window.lucide.createIcons(); } catch (e) { /* ignore */ }
        }
    }
    
    // Load saved theme
    function loadTheme() {
        const savedTheme = Storage.getTheme();
        state.theme = savedTheme;
        applyTheme(savedTheme);
    }
    
    // Apply theme to document
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-main-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-main-theme');
        }
    }
    
    // Setup quick report button
    function setupQuickReportButton() {
        const quickReportBtn = document.getElementById('quickReportBtn');
        if (!quickReportBtn) return;
        quickReportBtn.addEventListener('click', () => {
            window.location.href = 'report.html';
        });
    }
    
    // Setup theme toggle
    function setupThemeToggle() {
        const toggles = document.querySelectorAll('[data-theme-toggle]');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const newTheme = state.theme === 'light' ? 'dark' : 'light';
                state.theme = newTheme;
                applyTheme(newTheme);
                Storage.setTheme(newTheme);
                showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info', 1500);
            });
        });
    }
    
    // Setup sidebar
    function setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (!sidebar) return;
        
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (!isMobile) {
            // Desktop: collapse by default, expand on hover
            sidebar.classList.add('collapsed');
            
            sidebar.addEventListener('mouseenter', () => {
                if (!state.mobileMenuOpen) {
                    sidebar.classList.remove('collapsed');
                }
            });
            
            sidebar.addEventListener('mouseleave', () => {
                if (!state.mobileMenuOpen) {
                    sidebar.classList.add('collapsed');
                }
            });
        } else {
            // Mobile: overlay behavior
            sidebar.classList.add('collapsed');
            setupMobileSidebar(sidebar, menuToggle);
        }
    }
    
    // Setup mobile sidebar
    function setupMobileSidebar(sidebar, menuToggle) {
        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        
        function openSidebar() {
            sidebar.classList.add('mobile-open');
            sidebar.classList.remove('collapsed');
            overlay.classList.add('active');
            state.mobileMenuOpen = true;
            document.body.style.overflow = 'hidden';
        }
        
        function closeSidebar() {
            sidebar.classList.remove('mobile-open');
            sidebar.classList.add('collapsed');
            overlay.classList.remove('active');
            state.mobileMenuOpen = false;
            document.body.style.overflow = '';
        }
        
        if (menuToggle) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (state.mobileMenuOpen) {
                    closeSidebar();
                } else {
                    openSidebar();
                }
            });
        }
        
        overlay.addEventListener('click', closeSidebar);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.mobileMenuOpen) {
                closeSidebar();
            }
        });
    }
    
    // Setup mobile menu
    function setupMobileMenu() {
        const nav = document.querySelector('.navbar');
        if (!nav) return;
        
        const links = nav.querySelector('.nav-links');
        const actions = nav.querySelector('.nav-actions');
        if (!links) return;
        
        let btn = nav.querySelector('.nav-mobile-toggle');
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'nav-mobile-toggle';
            btn.setAttribute('aria-label', 'Open menu');
            btn.setAttribute('aria-expanded', 'false');
            btn.innerHTML = '<span></span><span></span><span></span>';
            const logo = nav.querySelector('.nav-logo');
            if (logo && logo.after) logo.after(btn);
        }
        
        let overlay = document.querySelector('.nav-mobile-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-mobile-overlay';
            document.body.appendChild(overlay);
        }
        
        function closeMenu() {
            nav.classList.remove('nav-open');
            btn.setAttribute('aria-expanded', 'false');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        function openMenu() {
            nav.classList.add('nav-open');
            btn.setAttribute('aria-expanded', 'true');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        btn.addEventListener('click', () => {
            if (nav.classList.contains('nav-open')) closeMenu();
            else openMenu();
        });
        
        overlay.addEventListener('click', closeMenu);
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
        
        links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        if (actions) {
            actions.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
        }
    }
    
    // Setup back to top button
    function setupBackToTop() {
        let btn = document.getElementById('backToTopBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.type = 'button';
            btn.id = 'backToTopBtn';
            btn.className = 'back-to-top';
            btn.setAttribute('aria-label', 'Back to top');
            btn.innerHTML = '<i data-lucide="chevron-up"></i>';
            document.body.appendChild(btn);
            
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
        }
        
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 300);
        }, { passive: true });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Setup scroll reveal
    function setupScrollReveal() {
        Helpers.setupScrollReveal();
    }
    
    // Setup ripple effects on buttons
    function setupRippleEffects() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn, [data-ripple]');
            if (!btn || btn.disabled) return;
            
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${Math.max(rect.width, rect.height)}px;
                height: ${Math.max(rect.width, rect.height)}px;
                border-radius: 50%;
                background: rgba(255,255,255,0.35);
                pointer-events: none;
                transform: scale(0);
                opacity: 0.3;
                transition: transform 0.5s ease-out, opacity 0.5s ease-out;
            `;
            
            if (getComputedStyle(btn).position === 'static') {
                btn.style.position = 'relative';
            }
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            
            requestAnimationFrame(() => {
                ripple.style.transform = 'scale(2.5)';
                ripple.style.opacity = '0';
            });
            
            setTimeout(() => ripple.remove(), 500);
        });
    }
    
    // Update UI from state
    function updateUIFromState() {
        // Update sidebar state
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            if (state.sidebarOpen) {
                sidebar.classList.remove('collapsed');
            } else if (!state.mobileMenuOpen) {
                sidebar.classList.add('collapsed');
            }
        }
        
        // Update loading indicators
        if (state.loading) {
            showGlobalLoader();
        } else {
            hideGlobalLoader();
        }
    }
    
    // Show global loader
    function showGlobalLoader() {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.className = 'global-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(loader);
            
            // Add styles if not present
            if (!document.getElementById('loaderStyles')) {
                const style = document.createElement('style');
                style.id = 'loaderStyles';
                style.textContent = `
                    .global-loader {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0,0,0,0.5);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                    }
                    .loader-content {
                        background: white;
                        padding: 30px;
                        border-radius: 20px;
                        text-align: center;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    }
                    .loader-spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid var(--primary-200);
                        border-top-color: var(--primary);
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto 15px;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        loader.style.display = 'flex';
    }
    
    // Hide global loader
    function hideGlobalLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    // Update user information in UI
    function updateUserInfo(user) {
        state.currentUser = user;
        
        // Update sidebar
        const sidebarName = document.getElementById('sidebarUserName');
        const sidebarId = document.getElementById('sidebarUserId');
        const sidebarRole = document.getElementById('sidebarUserRole');
        const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
        
        if (sidebarName) sidebarName.textContent = user?.name || 'User';
        if (sidebarId) sidebarId.textContent = user?.collegeId || '';
        if (sidebarRole && user) {
            sidebarRole.innerHTML = `<span class="role-${user.role}">${user.role.toUpperCase()}</span>`;
        }
        if (sidebarAvatar && user?.name) {
            const initials = user.name.split(' ').map(s => s.charAt(0)).join('').slice(0, 2).toUpperCase();
            sidebarAvatar.textContent = initials;
        }
        
        // Update header
        const headerName = document.getElementById('headerUserName');
        const headerRole = document.getElementById('headerUserRole');
        const headerAvatar = document.querySelector('.header-user .user-avatar-small');
        
        if (headerName) headerName.textContent = user?.name || 'User';
        if (headerRole && user) headerRole.textContent = user.role.toUpperCase();
        if (headerAvatar && user?.name) {
            headerAvatar.textContent = user.name.charAt(0).toUpperCase();
        }
        
        // Update welcome message
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName && user) welcomeName.textContent = user.name;
        
        const timeOfDay = document.getElementById('timeOfDay');
        if (timeOfDay) timeOfDay.textContent = Helpers.getTimeOfDayGreeting();
    }
    
    // Show toast notification
    function showToast(message, type = 'info', duration = 3000) {
        Helpers.showToast(message, type, duration);
    }
    
    // Add event listener with tracking for cleanup
    function addEventListener(element, event, handler) {
        if (!element) return;
        element.addEventListener(event, handler);
        eventListeners.push({ element, event, handler });
    }
    
    // Remove all event listeners
    function removeAllEventListeners() {
        eventListeners.forEach(({ element, event, handler }) => {
            if (element) {
                element.removeEventListener(event, handler);
            }
        });
        eventListeners = [];
    }
    
    // Cleanup on page unload
    function cleanup() {
        removeAllEventListeners();
    }
    
    // Public API
    return {
        init,
        updateUserInfo,
        showToast,
        addEventListener,
        cleanup,
        getState: () => ({ ...state }),
        setLoading: (loading) => { state.loading = loading; updateUIFromState(); },
        runCountUpAnimations: () => Helpers.runCountUpAnimations(),
        setupScrollReveal
    };
})();

window.TraceItUI = UI;
// Expose icon refresh utility
window.refreshIcons = function() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try { window.lucide.createIcons(); } catch (e) {}
    }
};
// UI module exposed globally