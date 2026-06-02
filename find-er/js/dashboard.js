/**
 * FIND-ER Dashboard Module - COMPLETE FIXED VERSION
 * Handles all dashboard functionality
 */

// Helper hash function
async function hashPasswordHelper(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function setupGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    const searchDropdown = document.getElementById('globalSearchDropdown');
    
    if (!searchInput || !searchDropdown) return;
    
    function performSearch() {
        const term = searchInput.value.trim().toLowerCase();
        
        if (!term) {
            searchDropdown.classList.remove('is-open');
            return;
        }
        
        const reports = Storage.getReports();
        const results = reports.filter(item => {
            return (item.name || '').toLowerCase().includes(term) ||
                   (item.location || '').toLowerCase().includes(term) ||
                   (item.category || '').toLowerCase().includes(term);
        }).slice(0, 8);
        
        if (!results.length) {
            searchDropdown.innerHTML = `<div class="global-search-item" style="padding:12px; text-align:center; color:#64748b;">No results found for "${escapeHtml(term)}"</div>`;
            searchDropdown.classList.add('is-open');
            return;
        }
        
        searchDropdown.innerHTML = results.map(item => `
            <a class="global-search-item" href="item-detail.html?id=${encodeURIComponent(item.id)}" style="display:flex; align-items:center; gap:12px; padding:12px 16px; text-decoration:none; color:inherit; border-bottom:1px solid #e2e8f0;">
                <span style="font-size:20px;">${getCategoryIcon(item.category)}</span>
                <div>
                    <strong>${escapeHtml(item.name)}</strong>
                    <div style="font-size:11px; color:#64748b;">${escapeHtml(item.category)} · ${escapeHtml(item.type)} · ${escapeHtml(item.location)}</div>
                </div>
            </a>
        `).join('');
        
        searchDropdown.classList.add('is-open');
    }
    
    searchInput.addEventListener('input', function() {
        setTimeout(performSearch, 300);
    });
    
    searchInput.addEventListener('focus', performSearch);
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.header-search-wrap')) {
            searchDropdown.classList.remove('is-open');
        }
    });
}

function getCategoryIcon(category) {
    const icons = {
        'ID Card': '🪪',
        'Electronics': '📱',
        'Books': '📚',
        'Accessories': '⌚',
        'Keys': '🔑',
        'Bag': '🎒',
        'Water Bottle': '🧴',
        'Card': '💳',
        'Wallet': '👝',
        'Other': '📦'
    };
    return icons[category] || '📦';
}

const Dashboard = (function() {
    
    let currentUser = null;
    let currentPage = '';
    
    function init() {
        currentUser = Storage.getCurrentUser();
        currentPage = window.location.pathname.split('/').pop();
        
        // CRITICAL FIX: Check if admin but on student page - redirect
        if (currentUser && currentUser.role === 'admin') {
            // If admin is on student dashboard, redirect to admin dashboard
            if (currentPage === 'student-dashboard.html') {
                console.log('Admin on student page, redirecting to admin dashboard');
                window.location.href = 'admin-dashboard.html';
                return;
            }
        }
        
        // CRITICAL FIX: Check if student but on admin page - redirect
        if (currentUser && currentUser.role === 'student') {
            if (currentPage === 'admin-dashboard.html') {
                console.log('Student on admin page, redirecting to student dashboard');
                window.location.href = 'student-dashboard.html';
                return;
            }
        }
        
        if (!currentUser) {
            console.log('No user found, redirecting to login');
            window.location.href = '../login.html';
            return;
        }
        
        // Update ALL UI elements with user info
        updateAllUserInfo();
        
        // Initialize based on page type
        if (currentPage === 'student-dashboard.html') {
            initStudentDashboard();
        } else if (currentPage === 'admin-dashboard.html') {
            initAdminDashboard();
        } else if (currentPage === 'lost.html') {
            initLostPage();
        } else if (currentPage === 'found.html') {
            initFoundPage();
        } else if (currentPage === 'profile.html') {
            initProfilePage();
        } else if (currentPage === 'notifications.html') {
            initNotificationsPage();
        } else if (currentPage === 'item-detail.html') {
            initItemDetailPage();
        }
        
        // Common dashboard setup
        updateNavBadges();
        setupAdminControls(); // This will show/hide admin bar based on role
        setupRecentlyViewed();
        setupLogoutHandlers();
        setupProfileDropdownFixed();
    }
    
    // ========== UPDATE ALL USER INFO ==========
    function updateAllUserInfo() {
        if (!currentUser) return;
        
        console.log('Updating user info for:', currentUser.name, 'Role:', currentUser.role);
        
        // Sidebar elements
        const sidebarName = document.getElementById('sidebarUserName');
        const sidebarId = document.getElementById('sidebarUserId');
        const sidebarRole = document.getElementById('sidebarUserRole');
        const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
        
        if (sidebarName) sidebarName.textContent = currentUser.name || 'User';
        if (sidebarId) sidebarId.textContent = currentUser.collegeId || '';
        if (sidebarRole && currentUser.role) {
            sidebarRole.innerHTML = `<span class="role-${currentUser.role}">${currentUser.role.toUpperCase()}</span>`;
        }
        if (sidebarAvatar) {
            const initials = (currentUser.name || 'U').charAt(0).toUpperCase();
            sidebarAvatar.textContent = initials;
        }
        
        // Header elements
        const headerName = document.getElementById('headerUserName');
        const headerRole = document.getElementById('headerUserRole');
        const headerAvatar = document.getElementById('headerAvatar');
        
        if (headerName) headerName.textContent = currentUser.name || 'User';
        if (headerRole) headerRole.textContent = currentUser.role ? currentUser.role.toUpperCase() : 'STUDENT';
        if (headerAvatar) {
            headerAvatar.textContent = (currentUser.name || 'U').charAt(0).toUpperCase();
        }
        
        // Welcome message
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) welcomeName.textContent = currentUser.name || 'Student';
        
        const timeOfDay = document.getElementById('timeOfDay');
        if (timeOfDay) {
            const hour = new Date().getHours();
            if (hour < 12) timeOfDay.textContent = 'morning';
            else if (hour < 17) timeOfDay.textContent = 'afternoon';
            else timeOfDay.textContent = 'evening';
        }
        
        // Member since badge
        const memberSince = document.getElementById('memberSinceBadge');
        if (memberSince && currentUser.memberSince) {
            const date = new Date(currentUser.memberSince);
            memberSince.textContent = date.getFullYear();
        }
        
        // Profile page elements
        const profileName = document.getElementById('profileHeroName');
        const profileEmail = document.getElementById('profileHeroEmail');
        const profileAvatarLg = document.getElementById('profileAvatarLg');
        const displayName = document.getElementById('displayName');
        const displayEmail = document.getElementById('displayEmail');
        const displayCollegeId = document.getElementById('displayCollegeId');
        const displayMemberSince = document.getElementById('displayMemberSince');
        const profileNameInput = document.getElementById('profileName');
        const profileEmailInput = document.getElementById('profileEmail');
        const profileCollegeIdInput = document.getElementById('profileCollegeId');
        
        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email || 'student@college.edu';
        if (profileAvatarLg) profileAvatarLg.textContent = (currentUser.name || 'S').charAt(0).toUpperCase();
        if (displayName) displayName.textContent = currentUser.name;
        if (displayEmail) displayEmail.textContent = currentUser.email || '';
        if (displayCollegeId) displayCollegeId.textContent = currentUser.collegeId;
        if (displayMemberSince && currentUser.memberSince) {
            const date = new Date(currentUser.memberSince);
            displayMemberSince.textContent = date.toLocaleDateString();
        }
        if (profileNameInput) profileNameInput.value = currentUser.name || '';
        if (profileEmailInput) profileEmailInput.value = currentUser.email || '';
        if (profileCollegeIdInput) profileCollegeIdInput.value = currentUser.collegeId || '';
        
        // Department and year tags
        const deptTag = document.getElementById('profileTagDept');
        const yearTag = document.getElementById('profileTagYear');
        if (deptTag) deptTag.textContent = currentUser.department || 'CSE';
        if (yearTag) yearTag.textContent = currentUser.year || '3rd Year';
    }
    
    // ========== SETUP PROFILE DROPDOWN ==========
function setupProfileDropdownFixed() {
    const userChip = document.getElementById('headerUserChip');
    const dropdown = document.getElementById('profileDropdown');
    
    if (!userChip || !dropdown) {
        console.log('Profile dropdown elements not found');
        return;
    }
    
    // Remove any existing listeners by cloning
    const newChip = userChip.cloneNode(true);
    userChip.parentNode.replaceChild(newChip, userChip);
    
    newChip.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('open');
        console.log('Dropdown toggled:', dropdown.classList.contains('open'));
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !newChip.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
    
    // Handle logout from dropdown
    const logoutBtn = document.getElementById('profileDropdownLogout');
    if (logoutBtn) {
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        newLogoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Storage.clearCurrentUser();
            window.location.href = '../login.html';
        });
    }
}
    
    function updateSidebarAvatar() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        // Sidebar avatar
        const sidebarAvatar = document.querySelector('.sidebar .user-avatar');
        if (sidebarAvatar) {
            const name = currentUser.name || 'User';
            const initials = name.split(' ').map(s => s.charAt(0)).join('').slice(0, 2).toUpperCase();
            sidebarAvatar.textContent = initials;
            sidebarAvatar.style.display = 'flex';
            sidebarAvatar.style.alignItems = 'center';
            sidebarAvatar.style.justifyContent = 'center';
        }
        
        // Header avatar
        const headerAvatar = document.getElementById('headerAvatar');
        if (headerAvatar) {
            const name = currentUser.name || 'User';
            headerAvatar.textContent = name.charAt(0).toUpperCase();
            headerAvatar.style.display = 'flex';
            headerAvatar.style.alignItems = 'center';
            headerAvatar.style.justifyContent = 'center';
        }
        
        // Sidebar user name
        const sidebarUserName = document.getElementById('sidebarUserName');
        if (sidebarUserName) {
            sidebarUserName.textContent = currentUser.name || 'User';
        }
        
        // Sidebar user ID
        const sidebarUserId = document.getElementById('sidebarUserId');
        if (sidebarUserId) {
            sidebarUserId.textContent = currentUser.collegeId || '';
        }
        
        // Sidebar user role
        const sidebarUserRole = document.getElementById('sidebarUserRole');
        if (sidebarUserRole && currentUser.role) {
            sidebarUserRole.innerHTML = `<span class="role-${currentUser.role}">${currentUser.role.toUpperCase()}</span>`;
        }
    }
    
    function updateHeaderUserInfo() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        const headerUserName = document.getElementById('headerUserName');
        const headerUserRole = document.getElementById('headerUserRole');
        const headerAvatar = document.getElementById('headerAvatar');
        
        if (headerUserName) headerUserName.textContent = currentUser.name || 'User';
        if (headerUserRole) headerUserRole.textContent = currentUser.role ? currentUser.role.toUpperCase() : 'STUDENT';
        if (headerAvatar) {
            headerAvatar.textContent = (currentUser.name || 'U').charAt(0).toUpperCase();
        }
    }
    
    // ========== SETUP LOGOUT HANDLERS ==========
    function setupLogoutHandlers() {
        document.querySelectorAll('.logout-btn, #sidebarLogoutBtn, #navbarLogoutBtn').forEach(btn => {
            btn.removeEventListener('click', handleLogout);
            btn.addEventListener('click', handleLogout);
        });
    }
    
    function handleLogout(e) {
        e.preventDefault();
        Storage.clearCurrentUser();
        window.location.href = '../login.html';
    }
    
    // ========== UPDATE NAV BADGES (Lost/Found counts) ==========
    function updateNavBadges() {
        const reports = Storage.getReports();
        const lostCount = reports.filter(r => r.type === 'lost').length;
        const foundCount = reports.filter(r => r.type === 'found').length;
        
        const lostBadge = document.getElementById('lostBadge');
        const foundBadge = document.getElementById('foundBadge');
        
        if (lostBadge) {
            lostBadge.textContent = lostCount > 9 ? '9+' : lostCount;
            lostBadge.style.display = lostCount > 0 ? 'inline-flex' : 'none';
        }
        if (foundBadge) {
            foundBadge.textContent = foundCount > 9 ? '9+' : foundCount;
            foundBadge.style.display = foundCount > 0 ? 'inline-flex' : 'none';
        }
    }
    
    // ========== SETUP ADMIN CONTROLS - FIXED ==========
    function setupAdminControls() {
        // Get fresh user from storage to ensure we have latest role
        const freshUser = Storage.getCurrentUser();
        const isAdmin = freshUser?.role === 'admin';
        
        console.log('Setting up admin controls. Is Admin?', isAdmin, 'User:', freshUser);
        
        // Show/hide admin control bar on current page
        const adminBar = document.getElementById('adminControlBar');
        if (adminBar) {
            adminBar.style.display = isAdmin ? 'flex' : 'none';
            console.log('Admin bar display set to:', isAdmin ? 'flex' : 'none');
        }
        
        // Also show/hide any admin-specific elements on item cards
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });
        
        // Update sidebar to show admin-specific nav items if any
        const adminNavItems = document.querySelectorAll('.nav-item.admin-nav');
        adminNavItems.forEach(el => {
            el.style.display = isAdmin ? 'flex' : 'none';
        });
        
        return isAdmin;
    }
    
    // ========== SETUP RECENTLY VIEWED ==========
    function setupRecentlyViewed() {
        const container = document.getElementById('recentlyViewedRow');
        if (!container) return;
        
        const recentIds = Storage.getRecentViews();
        const reports = Storage.getReports();
        const recentItems = recentIds.map(id => reports.find(r => r.id === id)).filter(Boolean).slice(0, 4);
        
        if (!recentItems.length) {
            container.innerHTML = '<p style="color:#64748b;">No recently viewed items</p>';
            return;
        }
        
        container.innerHTML = recentItems.map(item => `
            <a class="recent-mini-card" href="item-detail.html?id=${encodeURIComponent(item.id)}" style="display:block; background:white; border-radius:12px; overflow:hidden; text-decoration:none; color:inherit; border:1px solid #e2e8f0;">
                <img src="${item.image || getCategoryImage(item.category)}" style="width:100%; height:100px; object-fit:cover;">
                <div style="padding:8px; font-size:12px; font-weight:600; text-align:center;">${escapeHtml(item.name)}</div>
            </a>
        `).join('');
    }
    
    // ========== STUDENT DASHBOARD ==========
    function initStudentDashboard() {
        console.log('Initializing Student Dashboard');
        loadStudentStats();
        loadRecentActivity();
        loadCampusStats();
        // Ensure admin bar is hidden on student dashboard
        const adminBar = document.getElementById('adminControlBar');
        if (adminBar) adminBar.style.display = 'none';
    }
    
    function loadStudentStats() {
        const reports = Storage.getReportsByUser(currentUser.collegeId);
        const activeReports = reports.filter(r => r.status !== 'collected' && r.status !== 'Recovered').length;
        const recovered = reports.filter(r => r.status === 'collected' || r.status === 'Recovered').length;
        const successRate = reports.length > 0 ? Math.round((recovered / reports.length) * 100) : 0;
        
        updateStatElement('userActiveReports', activeReports);
        updateStatElement('userRecoveredItems', recovered);
        updateStatElement('userSuccessRate', successRate, '%');
    }
    
    function loadCampusStats() {
        const reports = Storage.getReports();
        const lostItems = reports.filter(r => r.type === 'lost').length;
        const foundItems = reports.filter(r => r.type === 'found').length;
        const pendingMatch = reports.filter(r => r.status === 'pending').length;
        const recovered = reports.filter(r => r.status === 'collected' || r.status === 'Recovered').length;
        
        updateStatElement('statCampusLost', lostItems);
        updateStatElement('statCampusFound', foundItems);
        updateStatElement('campusTotalLost', lostItems);
        updateStatElement('campusTotalFound', foundItems);
        updateStatElement('campusPendingMatch', pendingMatch);
        updateStatElement('campusTotalRecovered', recovered);
    }
    
    function loadRecentActivity() {
        const reports = Storage.getReportsByUser(currentUser.collegeId);
        const recent = reports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt)).slice(0, 5);
        
        const tableBody = document.getElementById('studentActivityTable');
        if (!tableBody) return;
        
        if (!recent.length) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px;">No activity yet. <a href="report.html">Report an item</a></td></tr>`;
            return;
        }
        
        tableBody.innerHTML = recent.map(item => `
            <tr data-item-id="${escapeHtml(item.id)}" class="activity-row" style="cursor:pointer;">
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td>${escapeHtml(item.type)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${escapeHtml(item.location)}</td>
                <td><span class="status-badge ${getStatusClass(item.status)}">${getStatusDisplay(item.status)}</span></td>
            </tr>
        `).join('');
        
        document.querySelectorAll('.activity-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-item-id');
                if (id) window.location.href = `item-detail.html?id=${encodeURIComponent(id)}`;
            });
        });
    }
    
    // ========== ADMIN DASHBOARD ==========
    function initAdminDashboard() {
        console.log('Initializing Admin Dashboard');
        loadAdminStats();
        loadAdminTable();
        loadAdminActivity();
        setupAdminActions();
        // Ensure admin bar is visible on admin dashboard
        const adminBar = document.getElementById('adminControlBar');
        if (adminBar) adminBar.style.display = 'flex';
    }
    
    function loadAdminStats() {
        const reports = Storage.getReports();
        const activeReports = reports.filter(r => r.status !== 'collected' && r.status !== 'Recovered').length;
        const recovered = reports.filter(r => r.status === 'collected' || r.status === 'Recovered').length;
        const pending = reports.filter(r => r.status === 'pending').length;
        const successRate = reports.length > 0 ? Math.round((recovered / reports.length) * 100) : 0;
        
        updateStatElement('activeReports', activeReports);
        updateStatElement('recoveredItems', recovered);
        updateStatElement('pendingVerification', pending);
        updateStatElement('successRate', successRate, '%');
        
        const users = Storage.getUsers();
        const totalUsers = document.getElementById('totalUsers');
        if (totalUsers) totalUsers.textContent = users.length;
        
        const totalItems = document.getElementById('totalItemsHint');
        if (totalItems) totalItems.textContent = reports.length;
        
        const matchRate = document.getElementById('matchRate');
        if (matchRate) matchRate.textContent = successRate + '%';
    }
    
    function loadAdminTable() {
        const tbody = document.getElementById('adminItemsTableBody');
        if (!tbody) return;
        
        const reports = Storage.getReports();
        
        tbody.innerHTML = reports.map(item => `
            <tr data-item-id="${escapeHtml(item.id)}">
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td>${escapeHtml(item.type)}</td>
                <td>${escapeHtml(item.category)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${escapeHtml(item.location)}</td>
                <td>
                    <select class="status-select" data-id="${escapeHtml(item.id)}" style="padding:4px 8px; border-radius:20px;">
                        <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Under Review</option>
                        <option value="verified" ${item.status === 'verified' ? 'selected' : ''}>Verified</option>
                        <option value="ready" ${item.status === 'ready' ? 'selected' : ''}>Ready for Pickup</option>
                        <option value="matched" ${item.status === 'matched' ? 'selected' : ''}>Matched</option>
                        <option value="collected" ${item.status === 'collected' ? 'selected' : ''}>Recovered</option>
                    </select>
                </td>
                <td>${escapeHtml(item.reporterId || '')}</td>
                <td>
                    <button class="btn-sm-admin-delete" data-id="${escapeHtml(item.id)}" style="padding:4px 8px; background:#fee2e2; color:#dc2626; border:none; border-radius:20px; cursor:pointer;">Delete</button>
                    ${item.phone ? `<button class="btn-sm-admin-call" data-phone="${escapeHtml(item.phone)}" style="padding:4px 8px; background:#dbeafe; color:#2563eb; border:none; border-radius:20px; cursor:pointer;">Call</button>` : ''}
                </td>
            </tr>
        `).join('');
        
        tbody.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const id = select.getAttribute('data-id');
                const newStatus = select.value;
                Storage.updateReport(id, { status: newStatus });
                loadAdminTable();
                loadAdminStats();
                showToast(`Status updated to ${getStatusDisplay(newStatus)}`, 'success');
            });
        });
        
        tbody.querySelectorAll('.btn-sm-admin-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                if (confirm('Delete this item?')) {
                    Storage.deleteReport(id);
                    loadAdminTable();
                    loadAdminStats();
                    showToast('Item deleted', 'success');
                }
            });
        });
        
        tbody.querySelectorAll('.btn-sm-admin-call').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const phone = btn.getAttribute('data-phone');
                if (phone) window.location.href = `tel:${phone}`;
            });
        });
        
        tbody.querySelectorAll('tr').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
                const id = row.getAttribute('data-item-id');
                if (id) window.location.href = `item-detail.html?id=${encodeURIComponent(id)}`;
            });
        });
    }
    
    function loadAdminActivity() {
        const reports = Storage.getReports();
        const recent = reports.slice(0, 10);
        const tableBody = document.getElementById('adminActivityTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = recent.map(item => `
            <tr data-item-id="${escapeHtml(item.id)}" class="activity-row" style="cursor:pointer;">
                <td><strong>${escapeHtml(item.name)}</strong></td>
                <td>${escapeHtml(item.type)}</td>
                <td>${formatDate(item.date)}</td>
                <td>${escapeHtml(item.location)}</td>
                <td><span class="status-badge ${getStatusClass(item.status)}">${getStatusDisplay(item.status)}</span></td>
                <td>${escapeHtml(item.reporterId || '')}</td>
            </tr>
        `).join('');
        
        document.querySelectorAll('.activity-row').forEach(row => {
            row.addEventListener('click', () => {
                const id = row.getAttribute('data-item-id');
                if (id) window.location.href = `item-detail.html?id=${encodeURIComponent(id)}`;
            });
        });
    }
    
    function setupAdminActions() {
        const exportBtn = document.getElementById('exportCsvBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => exportData());
        }
        
        const clearBtn = document.getElementById('adminBarClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                if (confirm('Delete ALL reports? This cannot be undone.')) {
                    Storage.saveReports([]);
                    location.reload();
                }
            });
        }
        
        const viewAllBtn = document.getElementById('adminBarViewAll');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                window.location.href = 'lost.html';
            });
        }
        
        const statsBtn = document.getElementById('adminBarStats');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => {
                alert(`📊 System Stats:\n\nActive Reports: ${document.getElementById('activeReports')?.textContent || 0}\nRecovered Items: ${document.getElementById('recoveredItems')?.textContent || 0}\nPending Verification: ${document.getElementById('pendingVerification')?.textContent || 0}\nSuccess Rate: ${document.getElementById('successRate')?.textContent || 0}`);
            });
        }
    }
    
    function exportData() {
        const reports = Storage.getReports();
        const exportData = reports.map(r => ({
            ID: r.id, 'Item Name': r.name, Type: r.type, Category: r.category,
            Location: r.location, Date: r.date, Status: getStatusDisplay(r.status),
            'Reported By': r.reporterId, Phone: r.phone, Email: r.email
        }));
        downloadCSV(exportData, 'find-er-reports');
        showToast('Export complete', 'success');
    }
    
    // ========== LOST/FOUND PAGES ==========
    function initLostPage() {
        loadItemsPage('lost');
    }
    
    function initFoundPage() {
        loadItemsPage('found');
    }
    
    function loadItemsPage(type) {
        const reports = Storage.getReportsByType(type);
        const container = document.getElementById('itemsGrid');
        if (!container) return;
        
        if (!reports.length) {
            container.innerHTML = `<div class="empty-state" style="text-align:center; padding:60px;"><div class="empty-icon">📭</div><h3>No ${type} items found</h3><a href="report.html" class="btn btn-primary">Report Item</a></div>`;
            return;
        }
        
        container.innerHTML = reports.map(item => `
            <div class="item-card" data-item-id="${item.id}" style="cursor:pointer; background:white; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:16px;">
                <div style="padding:16px;">
                    <span style="display:inline-block; padding:4px 10px; background:#eef2ff; border-radius:20px; font-size:11px;">${escapeHtml(item.category)}</span>
                    <h3 style="margin:10px 0 5px;">${escapeHtml(item.name)}</h3>
                    <div style="font-size:12px; color:#64748b;">📍 ${escapeHtml(item.location)}</div>
                    <div style="font-size:12px; color:#64748b;">📅 ${formatDate(item.date)}</div>
                    <div style="margin-top:10px;"><span class="status-badge ${getStatusClass(item.status)}">${getStatusDisplay(item.status)}</span></div>
                    <div style="margin-top:10px;"><a href="item-detail.html?id=${item.id}" class="btn btn-outline btn-sm">View Details</a></div>
                </div>
            </div>
        `).join('');
        
        container.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('a')) return;
                const id = card.getAttribute('data-item-id');
                if (id) window.location.href = `item-detail.html?id=${encodeURIComponent(id)}`;
            });
        });
        
        updateItemStats(type, reports);
        setupFilters(type, reports);
    }
    
    function updateItemStats(type, items) {
        if (type === 'lost') {
            const total = items.length;
            const underReview = items.filter(i => i.status === 'pending').length;
            const recovered = items.filter(i => i.status === 'collected' || i.status === 'Recovered').length;
            updateStatElement('totalLost', total);
            updateStatElement('underReview', underReview);
            updateStatElement('recovered', recovered);
        } else {
            const total = items.length;
            const ready = items.filter(i => i.status === 'ready').length;
            const verified = items.filter(i => i.status === 'verified').length;
            updateStatElement('totalFound', total);
            updateStatElement('readyPickup', ready);
            updateStatElement('verified', verified);
        }
    }
    
    function setupFilters(type, items) {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        function applyFilters() {
            const searchTerm = searchInput?.value.toLowerCase() || '';
            const category = categoryFilter?.value || 'all';
            let filtered = items.filter(item => {
                const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm) || item.location.toLowerCase().includes(searchTerm);
                const matchesCategory = category === 'all' || item.category === category;
                return matchesSearch && matchesCategory;
            });
            const container = document.getElementById('itemsGrid');
            if (container) {
                if (!filtered.length) {
                    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No matching items</h3></div>';
                } else {
                    container.innerHTML = filtered.map(item => `
                        <div class="item-card" data-item-id="${item.id}" style="cursor:pointer; background:white; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0; margin-bottom:16px;">
                            <div style="padding:16px;">
                                <span style="display:inline-block; padding:4px 10px; background:#eef2ff; border-radius:20px; font-size:11px;">${escapeHtml(item.category)}</span>
                                <h3 style="margin:10px 0 5px;">${escapeHtml(item.name)}</h3>
                                <div style="font-size:12px; color:#64748b;">📍 ${escapeHtml(item.location)}</div>
                                <div style="font-size:12px; color:#64748b;">📅 ${formatDate(item.date)}</div>
                                <div style="margin-top:10px;"><span class="status-badge ${getStatusClass(item.status)}">${getStatusDisplay(item.status)}</span></div>
                                <div style="margin-top:10px;"><a href="item-detail.html?id=${item.id}" class="btn btn-outline btn-sm">View Details</a></div>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }
        
        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    }
    
    // ========== PROFILE PAGE ==========
    function initProfilePage() {
        if (!currentUser) return;
        
        const userReports = Storage.getReportsByUser(currentUser.collegeId);
        const recovered = userReports.filter(r => r.status === 'collected' || r.status === 'Recovered').length;
        const successRate = userReports.length > 0 ? Math.round((recovered / userReports.length) * 100) : 0;
        
        updateStatElement('profileTotalReports', userReports.length);
        updateStatElement('profileRecovered', recovered);
        updateStatElement('profileRate', successRate, '%');
        
        const daysActive = Math.floor((new Date() - new Date(currentUser.memberSince || Date.now())) / (1000 * 60 * 60 * 24));
        const daysEl = document.getElementById('profileDays');
        if (daysEl) daysEl.textContent = daysActive || 1;
        
        const reportsTable = document.getElementById('userReportsTable');
        if (reportsTable) {
            if (!userReports.length) {
                reportsTable.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px;">No reports yet. <a href="report.html">Report an item</a></td></tr>`;
            } else {
                reportsTable.innerHTML = userReports.map(r => `
                    <tr>
                        <td style="padding:12px;"><strong>${escapeHtml(r.name)}</strong></td>
                        <td style="padding:12px;">${escapeHtml(r.type)}</td>
                        <td style="padding:12px;"><span class="status-badge ${getStatusClass(r.status)}">${getStatusDisplay(r.status)}</span></td>
                        <td style="padding:12px;">${formatDate(r.date)}</td>
                        <td style="padding:12px;"><a href="item-detail.html?id=${r.id}" class="btn btn-outline btn-sm">View</a></td>
                    </tr>
                `).join('');
            }
        }
        
        setupProfileEditing();
    }
    
    function setupProfileEditing() {
        const saveBtn = document.getElementById('profileSaveBtn');
        const resetBtn = document.getElementById('profileResetBtn');
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        
        if (saveBtn && nameInput && emailInput) {
            saveBtn.addEventListener('click', () => {
                const newName = nameInput.value.trim();
                const newEmail = emailInput.value.trim();
                if (!newName) {
                    alert('Please enter your name');
                    return;
                }
                const updated = Storage.updateUser(currentUser.collegeId, { name: newName, email: newEmail });
                if (updated) {
                    Storage.setCurrentUser(updated);
                    currentUser = updated;
                    updateAllUserInfo();
                    alert('Profile updated successfully');
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                nameInput.value = currentUser.name || '';
                emailInput.value = currentUser.email || '';
                document.getElementById('profileCurrentPassword').value = '';
                document.getElementById('profileNewPassword').value = '';
                document.getElementById('profileConfirmPassword').value = '';
                alert('Form reset');
            });
        }
        
        const changePasswordBtn = document.getElementById('profileChangePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', async () => {
                const currentPwd = document.getElementById('profileCurrentPassword')?.value;
                const newPwd = document.getElementById('profileNewPassword')?.value;
                const confirmPwd = document.getElementById('profileConfirmPassword')?.value;
                
                if (!currentPwd || !newPwd) {
                    alert('Please fill in all password fields');
                    return;
                }
                if (newPwd !== confirmPwd) {
                    alert('New passwords do not match');
                    return;
                }
                if (newPwd.length < 6) {
                    alert('Password must be at least 6 characters');
                    return;
                }
                
                const currentHash = await hashPasswordHelper(currentPwd);
                if (currentHash !== currentUser.passwordHash) {
                    alert('Current password is incorrect');
                    return;
                }
                
                const newHash = await hashPasswordHelper(newPwd);
                Storage.updateUser(currentUser.collegeId, { passwordHash: newHash });
                alert('Password changed successfully');
                
                document.getElementById('profileCurrentPassword').value = '';
                document.getElementById('profileNewPassword').value = '';
                document.getElementById('profileConfirmPassword').value = '';
            });
        }
    }
    
    // ========== NOTIFICATIONS PAGE ==========
    function initNotificationsPage() {
        const container = document.getElementById('notificationsList');
        if (!container) return;
        
        let filter = 'all';
        
        function render() {
            let notifications = Storage.getUserNotifications(currentUser.collegeId);
            notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            let filtered = notifications;
            if (filter === 'unread') filtered = notifications.filter(n => !n.read);
            if (filter === 'read') filtered = notifications.filter(n => n.read);
            
            if (!filtered.length) {
                container.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><h3>All caught up!</h3><p>No notifications in this view.</p></div>`;
                return;
            }
            
            container.innerHTML = filtered.map(notif => `
                <div class="notif-item ${!notif.read ? 'unread' : ''}" data-id="${notif.id}" style="display:flex; gap:12px; padding:16px; border-bottom:1px solid #e2e8f0; cursor:pointer;">
                    <div style="width:40px; height:40px; background:#eef2ff; border-radius:50%; display:flex; align-items:center; justify-content:center;">🔔</div>
                    <div style="flex:1;">
                        <strong>${escapeHtml(notif.message)}</strong>
                        <p style="font-size:11px; color:#64748b; margin-top:4px;">${timeAgo(notif.createdAt)}</p>
                    </div>
                    ${!notif.read ? '<div style="width:8px; height:8px; background:#2f7fa2; border-radius:50%;"></div>' : ''}
                </div>
            `).join('');
        }
        
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.notif-item');
            if (!item) return;
            const id = item.getAttribute('data-id');
            const notifications = Storage.getUserNotifications(currentUser.collegeId);
            const notif = notifications.find(n => n.id === id);
            if (notif && !notif.read) {
                Storage.markNotificationRead(currentUser.collegeId, id);
                render();
                updateNotifBadges();
            }
            if (notif && notif.itemId) {
                window.location.href = `item-detail.html?id=${notif.itemId}`;
            }
        });
        
        document.getElementById('notifTabAll')?.addEventListener('click', () => { filter = 'all'; render(); });
        document.getElementById('notifTabUnread')?.addEventListener('click', () => { filter = 'unread'; render(); });
        document.getElementById('notifTabRead')?.addEventListener('click', () => { filter = 'read'; render(); });
        document.getElementById('markAllReadBtn')?.addEventListener('click', () => {
            Storage.markAllNotificationsRead(currentUser.collegeId);
            render();
            updateNotifBadges();
        });
        document.getElementById('clearReadBtn')?.addEventListener('click', () => {
            const notifications = Storage.getUserNotifications(currentUser.collegeId);
            Storage.setUserNotifications(currentUser.collegeId, notifications.filter(n => !n.read));
            render();
            updateNotifBadges();
        });
        
        render();
    }
    
    function updateNotifBadges() {
        if (!currentUser) return;
        const unreadCount = Storage.getUnreadCount(currentUser.collegeId);
        document.querySelectorAll('.notification-badge, #sidebarNotifBadge, #headerNotifBadge').forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    // ========== ITEM DETAIL PAGE ==========
    function initItemDetailPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');
        
        if (!itemId) {
            window.location.href = 'lost.html';
            return;
        }
        
        const reports = Storage.getReports();
        const item = reports.find(r => r.id === itemId);
        
        if (!item) {
            document.getElementById('itemDetailDescription').innerHTML = 'Item not found';
            return;
        }
        
        Storage.addRecentView(itemId);
        
        // Set title
        const titleEl = document.getElementById('itemDetailTitle');
        if (titleEl) titleEl.textContent = item.name;
        
        // Set image
        const imageWrap = document.getElementById('itemDetailImageWrap');
        if (imageWrap) {
            imageWrap.innerHTML = `<img src="${item.image || getCategoryImage(item.category)}" alt="${escapeHtml(item.name)}" style="width:100%; height:100%; object-fit:cover; border-radius:16px;">`;
        }
        
        // Set info grid
        const infoGrid = document.getElementById('itemDetailInfoGrid');
        if (infoGrid) {
            infoGrid.innerHTML = `
                <div><strong>Category:</strong> ${escapeHtml(item.category)}</div>
                <div><strong>Type:</strong> ${item.type === 'lost' ? 'Lost' : 'Found'}</div>
                <div><strong>Location:</strong> ${escapeHtml(item.location)}</div>
                <div><strong>Date:</strong> ${formatDate(item.date)}</div>
                <div><strong>Status:</strong> <span class="status-badge ${getStatusClass(item.status)}">${getStatusDisplay(item.status)}</span></div>
                <div><strong>Reported By:</strong> ${escapeHtml(item.reporterId || '')}</div>
                ${item.phone ? `<div><strong>Contact:</strong> ${escapeHtml(item.phone)}</div>` : ''}
            `;
        }
        
        // Set description
        const descEl = document.getElementById('itemDetailDescription');
        if (descEl) descEl.textContent = item.description || 'No description provided.';
        
        // Set timeline
        const timeline = document.getElementById('itemDetailTimeline');
        if (timeline) {
            const statuses = ['pending', 'verified', 'matched', 'ready', 'collected'];
            const labels = ['Reported', 'Verified', 'Matched', 'Ready', 'Recovered'];
            const currentStatusIndex = statuses.indexOf(item.status);
            timeline.innerHTML = labels.map((label, i) => `
                <div class="tl-step ${i <= currentStatusIndex ? 'done' : ''}" style="flex:1; text-align:center;">
                    <div class="tl-circle" style="width:28px; height:28px; border-radius:50%; margin:0 auto 6px; display:flex; align-items:center; justify-content:center; ${i <= currentStatusIndex ? 'background:#2f7fa2; color:white;' : 'background:#f1f5f9; border:1px solid #e2e8f0;'}">${i + 1}</div>
                    <div class="tl-label" style="font-size:10px;">${label}</div>
                </div>
                ${i < labels.length - 1 ? '<div class="tl-line" style="flex:1; height:2px; background:#e2e8f0; margin-bottom:18px;"></div>' : ''}
            `).join('');
        }
        
        // Claim button for students
        const canClaim = currentUser.role !== 'admin' && (item.status === 'ready' || item.status === 'matched');
        const claimBtn = document.getElementById('itemClaimBtn');
        if (claimBtn) {
            claimBtn.style.display = canClaim ? 'inline-flex' : 'none';
            if (canClaim) {
                claimBtn.addEventListener('click', () => {
                    alert('Please visit the Lost & Found office (Admin Block, Room 205) with your College ID to claim this item.');
                });
            }
        }
        
        // Back button
        const backBtn = document.getElementById('itemBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (document.referrer && document.referrer.includes(window.location.host)) {
                    history.back();
                } else {
                    window.location.href = item.type === 'lost' ? 'lost.html' : 'found.html';
                }
            });
        }
        
        // Share button
        const shareBtn = document.getElementById('itemShareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', async () => {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard');
            });
        }
        
        // Print button
        const printBtn = document.getElementById('itemPrintBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }
        
        // Show admin controls on item detail if user is admin
        const isAdmin = currentUser?.role === 'admin';
        const adminControls = document.getElementById('itemDetailAdminControls');
        if (adminControls && isAdmin) {
            adminControls.style.display = 'block';
            adminControls.innerHTML = `
                <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-top: 16px;">
                    <h4 style="font-weight: 700; margin-bottom: 10px;">🔧 Admin Controls</h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button id="adminMarkVerified" class="btn btn-sm" style="background: #2563eb; color: white;">✓ Mark Verified</button>
                        <button id="adminMarkReady" class="btn btn-sm" style="background: #16a34a; color: white;">📦 Mark Ready for Pickup</button>
                        <button id="adminMarkMatched" class="btn btn-sm" style="background: #9333ea; color: white;">🔄 Mark Matched</button>
                        <button id="adminMarkCollected" class="btn btn-sm" style="background: #10b981; color: white;">✅ Mark Recovered</button>
                        <button id="adminDeleteItem" class="btn btn-sm" style="background: #dc2626; color: white;">🗑️ Delete Item</button>
                    </div>
                </div>
            `;
            
            document.getElementById('adminMarkVerified')?.addEventListener('click', () => updateStatus(item.id, 'verified'));
            document.getElementById('adminMarkReady')?.addEventListener('click', () => updateStatus(item.id, 'ready'));
            document.getElementById('adminMarkMatched')?.addEventListener('click', () => updateStatus(item.id, 'matched'));
            document.getElementById('adminMarkCollected')?.addEventListener('click', () => updateStatus(item.id, 'collected'));
            document.getElementById('adminDeleteItem')?.addEventListener('click', () => {
                if (confirm('Delete this item permanently?')) {
                    Storage.deleteReport(item.id);
                    alert('Item deleted');
                    window.location.href = 'lost.html';
                }
            });
        }
        
        function updateStatus(itemId, newStatus) {
            Storage.updateReport(itemId, { status: newStatus });
            alert(`Status updated to ${getStatusDisplay(newStatus)}`);
            location.reload();
        }
    }
    
    // ========== HELPER FUNCTIONS ==========
    function updateStatElement(id, value, suffix = '') {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = value + suffix;
        }
    }
    
    function showToast(message, type) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:${type === 'success' ? '#10b981' : '#ef4444'}; color:white; padding:12px 20px; border-radius:8px; z-index:9999;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString();
        } catch(e) {
            return dateStr;
        }
    }
    
    function timeAgo(dateStr) {
        try {
            const d = new Date(dateStr);
            const diff = Math.floor((Date.now() - d) / 60000);
            if (diff < 1) return 'just now';
            if (diff < 60) return diff + 'm ago';
            if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
            return Math.floor(diff / 1440) + 'd ago';
        } catch(e) {
            return '';
        }
    }
    
    function getStatusDisplay(status) {
        const map = { pending: 'Under Review', verified: 'Verified', ready: 'Ready for Pickup', matched: 'Matched', collected: 'Recovered' };
        return map[status] || status || 'Pending';
    }
    
    function getStatusClass(status) {
        const s = (status || '').toLowerCase();
        if (s === 'pending') return 'status-pending';
        if (s === 'verified') return 'status-verified';
        if (s === 'ready') return 'status-ready';
        if (s === 'matched') return 'status-matched';
        if (s === 'collected') return 'status-collected';
        return 'status-pending';
    }
    
    function getCategoryImage(category) {
        const cat = (category || '').toLowerCase();
        if (cat.includes('id')) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400';
        if (cat.includes('phone') || cat.includes('electronic')) return 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400';
        if (cat.includes('book')) return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400';
        if (cat.includes('bag')) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400';
        if (cat.includes('key')) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
        if (cat.includes('watch') || cat.includes('access')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
        if (cat.includes('water')) return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400';
        return 'https://images.unsplash.com/photo-1586769852044-692d6e3703f2?w=400';
    }
    
    function downloadCSV(data, filename) {
        if (!data.length) return;
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        for (const row of data) {
            const values = headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`);
            csvRows.push(values.join(','));
        }
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    return { init };
})();

window.FindERDashboard = Dashboard;

function setupAllComponents() {
    updateSidebarAvatar();
    updateHeaderUserInfo();
    setupProfileDropdownFixed();
    setupGlobalSearch();
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupAllComponents, 100);
});

/**
 * RE-INITIALIZE LUCDIE ICONS
 * Call this after any dynamic content loads
 */
function initLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        setTimeout(function() {
            window.lucide.createIcons();
            console.log('Lucide icons re-initialized');
        }, 100);
    }
}

// Call this after sidebar and top-header are loaded
function initAllIcons() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLucideIcons);
    } else {
        initLucideIcons();
    }
    setTimeout(initLucideIcons, 200);
    setTimeout(initLucideIcons, 500);
}

window.refreshIcons = initLucideIcons;