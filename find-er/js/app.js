/**
 * FIND-ER Main Application
 * Entry point - initializes all modules
 */

(function() {
    'use strict';
    
    let isInitialized = false;
    
    async function initializeApp(force = false) {
        if (isInitialized && !force) return;
        isInitialized = true;
        
        // HIDE LOADER
        setTimeout(() => {
            const loader = document.getElementById('pageLoader');
            if (loader) {
                loader.classList.add('hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 500);
        
        try {
            // Ensure default data exists
            await ensureDefaultData();

            // Helper to initialize modules safely
            const safeInit = (label, fn) => {
                try {
                    if (fn && typeof fn === 'function') fn();
                } catch (err) {
                    console.warn(`Module init failed: ${label}`, err);
                }
            };

            // Initialize modules (UI first)
            safeInit('FindERUI', window.FindERUI && window.FindERUI.init);
            safeInit('FindERAuth', window.FindERAuth && window.FindERAuth.init);
            safeInit('FindERDropdowns', window.FindERDropdowns && window.FindERDropdowns.init);
            safeInit('FindERModals', window.FindERModals && window.FindERModals.init);
            safeInit('FindERLoaders', window.FindERLoaders && window.FindERLoaders.init);
            safeInit('FindERNotifications', window.FindERNotifications && window.FindERNotifications.init);
            safeInit('FindERSearch', window.FindERSearch && window.FindERSearch.init);
            safeInit('FindERReports', window.FindERReports && window.FindERReports.init);
            safeInit('FindERDashboard', window.FindERDashboard && window.FindERDashboard.init);

            // Initialize filters (if on lost/found page)
            initializeFiltersIfNeeded();
            
            // Run count-up animations
            setTimeout(() => {
                if (window.FindERHelpers && typeof window.FindERHelpers.runCountUpAnimations === 'function') {
                    window.FindERHelpers.runCountUpAnimations();
                }
            }, 200);
            
            // Setup session expiry
            setupSessionExpiry();
            
            // Update user info in UI
            updateUserInfoInUI();
            
            console.log('Find-ER initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Find-ER:', error);
            if (window.FindERUI && typeof window.FindERUI.showToast === 'function') {
                window.FindERUI.showToast('Failed to load application. Please refresh the page.', 'error');
            }
        }
    }
    
    // Ensure default data exists
    async function ensureDefaultData() {
        // Check if users exist
        let users = [];
        if (window.Storage && typeof window.Storage.getUsers === 'function') {
            users = window.Storage.getUsers();
        } else if (window.FindERStorage && typeof window.FindERStorage.getUsers === 'function') {
            users = window.FindERStorage.getUsers();
        }
        
        if (!users || users.length === 0) {
            await loadDefaultUsers();
        }
        
        // Check if reports exist
        let reports = [];
        if (window.Storage && typeof window.Storage.getReports === 'function') {
            reports = window.Storage.getReports();
        } else if (window.FindERStorage && typeof window.FindERStorage.getReports === 'function') {
            reports = window.FindERStorage.getReports();
        }
        
        if (!reports || reports.length === 0) {
            await loadDefaultReports();
        }
        
        // Check if notifications store exists
        let notifStore = null;
        if (window.Storage && typeof window.Storage.getNotificationsStore === 'function') {
            notifStore = window.Storage.getNotificationsStore();
        } else if (window.FindERStorage && typeof window.FindERStorage.getNotificationsStore === 'function') {
            notifStore = window.FindERStorage.getNotificationsStore();
        }
        
        if (!notifStore) {
            if (window.Storage && typeof window.Storage.saveNotificationsStore === 'function') {
                window.Storage.saveNotificationsStore({});
            } else if (window.FindERStorage && typeof window.FindERStorage.saveNotificationsStore === 'function') {
                window.FindERStorage.saveNotificationsStore({});
            }
        }
    }
    
    // Load default users
    async function loadDefaultUsers() {
        const defaultUsers = [
            {
                id: 'u-student-1',
                name: 'Student User',
                collegeId: 'STU001',
                email: 'student@college.edu',
                department: 'CSE',
                year: '3rd Year',
                role: 'student',
                passwordHash: await hashPasswordHelper('student123'),
                memberSince: new Date().toISOString()
            },
            {
                id: 'u-admin-1',
                name: 'Admin User',
                collegeId: 'admin',
                email: 'admin@college.edu',
                department: 'Administration',
                year: '',
                role: 'admin',
                passwordHash: 'b2d4c8f1a9e3d7c5b0f2e6a4d8c2b6f0e4a8d2c6b0f4e8a2d6c0b4f8e2a6d4c8',
                memberSince: new Date().toISOString()
            }
        ];
        
        const storage = window.Storage || window.FindERStorage;
        if (storage && typeof storage.saveUsers === 'function') {
            storage.saveUsers(defaultUsers);
        } else {
            localStorage.setItem('findER_users', JSON.stringify(defaultUsers));
        }
    }
    
    // Load default reports
    async function loadDefaultReports() {
        const defaultReports = [
            {
                id: 'LOST1001',
                type: 'lost',
                name: 'College ID Card',
                category: 'ID Card',
                location: 'CSE Block, Room 205',
                date: new Date().toISOString(),
                description: 'Student ID Card - Venkatasaarathy, CSE, 3rd Year',
                status: 'pending',
                reporterId: 'STU001',
                reportedBy: { name: 'Student User', collegeId: 'STU001' },
                phone: '9876543210',
                email: 'student@college.edu',
                reportedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            },
            {
                id: 'FOUND1001',
                type: 'found',
                name: 'Water Bottle',
                category: 'Water Bottle',
                location: 'Library',
                date: new Date().toISOString(),
                description: 'Blue water bottle found on second floor',
                status: 'ready',
                reporterId: 'LIB001',
                reportedBy: { name: 'Library Staff', collegeId: 'LIB001' },
                phone: '9876543215',
                email: 'library@college.edu',
                reportedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            }
        ];
        
        const storage = window.Storage || window.FindERStorage;
        if (storage && typeof storage.saveReports === 'function') {
            storage.saveReports(defaultReports);
        } else {
            localStorage.setItem('findER_reports', JSON.stringify(defaultReports));
        }
    }
    
    // Hash password helper
    async function hashPasswordHelper(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Initialize filters if on lost/found page
    function initializeFiltersIfNeeded() {
        const page = window.location.pathname.split('/').pop();
        if (page === 'lost.html' || page === 'found.html') {
            setTimeout(() => {
                const type = page === 'lost.html' ? 'lost' : 'found';
                let items = [];
                const storage = window.Storage || window.FindERStorage;
                if (storage && typeof storage.getReportsByType === 'function') {
                    items = storage.getReportsByType(type);
                }
                
                if (window.FindERFilters && typeof window.FindERFilters.init === 'function') {
                    window.FindERFilters.init(type, items);
                }
            }, 300);
        }
    }
    
    // Setup session expiry warning
    function setupSessionExpiry() {
        const SESSION_TIMEOUT = 60 * 60 * 1000;
        const WARNING_TIME = 5 * 60 * 1000;
        
        let warningShown = false;
        let timeoutId = null;
        let warningTimeoutId = null;
        
        function resetTimer() {
            warningShown = false;
            if (timeoutId) clearTimeout(timeoutId);
            if (warningTimeoutId) clearTimeout(warningTimeoutId);
            
            warningTimeoutId = setTimeout(() => {
                if (!warningShown) {
                    const isLoggedIn = (window.Storage && window.Storage.isLoggedIn && window.Storage.isLoggedIn()) ||
                                      (window.FindERStorage && window.FindERStorage.isLoggedIn && window.FindERStorage.isLoggedIn());
                    if (isLoggedIn) {
                        warningShown = true;
                        if (window.FindERModals && typeof window.FindERModals.showAlert === 'function') {
                            window.FindERModals.showAlert('Your session will expire in 5 minutes due to inactivity.', 'Session Warning', 'warning');
                        } else if (window.FindER && typeof window.FindER.alert === 'function') {
                            window.FindER.alert('Your session will expire in 5 minutes due to inactivity.', 'Session Warning');
                        }
                    }
                }
            }, SESSION_TIMEOUT - WARNING_TIME);
            
            timeoutId = setTimeout(() => {
                const isLoggedIn = (window.Storage && window.Storage.isLoggedIn && window.Storage.isLoggedIn()) ||
                                  (window.FindERStorage && window.FindERStorage.isLoggedIn && window.FindERStorage.isLoggedIn());
                if (isLoggedIn) {
                    if (window.Storage && typeof window.Storage.clearCurrentUser === 'function') {
                        window.Storage.clearCurrentUser();
                    } else if (window.FindERStorage && typeof window.FindERStorage.clearCurrentUser === 'function') {
                        window.FindERStorage.clearCurrentUser();
                    }
                    if (window.FindERModals && typeof window.FindERModals.showAlert === 'function') {
                        window.FindERModals.showAlert('Your session has expired. Please login again.', 'Session Expired', 'error');
                    } else if (window.FindER && typeof window.FindER.alert === 'function') {
                        window.FindER.alert('Your session has expired. Please login again.', 'Session Expired');
                    }
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            }, SESSION_TIMEOUT);
        }
        
        ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev => {
            document.addEventListener(ev, resetTimer, true);
        });
        
        resetTimer();
    }
    
    // Update user info in UI
    function updateUserInfoInUI() {
        let currentUser = null;
        const storage = window.Storage || window.FindERStorage;
        if (storage && typeof storage.getCurrentUser === 'function') {
            currentUser = storage.getCurrentUser();
        }
        
        if (currentUser && window.FindERUI && typeof window.FindERUI.updateUserInfo === 'function') {
            window.FindERUI.updateUserInfo(currentUser);
        }
    }
    
    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
    // Also run when window loads (fallback)
    window.addEventListener('load', function() {
        setTimeout(() => {
            if (!isInitialized) {
                initializeApp();
            }
        }, 100);
    });
    
    // Expose global modules
    window.FindERApp = {
        initialized: () => isInitialized,
        init: initializeApp,
        reinit: () => initializeApp(true)
    };
    
})();
// Force avatar and dropdown initialization after all components load
window.addEventListener('load', function() {
    setTimeout(function() {
        // Update sidebar avatar
        const user = Storage.getCurrentUser();
        if (user) {
            const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
            if (sidebarAvatar) {
                const initials = (user.name || 'U').charAt(0).toUpperCase();
                sidebarAvatar.textContent = initials;
            }
            
            const headerAvatar = document.getElementById('headerAvatar');
            if (headerAvatar) {
                headerAvatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
            }
            
            const sidebarName = document.getElementById('sidebarUserName');
            if (sidebarName) sidebarName.textContent = user.name || 'User';
            
            const sidebarId = document.getElementById('sidebarUserId');
            if (sidebarId) sidebarId.textContent = user.collegeId || '';
        }
        
        // Setup profile dropdown
        const userChip = document.getElementById('headerUserChip');
        const dropdown = document.getElementById('profileDropdown');
        if (userChip && dropdown) {
            userChip.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('open');
            };
            document.onclick = function(e) {
                if (!dropdown.contains(e.target) && !userChip.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            };
        }
    }, 200);
});