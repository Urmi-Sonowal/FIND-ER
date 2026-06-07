/**
 * FIND-ER Centralized Storage Manager
 * All localStorage/sessionStorage operations go through this module
 */

const Storage = (function() {
    // Storage keys
    const KEYS = {
        USERS: 'TraceIt_users',
        REPORTS: 'TraceIt_reports',
        NOTIFICATIONS: 'TraceIt_notifications',
        CONTACT_MESSAGES: 'TraceIt_contactMessages',
        THEME: 'TraceIt_theme',
        RECENT_VIEWS: 'TraceIt_recentViews',
        ONBOARDED: 'TraceIt_onboarded',
        DRAFT: 'TraceIt_draft'
    };

    // Session keys
    const SESSION_KEYS = {
        CURRENT_USER: 'currentUser',
        REGISTER_SUCCESS: 'TraceIt_registerSuccess'
    };

    // Helper: safe JSON parse
    function safeParse(value, fallback = null) {
        if (value === null || value === undefined) return fallback;
        try {
            return JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    }

    // Helper: safe JSON stringify
    function safeStringify(value) {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return '[]';
        }
    }

    // ========== User Management ==========
    function getUsers() {
        return safeParse(localStorage.getItem(KEYS.USERS), []);
    }

    function saveUsers(users) {
        localStorage.setItem(KEYS.USERS, safeStringify(users));
        return true;
    }

    function getUserByCollegeId(collegeId) {
        const users = getUsers();
        return users.find(u => u.collegeId === collegeId) || null;
    }

    function createUser(userData) {
        const users = getUsers();
        const existing = users.find(u => u.collegeId === userData.collegeId);
        if (existing) return null;
        
        const newUser = {
            ...userData,
            id: `u-${Date.now()}`,
            memberSince: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    }

    function updateUser(collegeId, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.collegeId === collegeId);
        if (index === -1) return null;
        
        users[index] = { ...users[index], ...updates };
        saveUsers(users);
        return users[index];
    }

    // ========== Report Management ==========
    function getReports() {
        return safeParse(localStorage.getItem(KEYS.REPORTS), []);
    }

    function saveReports(reports) {
        localStorage.setItem(KEYS.REPORTS, safeStringify(reports));
        return true;
    }

    function addReport(report) {
        const reports = getReports();
        reports.push(report);
        saveReports(reports);
        return report;
    }

    function updateReport(reportId, updates) {
        const reports = getReports();
        const index = reports.findIndex(r => r.id === reportId);
        if (index === -1) return null;
        
        reports[index] = { ...reports[index], ...updates, lastUpdated: new Date().toISOString() };
        saveReports(reports);
        return reports[index];
    }

    function deleteReport(reportId) {
        const reports = getReports();
        const filtered = reports.filter(r => r.id !== reportId);
        saveReports(filtered);
        return true;
    }

    function getReportsByUser(collegeId) {
        const reports = getReports();
        return reports.filter(r => r.reporterId === collegeId || r.collegeId === collegeId);
    }

    function getReportsByType(type) {
        const reports = getReports();
        return reports.filter(r => r.type === type);
    }

    // ========== Notification Management ==========
    function getNotificationsStore() {
        return safeParse(localStorage.getItem(KEYS.NOTIFICATIONS), {});
    }

    function saveNotificationsStore(store) {
        localStorage.setItem(KEYS.NOTIFICATIONS, safeStringify(store));
        return true;
    }

    function getUserNotifications(collegeId) {
        const store = getNotificationsStore();
        return store[collegeId] || [];
    }

    function setUserNotifications(collegeId, notifications) {
        const store = getNotificationsStore();
        store[collegeId] = notifications;
        saveNotificationsStore(store);
        return true;
    }

    function addNotification(collegeId, notification) {
        const notifications = getUserNotifications(collegeId);
        notifications.unshift({
            id: `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...notification,
            createdAt: new Date().toISOString(),
            read: false
        });
        setUserNotifications(collegeId, notifications.slice(0, 100));
        return true;
    }

    function markNotificationRead(collegeId, notificationId) {
        const notifications = getUserNotifications(collegeId);
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications[index].read = true;
            setUserNotifications(collegeId, notifications);
        }
        return true;
    }

    function markAllNotificationsRead(collegeId) {
        const notifications = getUserNotifications(collegeId);
        notifications.forEach(n => n.read = true);
        setUserNotifications(collegeId, notifications);
        return true;
    }

    function getUnreadCount(collegeId) {
        const notifications = getUserNotifications(collegeId);
        return notifications.filter(n => !n.read).length;
    }

    // ========== Contact Messages ==========
    function getContactMessages() {
        return safeParse(localStorage.getItem(KEYS.CONTACT_MESSAGES), []);
    }

    function addContactMessage(message) {
        const messages = getContactMessages();
        messages.push({
            id: `MSG_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            ...message,
            timestamp: new Date().toISOString(),
            status: 'unread'
        });
        localStorage.setItem(KEYS.CONTACT_MESSAGES, safeStringify(messages));
        return true;
    }

    // ========== Session Management ==========
    function getCurrentUser() {
        return safeParse(sessionStorage.getItem(SESSION_KEYS.CURRENT_USER), null);
    }

    function setCurrentUser(user) {
        sessionStorage.setItem(SESSION_KEYS.CURRENT_USER, safeStringify(user));
        return true;
    }

    function clearCurrentUser() {
        sessionStorage.removeItem(SESSION_KEYS.CURRENT_USER);
        return true;
    }

    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    function isAdmin() {
        const user = getCurrentUser();
        return user && user.role === 'admin';
    }

    // ========== Theme Management ==========
    function getTheme() {
        return localStorage.getItem(KEYS.THEME) || 'light';
    }

    function setTheme(theme) {
        localStorage.setItem(KEYS.THEME, theme);
        return true;
    }

    // ========== Recent Views ==========
    function getRecentViews() {
        return safeParse(localStorage.getItem(KEYS.RECENT_VIEWS), []);
    }

    function addRecentView(itemId) {
        let views = getRecentViews();
        views = views.filter(id => id !== itemId);
        views.unshift(itemId);
        views = views.slice(0, 10);
        localStorage.setItem(KEYS.RECENT_VIEWS, safeStringify(views));
        return true;
    }

    // ========== Draft Management ==========
    function getDraft() {
        return safeParse(localStorage.getItem(KEYS.DRAFT), null);
    }

    function saveDraft(draft) {
        localStorage.setItem(KEYS.DRAFT, safeStringify(draft));
        return true;
    }

    function clearDraft() {
        localStorage.removeItem(KEYS.DRAFT);
        return true;
    }

    // ========== Onboarding ==========
    function isOnboarded() {
        return localStorage.getItem(KEYS.ONBOARDED) === 'true';
    }

    function setOnboarded() {
        localStorage.setItem(KEYS.ONBOARDED, 'true');
        return true;
    }

    // ========== Utility ==========
    function clearAllData() {
        localStorage.removeItem(KEYS.REPORTS);
        localStorage.removeItem(KEYS.NOTIFICATIONS);
        localStorage.removeItem(KEYS.CONTACT_MESSAGES);
        localStorage.removeItem(KEYS.RECENT_VIEWS);
        return true;
    }

    // ========== Initialize Default Users ==========
    function initializeDefaultUsers() {
        const users = getUsers();
        if (!users || users.length === 0) {
            const defaultUsers = [
                {
                    id: 'demo_student_1',
                    name: 'Arjun Sharma',
                    collegeId: 'CSE2023001',
                    email: 'arjun.sharma@college.edu',
                    department: 'CSE',
                    year: '3rd Year',
                    role: 'student',
                    passwordHash: '5d41402abc4b2a76b9719d911017c592',
                    memberSince: new Date().toISOString()
                },
                {
                    id: 'demo_student_2',
                    name: 'Priya Verma',
                    collegeId: 'CSE2023002',
                    email: 'priya.verma@college.edu',
                    department: 'CSE',
                    year: '3rd Year',
                    role: 'student',
                    passwordHash: '5d41402abc4b2a76b9719d911017c592',
                    memberSince: new Date().toISOString()
                },
                {
                    id: 'demo_student_3',
                    name: 'Rahul Mehta',
                    collegeId: 'ECE2023001',
                    email: 'rahul.mehta@college.edu',
                    department: 'ECE',
                    year: '2nd Year',
                    role: 'student',
                    passwordHash: '5d41402abc4b2a76b9719d911017c592',
                    memberSince: new Date().toISOString()
                },
                {
                    id: 'demo_student_4',
                    name: 'Neha Singh',
                    collegeId: 'AIDS2023001',
                    email: 'neha.singh@college.edu',
                    department: 'AIDS',
                    year: '3rd Year',
                    role: 'student',
                    passwordHash: '5d41402abc4b2a76b9719d911017c592',
                    memberSince: new Date().toISOString()
                },
                {
                    id: 'demo_student_5',
                    name: 'Vikram Patel',
                    collegeId: 'MECH2023001',
                    email: 'vikram.patel@college.edu',
                    department: 'Mechanical',
                    year: '4th Year',
                    role: 'student',
                    passwordHash: '5d41402abc4b2a76b9719d911017c592',
                    memberSince: new Date().toISOString()
                },
                {
                    id: 'demo_admin_1',
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
            saveUsers(defaultUsers);
            console.log('Default users initialized with 5 students + 1 admin');
        }
    }

    // ========== Initialize Default Reports (12 items) ==========
    function initializeDefaultReports() {
        const reports = getReports();
        if (!reports || reports.length === 0) {
            const defaultReports = [
                // LOST ITEMS (6 items)
                {
                    id: 'LOST001',
                    type: 'lost',
                    name: 'College ID Card',
                    category: 'ID Card',
                    location: 'CSE Block, Room 205',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Student ID Card - Arjun Sharma, CSE Department, 3rd Year. Card has a blue cover with CSE sticker.',
                    status: 'pending',
                    reporterId: 'CSE2023001',
                    reportedBy: { name: 'Arjun Sharma', collegeId: 'CSE2023001' },
                    phone: '9876543210',
                    email: 'arjun.sharma@college.edu',
                    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'LOST002',
                    type: 'lost',
                    name: 'iPhone 14 Pro',
                    category: 'Electronics',
                    location: 'Library, 2nd Floor',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'iPhone 14 Pro - Deep Purple color, black case with a pop socket. Last seen near the study tables.',
                    status: 'verified',
                    reporterId: 'AIDS2023001',
                    reportedBy: { name: 'Neha Singh', collegeId: 'AIDS2023001' },
                    phone: '9876543212',
                    email: 'neha.singh@college.edu',
                    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'LOST003',
                    type: 'lost',
                    name: 'Sony Headphones',
                    category: 'Accessories',
                    location: 'Cafeteria',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Sony WH-1000XM4 headphones, black color, has a small scratch on the left earcup.',
                    status: 'pending',
                    reporterId: 'ECE2023001',
                    reportedBy: { name: 'Rahul Mehta', collegeId: 'ECE2023001' },
                    phone: '9876543213',
                    email: 'rahul.mehta@college.edu',
                    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'LOST004',
                    type: 'lost',
                    name: 'Car Keys',
                    category: 'Keys',
                    location: 'Parking Lot B',
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Hyundai i10 car keys with a leather keychain and a mini flashlight attached.',
                    status: 'matched',
                    reporterId: 'MECH2023001',
                    reportedBy: { name: 'Vikram Patel', collegeId: 'MECH2023001' },
                    phone: '9876543214',
                    email: 'vikram.patel@college.edu',
                    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'LOST005',
                    type: 'lost',
                    name: 'Physics Textbook',
                    category: 'Books',
                    location: 'Physics Lab, Room 304',
                    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'University Physics Volume 2 - hardcover, has handwritten notes on first few pages.',
                    status: 'verified',
                    reporterId: 'CSE2023002',
                    reportedBy: { name: 'Priya Verma', collegeId: 'CSE2023002' },
                    phone: '9876543215',
                    email: 'priya.verma@college.edu',
                    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'LOST006',
                    type: 'lost',
                    name: 'Leather Wallet',
                    category: 'Wallet',
                    location: 'Main Building Corridor',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Brown leather wallet, contains College ID, ATM card, and ₹500 cash.',
                    status: 'pending',
                    reporterId: 'CSE2023001',
                    reportedBy: { name: 'Arjun Sharma', collegeId: 'CSE2023001' },
                    phone: '9876543210',
                    email: 'arjun.sharma@college.edu',
                    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                
                // FOUND ITEMS (6 items)
                {
                    id: 'FOUND001',
                    type: 'found',
                    name: 'Scientific Calculator',
                    category: 'Electronics',
                    location: 'Library, Ground Floor',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Casio FX-991ES scientific calculator. Has a sticker of a cartoon on the back.',
                    status: 'ready',
                    reporterId: 'LIB001',
                    reportedBy: { name: 'Library Staff', collegeId: 'LIB001' },
                    phone: '9876543216',
                    email: 'library@college.edu',
                    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'FOUND002',
                    type: 'found',
                    name: 'Water Bottle',
                    category: 'Water Bottle',
                    location: 'Gymnasium',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Blue Milton water bottle, almost full. Found near the treadmill area.',
                    status: 'verified',
                    reporterId: 'GYM001',
                    reportedBy: { name: 'Gym Staff', collegeId: 'GYM001' },
                    phone: '9876543217',
                    email: 'gym@college.edu',
                    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'FOUND003',
                    type: 'found',
                    name: 'Laptop Charger',
                    category: 'Electronics',
                    location: 'Computer Lab A',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Dell laptop charger, 65W, black color. Has a small crack on the adapter.',
                    status: 'pending',
                    reporterId: 'LAB001',
                    reportedBy: { name: 'Lab Assistant', collegeId: 'LAB001' },
                    phone: '9876543218',
                    email: 'lab@college.edu',
                    reportedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'FOUND004',
                    type: 'found',
                    name: 'Nike Backpack',
                    category: 'Bag',
                    location: 'Cafeteria',
                    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Nike black backpack, has a water bottle on the side pocket. Contains notebooks and a pen.',
                    status: 'ready',
                    reporterId: 'CAFE001',
                    reportedBy: { name: 'Cafeteria Staff', collegeId: 'CAFE001' },
                    phone: '9876543219',
                    email: 'cafe@college.edu',
                    reportedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'FOUND005',
                    type: 'found',
                    name: 'Apple Watch',
                    category: 'Accessories',
                    location: 'Sports Complex',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Apple Watch Series 8, silver color, black strap. Screen has a small scratch.',
                    status: 'verified',
                    reporterId: 'SPORTS001',
                    reportedBy: { name: 'Sports Staff', collegeId: 'SPORTS001' },
                    phone: '9876543220',
                    email: 'sports@college.edu',
                    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 'FOUND006',
                    type: 'found',
                    name: 'Black Umbrella',
                    category: 'Other',
                    location: 'Main Gate',
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    description: 'Black foldable umbrella, slightly torn at one edge.',
                    status: 'pending',
                    reporterId: 'SEC001',
                    reportedBy: { name: 'Security Guard', collegeId: 'SEC001' },
                    phone: '9876543221',
                    email: 'security@college.edu',
                    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            
            saveReports(defaultReports);
            console.log('Default reports initialized with 12 items (6 lost + 6 found)');
        }
    }

    // ========== Initialize Default Notifications ==========
    function initializeDefaultNotifications() {
        const notificationsStore = getNotificationsStore();
        
        if (Object.keys(notificationsStore).length === 0) {
            const defaultNotifications = {
                'CSE2023001': [
                    {
                        id: 'NOTIF001',
                        message: 'Your ID Card report has been submitted and is pending verification.',
                        type: 'status',
                        itemId: 'LOST001',
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    },
                    {
                        id: 'NOTIF002',
                        message: 'Good news! Your Wallet report has been submitted and is pending verification.',
                        type: 'status',
                        itemId: 'LOST006',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    }
                ],
                'AIDS2023001': [
                    {
                        id: 'NOTIF003',
                        message: 'Your iPhone 14 Pro report has been verified! Keep checking for matches.',
                        type: 'status',
                        itemId: 'LOST002',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    }
                ],
                'ECE2023001': [
                    {
                        id: 'NOTIF004',
                        message: 'Your Sony Headphones report has been submitted. We will notify you once verified.',
                        type: 'status',
                        itemId: 'LOST003',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    }
                ],
                'MECH2023001': [
                    {
                        id: 'NOTIF005',
                        message: '🎉 Match found! Your car keys have been matched with a found item. Visit the office to claim.',
                        type: 'match',
                        itemId: 'LOST004',
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    }
                ],
                'CSE2023002': [
                    {
                        id: 'NOTIF006',
                        message: 'Your Physics Textbook report has been verified!',
                        type: 'status',
                        itemId: 'LOST005',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    }
                ],
                'admin': [
                    {
                        id: 'NOTIF007',
                        message: 'New lost item reported: iPhone 14 Pro from Neha Singh',
                        type: 'alert',
                        itemId: 'LOST002',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    },
                    {
                        id: 'NOTIF008',
                        message: 'New found item reported: Scientific Calculator from Library Staff',
                        type: 'alert',
                        itemId: 'FOUND001',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    },
                    {
                        id: 'NOTIF009',
                        message: 'New lost item reported: Leather Wallet from Arjun Sharma',
                        type: 'alert',
                        itemId: 'LOST006',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    },
                    {
                        id: 'NOTIF010',
                        message: 'New found item reported: Apple Watch from Sports Staff',
                        type: 'alert',
                        itemId: 'FOUND005',
                        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    },
                    {
                        id: 'NOTIF011',
                        message: 'New found item reported: Nike Backpack from Cafeteria Staff',
                        type: 'alert',
                        itemId: 'FOUND004',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        read: false
                    }
                ]
            };
            
            for (const [userId, notifications] of Object.entries(defaultNotifications)) {
                notificationsStore[userId] = notifications;
            }
            
            saveNotificationsStore(notificationsStore);
            console.log('Default notifications initialized');
        }
    }

    // ========== Initialize All Default Data ==========
    function init() {
        initializeDefaultUsers();
        initializeDefaultReports();
        initializeDefaultNotifications();
        console.log('Storage module initialized with default data');
    }

    // Public API
    return {
        KEYS,
        SESSION_KEYS,
        
        // User
        getUsers,
        saveUsers,
        getUserByCollegeId,
        createUser,
        updateUser,
        
        // Reports
        getReports,
        saveReports,
        addReport,
        updateReport,
        deleteReport,
        getReportsByUser,
        getReportsByType,
        
        // Notifications
        getNotificationsStore,
        getUserNotifications,
        setUserNotifications,
        saveNotificationsStore,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        getUnreadCount,
        
        // Contact
        getContactMessages,
        addContactMessage,
        
        // Session
        getCurrentUser,
        setCurrentUser,
        clearCurrentUser,
        isLoggedIn,
        isAdmin,
        
        // Theme
        getTheme,
        setTheme,
        
        // Recent Views
        getRecentViews,
        addRecentView,
        
        // Draft
        getDraft,
        saveDraft,
        clearDraft,
        
        // Onboarding
        isOnboarded,
        setOnboarded,
        
        // Utility
        clearAllData,

        // Initialization
        initializeDefaultUsers,
        initializeDefaultReports,
        init
    };
})();

// Expose global
window.TraceItStorage = Storage;
// Backwards compatibility: expose as `Storage` too for modules that reference it directly
window.Storage = Storage;

// Auto-initialize when script loads
Storage.init();