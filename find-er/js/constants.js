/**
 * FIND-ER Constants
 * Centralized constants for the application
 */

const Constants = {
    // App Info
    APP_NAME: 'TraceIt',
    APP_VERSION: '1.0.0',
    
    // Admin credentials (hashed)
    ADMIN_CREDENTIALS: {
        collegeId: 'admin',
        passwordHash: 'b2d4c8f1a9e3d7c5b0f2e6a4d8c2b6f0e4a8d2c6b0f4e8a2d6c0b4f8e2a6d4c8'
    },
    
    // Item categories
    CATEGORIES: [
        'ID Card',
        'Electronics',
        'Books',
        'Accessories',
        'Keys',
        'Bag',
        'Water Bottle',
        'Card',
        'Wallet',
        'Other'
    ],
    
    // Status values
    STATUSES: {
        PENDING: 'pending',
        VERIFIED: 'verified',
        READY: 'ready',
        MATCHED: 'matched',
        COLLECTED: 'collected'
    },
    
    // Status display names
    STATUS_DISPLAY: {
        pending: 'Under Review',
        verified: 'Verified',
        ready: 'Ready for Pickup',
        matched: 'Matched',
        collected: 'Recovered'
    },
    
    // Report types
    REPORT_TYPES: {
        LOST: 'lost',
        FOUND: 'found'
    },
    
    // User roles
    ROLES: {
        STUDENT: 'student',
        ADMIN: 'admin'
    },
    
    // Storage keys
    STORAGE_KEYS: {
        USERS: 'TraceIt_users',
        REPORTS: 'TraceIt_reports',
        NOTIFICATIONS: 'TraceIt_notifications',
        CONTACT_MESSAGES: 'TraceIt_contactMessages',
        THEME: 'TraceIt_theme',
        RECENT_VIEWS: 'TraceIt_recentViews',
        ONBOARDED: 'TraceIt_onboarded',
        DRAFT: 'TraceIt_draft'
    },
    
    // Session keys
    SESSION_KEYS: {
        CURRENT_USER: 'currentUser',
        REGISTER_SUCCESS: 'TraceIt_registerSuccess'
    },
    
    // Category icons
    CATEGORY_ICONS: {
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
    },
    
    // Category images
    CATEGORY_IMAGES: {
        default: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f2?w=400',
        id: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
        water: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
        electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
        books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        keys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        accessories: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        wallet: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400'
    },
    
    // Session timeout (milliseconds)
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
    SESSION_WARNING: 5 * 60 * 1000, // 5 minutes
    
    // Pagination
    ITEMS_PER_PAGE: 12,
    
    // API endpoints (for future backend integration)
    ENDPOINTS: {
        LOGIN: '/api/login',
        REGISTER: '/api/register',
        REPORTS: '/api/reports',
        NOTIFICATIONS: '/api/notifications'
    }
};

// Helper function to get category image
Constants.getCategoryImage = function(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('id') || cat.includes('document')) return this.CATEGORY_IMAGES.id;
    if (cat.includes('water') && cat.includes('bottle')) return this.CATEGORY_IMAGES.water;
    if (cat.includes('electronic') || cat.includes('phone')) return this.CATEGORY_IMAGES.electronics;
    if (cat.includes('book')) return this.CATEGORY_IMAGES.books;
    if (cat.includes('bag') || cat.includes('backpack')) return this.CATEGORY_IMAGES.bag;
    if (cat.includes('key')) return this.CATEGORY_IMAGES.keys;
    if (cat.includes('access') || cat.includes('watch')) return this.CATEGORY_IMAGES.accessories;
    if (cat.includes('wallet')) return this.CATEGORY_IMAGES.wallet;
    return this.CATEGORY_IMAGES.default;
};

// Helper function to get category icon
Constants.getCategoryIcon = function(category) {
    return this.CATEGORY_ICONS[category] || '📦';
};

// Helper function to get status display
Constants.getStatusDisplay = function(status) {
    return this.STATUS_DISPLAY[status] || status || 'Pending';
};

// Helper function to get status class
Constants.getStatusClass = function(status) {
    const s = (status || '').toLowerCase();
    if (s === 'pending') return 'status-pending';
    if (s === 'verified') return 'status-verified';
    if (s === 'ready') return 'status-ready';
    if (s === 'matched') return 'status-matched';
    if (s === 'collected') return 'status-collected';
    return 'status-pending';
};

// Make available globally
window.TraceItConstants = Constants;