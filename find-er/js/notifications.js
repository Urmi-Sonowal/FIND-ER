/**
 * FIND-ER Notifications Module
 * Handles all notification-related functionality
 */

const Notifications = (function() {
    
    let currentUser = null;
    let notificationPanel = null;
    let updateInterval = null;
    
    function init() {
        currentUser = Storage.getCurrentUser();
        if (!currentUser) return;
        
        setupNotificationBell();
        setupNotificationPanel();
        startAutoRefresh();
    }
    
    function setupNotificationBell() {
        const bell = document.querySelector('.header-notifications');
        if (!bell) return;
        
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationPanel();
        });
        
        // Update badge periodically
        updateNotificationBadge();
    }
    
    function setupNotificationPanel() {
        // Create panel if not exists
        if (!document.getElementById('notificationPanel')) {
            notificationPanel = document.createElement('div');
            notificationPanel.id = 'notificationPanel';
            notificationPanel.className = 'notification-panel';
            notificationPanel.innerHTML = `
                <div class="notification-panel-header">
                    <h3>Notifications</h3>
                    <button id="closeNotifPanel" class="close-panel">×</button>
                </div>
                <div class="notification-panel-list" id="notificationList">
                    <div class="empty-notifications">
                        <div class="emoji">🔔</div>
                        <p>No notifications</p>
                    </div>
                </div>
                <div class="notification-panel-footer">
                    <a href="notifications.html">View all notifications →</a>
                </div>
            `;
            document.body.appendChild(notificationPanel);
            
            document.getElementById('closeNotifPanel')?.addEventListener('click', () => {
                closeNotificationPanel();
            });
            
            document.addEventListener('click', (e) => {
                if (notificationPanel.classList.contains('open') && 
                    !notificationPanel.contains(e.target) && 
                    !e.target.closest('.header-notifications')) {
                    closeNotificationPanel();
                }
            });
        } else {
            notificationPanel = document.getElementById('notificationPanel');
        }
    }
    
    function toggleNotificationPanel() {
        if (notificationPanel.classList.contains('open')) {
            closeNotificationPanel();
        } else {
            openNotificationPanel();
        }
    }
    
    function openNotificationPanel() {
        if (!notificationPanel) return;
        loadNotificationsIntoPanel();
        notificationPanel.classList.add('open');
    }
    
    function closeNotificationPanel() {
        if (notificationPanel) {
            notificationPanel.classList.remove('open');
        }
    }
    
    function loadNotificationsIntoPanel() {
        const listContainer = document.getElementById('notificationList');
        if (!listContainer) return;
        
        let notifications = Storage.getUserNotifications(currentUser.collegeId);
        notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const unreadCount = Storage.getUnreadCount(currentUser.collegeId);
        
        if (!notifications.length) {
            listContainer.innerHTML = `
                <div class="empty-notifications">
                    <div class="emoji">🔔</div>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }
        
        const recentNotifs = notifications.slice(0, 5);
        listContainer.innerHTML = recentNotifs.map(notif => `
            <div class="notif-item ${!notif.read ? 'unread' : ''}" data-id="${Helpers.escapeHtml(notif.id)}">
                <div class="notif-icon-wrap ${getNotificationIconClass(notif.type)}">
                    <i data-lucide="${getNotificationIcon(notif.type)}"></i>
                </div>
                <div class="notif-body">
                    <strong>${Helpers.escapeHtml(notif.message)}</strong>
                    <p>${Helpers.timeAgo(notif.createdAt)}</p>
                </div>
                <div class="notif-actions">
                    ${!notif.read ? '<span class="notif-dot"></span>' : ''}
                    <a href="item-detail.html?id=${encodeURIComponent(notif.itemId || '')}">View</a>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        listContainer.querySelectorAll('.notif-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.closest('a')) return;
                const id = item.getAttribute('data-id');
                await markAsRead(id);
                const notif = notifications.find(n => n.id === id);
                if (notif && notif.itemId) {
                    window.location.href = `item-detail.html?id=${encodeURIComponent(notif.itemId)}`;
                }
            });
        });
        
        if (window.lucide) window.lucide.createIcons();
    }
    
    function getNotificationIcon(type) {
        switch(type) {
            case 'match': return 'check-circle';
            case 'alert': return 'alert-circle';
            case 'status': return 'bell';
            default: return 'bell';
        }
    }
    
    function getNotificationIconClass(type) {
        switch(type) {
            case 'match': return 'type-match';
            case 'alert': return 'type-alert';
            case 'status': return 'type-status';
            default: return '';
        }
    }
    
    async function markAsRead(notificationId) {
        Storage.markNotificationRead(currentUser.collegeId, notificationId);
        updateNotificationBadge();
        loadNotificationsIntoPanel();
    }
    
    function updateNotificationBadge() {
        const unreadCount = Storage.getUnreadCount(currentUser.collegeId);
        const badges = document.querySelectorAll('.notification-badge, #sidebarNotifBadge');
        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    function startAutoRefresh() {
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(() => {
            if (notificationPanel && notificationPanel.classList.contains('open')) {
                loadNotificationsIntoPanel();
            }
            updateNotificationBadge();
        }, 30000);
    }
    
    function stopAutoRefresh() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
    }
    
    function addNotification(message, type, itemId) {
        if (!currentUser) return;
        Storage.addNotification(currentUser.collegeId, {
            message: message,
            type: type || 'status',
            itemId: itemId || null
        });
        updateNotificationBadge();
        
        // Show toast for real-time notification
        if (document.visibilityState === 'visible') {
            Helpers.showToast(message, 'info', 4000);
        }
    }
    
    function markAllAsRead() {
        Storage.markAllNotificationsRead(currentUser.collegeId);
        updateNotificationBadge();
        if (notificationPanel && notificationPanel.classList.contains('open')) {
            loadNotificationsIntoPanel();
        }
    }
    
    function clearReadNotifications() {
        const notifications = Storage.getUserNotifications(currentUser.collegeId);
        const unreadOnly = notifications.filter(n => !n.read);
        Storage.setUserNotifications(currentUser.collegeId, unreadOnly);
        updateNotificationBadge();
        if (notificationPanel && notificationPanel.classList.contains('open')) {
            loadNotificationsIntoPanel();
        }
    }
    
    // Public API
    return {
        init,
        addNotification,
        markAllAsRead,
        clearReadNotifications,
        updateBadge: updateNotificationBadge,
        stopAutoRefresh
    };
})();

window.TraceItNotifications = Notifications;