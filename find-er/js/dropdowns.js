/**
 * FIND-ER Dropdowns Module
 * Centralized dropdown management
 */

const Dropdowns = (function() {
    
    let activeDropdown = null;
    let initAttempts = 0;
    const MAX_ATTEMPTS = 10;
    
    function init() {
        // Wait for elements to be available
        waitForElements();
        setupGlobalClickHandler();
        setupEscapeHandler();
    }
    
    function waitForElements() {
        const userChip = document.getElementById('headerUserChip');
        const dropdown = document.getElementById('profileDropdown');
        
        if (userChip && dropdown) {
            setupProfileDropdown();
            console.log('Profile dropdown initialized successfully');
        } else if (initAttempts < MAX_ATTEMPTS) {
            initAttempts++;
            console.log(`Waiting for dropdown elements... Attempt ${initAttempts}`);
            setTimeout(waitForElements, 200);
        } else {
            console.warn('Could not find profile dropdown elements after multiple attempts');
        }
    }
    
    function setupProfileDropdown() {
        const userChip = document.getElementById('headerUserChip');
        const dropdown = document.getElementById('profileDropdown');
        
        if (!userChip || !dropdown) return;
        
        // Remove any existing event listeners by cloning
        const newChip = userChip.cloneNode(true);
        userChip.parentNode.replaceChild(newChip, userChip);
        
        // Add click event to the user chip
        newChip.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown(dropdown);
        });
        
        // Also ensure the user chip has proper styling for click
        newChip.style.cursor = 'pointer';
        
        // Handle logout inside dropdown if it exists
        const logoutBtn = dropdown.querySelector('.logout-dd, #profileDropdownLogout');
        if (logoutBtn) {
            // Clone to remove old listeners
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
            newLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.Storage && typeof window.Storage.clearCurrentUser === 'function') {
                    window.Storage.clearCurrentUser();
                }
                window.location.href = '../login.html';
            });
        }
        
        // Handle any other dropdown links
        const dropdownLinks = dropdown.querySelectorAll('a:not(.logout-dd)');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                dropdown.classList.remove('open');
                activeDropdown = null;
            });
        });
    }
    
    function toggleDropdown(dropdown) {
        if (!dropdown) return;
        
        // Close if already open
        if (dropdown.classList.contains('open')) {
            dropdown.classList.remove('open');
            activeDropdown = null;
        } else {
            // Close any open dropdown first
            closeAllDropdowns();
            dropdown.classList.add('open');
            activeDropdown = dropdown;
        }
    }
    
    function closeAllDropdowns() {
        document.querySelectorAll('.profile-dropdown.open, .header-dropdown.open, #profileDropdown.open').forEach(dd => {
            dd.classList.remove('open');
        });
        activeDropdown = null;
    }
    
    function setupGlobalClickHandler() {
        document.addEventListener('click', function(e) {
            // Don't close if clicking inside a dropdown or its trigger
            const isInsideDropdown = e.target.closest('.profile-dropdown, .header-dropdown, #profileDropdown');
            const isInsideTrigger = e.target.closest('#headerUserChip, .header-user-chip');
            
            if (!isInsideDropdown && !isInsideTrigger) {
                closeAllDropdowns();
            }
        });
    }
    
    function setupEscapeHandler() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });
    }
    
    function registerDropdown(triggerId, dropdownId) {
        const trigger = document.getElementById(triggerId);
        const dropdown = document.getElementById(dropdownId);
        
        if (trigger && dropdown) {
            // Remove existing listeners
            const newTrigger = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(newTrigger, trigger);
            
            newTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleDropdown(dropdown);
            });
        }
    }
    
    // Force re-initialization (call after dynamic content loads)
    function reinit() {
        initAttempts = 0;
        waitForElements();
    }
    
    // Public API
    return {
        init,
        registerDropdown,
        closeAllDropdowns,
        toggleDropdown,
        reinit
    };
})();

window.FindERDropdowns = Dropdowns;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Dropdowns.init());
} else {
    Dropdowns.init();
}

// Also try to initialize after a delay (for dynamically loaded content)
setTimeout(() => {
    if (!document.getElementById('profileDropdown')?.classList) {
        Dropdowns.reinit();
    }
}, 500);

setTimeout(() => {
    Dropdowns.reinit();
}, 1000);