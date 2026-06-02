/**
 * FIND-ER Mock Data
 * Sample data for development and testing
 */

const MockData = (function() {
    
    // Sample users
    const users = [
        {
            id: 'u_student_001',
            name: 'Venkatasaarathy',
            collegeId: 'CSE2023001',
            email: 'venkatasaarathy@college.edu',
            department: 'CSE',
            year: '3rd Year',
            role: 'student',
            passwordHash: 'hash_student123',
            memberSince: '2024-01-15T00:00:00.000Z',
            phone: '9876543210'
        },
        {
            id: 'u_student_002',
            name: 'Priya Sharma',
            collegeId: 'AIDS2023005',
            email: 'priya.sharma@college.edu',
            department: 'AIDS',
            year: '2nd Year',
            role: 'student',
            passwordHash: 'hash_student123',
            memberSince: '2024-01-20T00:00:00.000Z',
            phone: '9876543211'
        },
        {
            id: 'u_student_003',
            name: 'Amit Kumar',
            collegeId: 'ECE2023008',
            email: 'amit.kumar@college.edu',
            department: 'ECE',
            year: '3rd Year',
            role: 'student',
            passwordHash: 'hash_student123',
            memberSince: '2024-01-18T00:00:00.000Z',
            phone: '9876543212'
        },
        {
            id: 'u_student_004',
            name: 'Suresh Reddy',
            collegeId: 'MECH2023012',
            email: 'suresh.reddy@college.edu',
            department: 'Mechanical',
            year: '4th Year',
            role: 'student',
            passwordHash: 'hash_student123',
            memberSince: '2024-01-10T00:00:00.000Z',
            phone: '9876543213'
        },
        {
            id: 'u_student_005',
            name: 'Neha Singh',
            collegeId: 'CIVIL2023015',
            email: 'neha.singh@college.edu',
            department: 'Civil',
            year: '2nd Year',
            role: 'student',
            passwordHash: 'hash_student123',
            memberSince: '2024-01-25T00:00:00.000Z',
            phone: '9876543214'
        },
        {
            id: 'u_admin_001',
            name: 'Admin User',
            collegeId: 'admin',
            email: 'admin@college.edu',
            department: 'Administration',
            year: '',
            role: 'admin',
            passwordHash: 'b2d4c8f1a9e3d7c5b0f2e6a4d8c2b6f0e4a8d2c6b0f4e8a2d6c0b4f8e2a6d4c8',
            memberSince: '2024-01-01T00:00:00.000Z'
        }
    ];
    
    // Sample lost items
    const lostItems = [
        {
            id: 'LOST_001',
            type: 'lost',
            name: 'College ID Card',
            category: 'ID Card',
            location: 'CSE Block, Room 205',
            date: '2024-03-15',
            time: 'Morning (6 AM – 9 AM)',
            description: 'Student ID Card - Venkatasaarathy, CSE, 3rd Year. Black cover with blue stripe.',
            status: 'pending',
            reporterId: 'CSE2023001',
            reportedBy: {
                name: 'Venkatasaarathy',
                collegeId: 'CSE2023001',
                email: 'venkatasaarathy@college.edu',
                phone: '9876543210'
            },
            phone: '9876543210',
            email: 'venkatasaarathy@college.edu',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
            reportedAt: '2024-03-15T09:30:00.000Z',
            lastUpdated: '2024-03-15T09:30:00.000Z'
        },
        {
            id: 'LOST_002',
            type: 'lost',
            name: 'Black Backpack',
            category: 'Bag',
            location: 'Central Library',
            date: '2024-03-14',
            time: 'Afternoon (12 PM – 3 PM)',
            description: 'Nike backpack, black color, contains notebooks, laptop charger, and water bottle.',
            status: 'pending',
            reporterId: 'AIDS2023005',
            reportedBy: {
                name: 'Priya Sharma',
                collegeId: 'AIDS2023005',
                email: 'priya.sharma@college.edu',
                phone: '9876543211'
            },
            phone: '9876543211',
            email: 'priya.sharma@college.edu',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
            reportedAt: '2024-03-14T14:20:00.000Z',
            lastUpdated: '2024-03-14T14:20:00.000Z'
        },
        {
            id: 'LOST_003',
            type: 'lost',
            name: 'Samsung Galaxy Phone',
            category: 'Electronics',
            location: 'Cafeteria',
            date: '2024-03-13',
            time: 'Forenoon (9 AM – 12 PM)',
            description: 'Samsung Galaxy S21, black color with blue silicone case. Screen protector applied.',
            status: 'verified',
            reporterId: 'ECE2023008',
            reportedBy: {
                name: 'Amit Kumar',
                collegeId: 'ECE2023008',
                email: 'amit.kumar@college.edu',
                phone: '9876543212'
            },
            phone: '9876543212',
            email: 'amit.kumar@college.edu',
            image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
            reportedAt: '2024-03-13T11:45:00.000Z',
            lastUpdated: '2024-03-14T10:00:00.000Z'
        },
        {
            id: 'LOST_004',
            type: 'lost',
            name: 'House Keys',
            category: 'Keys',
            location: 'Parking Lot',
            date: '2024-03-12',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Set of 4 keys with blue keychain and small LED torch attached.',
            status: 'pending',
            reporterId: 'MECH2023012',
            reportedBy: {
                name: 'Suresh Reddy',
                collegeId: 'MECH2023012',
                email: 'suresh.reddy@college.edu',
                phone: '9876543213'
            },
            phone: '9876543213',
            email: 'suresh.reddy@college.edu',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            reportedAt: '2024-03-12T16:30:00.000Z',
            lastUpdated: '2024-03-12T16:30:00.000Z'
        },
        {
            id: 'LOST_005',
            type: 'lost',
            name: 'Engineering Mathematics Book',
            category: 'Books',
            location: 'Lecture Hall 3',
            date: '2024-03-11',
            time: 'Morning (6 AM – 9 AM)',
            description: 'BS Grewal - Higher Engineering Mathematics book, covered with brown paper. Name "Neha" written inside.',
            status: 'collected',
            reporterId: 'CIVIL2023015',
            reportedBy: {
                name: 'Neha Singh',
                collegeId: 'CIVIL2023015',
                email: 'neha.singh@college.edu',
                phone: '9876543214'
            },
            phone: '9876543214',
            email: 'neha.singh@college.edu',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            reportedAt: '2024-03-11T08:15:00.000Z',
            lastUpdated: '2024-03-13T15:00:00.000Z'
        },
        {
            id: 'LOST_006',
            type: 'lost',
            name: 'Apple Watch',
            category: 'Accessories',
            location: 'Sports Complex',
            date: '2024-03-10',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Apple Watch Series 7, silver aluminum case with black sport band.',
            status: 'matched',
            reporterId: 'CSE2023010',
            reportedBy: {
                name: 'Venkatasaarathy',
                collegeId: 'CSE2023010',
                email: 'venkatasaarathy@college.edu',
                phone: '9876543220'
            },
            phone: '9876543220',
            email: 'venkatasaarathy@college.edu',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            reportedAt: '2024-03-10T17:00:00.000Z',
            lastUpdated: '2024-03-14T09:00:00.000Z'
        },
        {
            id: 'LOST_007',
            type: 'lost',
            name: 'Dell Laptop Charger',
            category: 'Electronics',
            location: 'Library',
            date: '2024-03-09',
            time: 'Afternoon (12 PM – 3 PM)',
            description: 'Dell laptop charger, 65W, with cable tie. Model: LA65NM150.',
            status: 'pending',
            reporterId: 'AIDS2023008',
            reportedBy: {
                name: 'Venkatasaarathy',
                collegeId: 'AIDS2023008',
                email: 'venkatasaarathy@college.edu',
                phone: '9876543221'
            },
            phone: '9876543221',
            email: 'venkatasaarathy@college.edu',
            image: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f2?w=400',
            reportedAt: '2024-03-09T13:30:00.000Z',
            lastUpdated: '2024-03-09T13:30:00.000Z'
        },
        {
            id: 'LOST_008',
            type: 'lost',
            name: 'Spectacles',
            category: 'Accessories',
            location: 'Auditorium',
            date: '2024-03-08',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Black frame spectacles, power -2.5. Brand: Lenskart.',
            status: 'verified',
            reporterId: 'ECE2023015',
            reportedBy: {
                name: 'Ravi Kumar',
                collegeId: 'ECE2023015',
                email: 'ravi.kumar@college.edu',
                phone: '9876543222'
            },
            phone: '9876543222',
            email: 'ravi.kumar@college.edu',
            image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
            reportedAt: '2024-03-08T18:00:00.000Z',
            lastUpdated: '2024-03-11T11:00:00.000Z'
        },
        {
            id: 'LOST_009',
            type: 'lost',
            name: 'SBI ATM Card',
            category: 'Card',
            location: 'Canteen',
            date: '2024-03-07',
            time: 'Forenoon (9 AM – 12 PM)',
            description: 'SBI Bank ATM Card, last 4 digits 1234. Name: Venkatasaarathy.',
            status: 'collected',
            reporterId: 'MECH2023020',
            reportedBy: {
                name: 'Rajesh Gupta',
                collegeId: 'MECH2023020',
                email: 'rajesh.gupta@college.edu',
                phone: '9876543223'
            },
            phone: '9876543223',
            email: 'rajesh.gupta@college.edu',
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
            reportedAt: '2024-03-07T10:00:00.000Z',
            lastUpdated: '2024-03-10T16:00:00.000Z'
        },
        {
            id: 'LOST_010',
            type: 'lost',
            name: 'Water Bottle',
            category: 'Water Bottle',
            location: 'Gym',
            date: '2024-03-06',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Blue Milton water bottle, 1 liter capacity. Has sticker of a tiger.',
            status: 'pending',
            reporterId: 'CIVIL2023025',
            reportedBy: {
                name: 'Pooja Mehta',
                collegeId: 'CIVIL2023025',
                email: 'pooja.mehta@college.edu',
                phone: '9876543224'
            },
            phone: '9876543224',
            email: 'pooja.mehta@college.edu',
            image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
            reportedAt: '2024-03-06T17:30:00.000Z',
            lastUpdated: '2024-03-06T17:30:00.000Z'
        }
    ];
    
    // Sample found items
    const foundItems = [
        {
            id: 'FOUND_001',
            type: 'found',
            name: 'Student ID Card',
            category: 'ID Card',
            location: 'Central Library',
            date: '2024-03-15',
            time: 'Forenoon (9 AM – 12 PM)',
            description: 'Found on the 2nd floor near the reading area. Name: Venkatasaarathy, CSE 3rd Year.',
            status: 'ready',
            storedAt: 'Lost & Found Office',
            foundBy: 'Library Staff',
            reporterId: 'LIB001',
            reportedBy: {
                name: 'Library Staff',
                collegeId: 'LIB001',
                email: 'library@college.edu',
                phone: '9876543215'
            },
            phone: '9876543215',
            email: 'library@college.edu',
            image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
            reportedAt: '2024-03-15T10:30:00.000Z',
            lastUpdated: '2024-03-15T10:30:00.000Z'
        },
        {
            id: 'FOUND_002',
            type: 'found',
            name: 'HDFC ATM Card',
            category: 'Card',
            location: 'Canteen',
            date: '2024-03-14',
            time: 'Afternoon (12 PM – 3 PM)',
            description: 'HDFC Bank ATM Card, last 4 digits 5678.',
            status: 'ready',
            storedAt: 'Admin Office',
            foundBy: 'Canteen Staff',
            reporterId: 'CANT001',
            reportedBy: {
                name: 'Canteen Staff',
                collegeId: 'CANT001',
                email: 'canteen@college.edu',
                phone: '9876543216'
            },
            phone: '9876543216',
            email: 'canteen@college.edu',
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
            reportedAt: '2024-03-14T13:00:00.000Z',
            lastUpdated: '2024-03-14T13:00:00.000Z'
        },
        {
            id: 'FOUND_003',
            type: 'found',
            name: 'Smart Watch',
            category: 'Accessories',
            location: 'Sports Complex',
            date: '2024-03-13',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Black smart watch with fitness tracker. Display shows notifications.',
            status: 'verified',
            storedAt: 'Lost & Found Office',
            foundBy: 'Sports Coach',
            reporterId: 'SPT001',
            reportedBy: {
                name: 'Sports Coach',
                collegeId: 'SPT001',
                email: 'sports@college.edu',
                phone: '9876543217'
            },
            phone: '9876543217',
            email: 'sports@college.edu',
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
            reportedAt: '2024-03-13T17:30:00.000Z',
            lastUpdated: '2024-03-14T14:00:00.000Z'
        },
        {
            id: 'FOUND_004',
            type: 'found',
            name: 'Wireless Headphones',
            category: 'Electronics',
            location: 'Auditorium',
            date: '2024-03-12',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Boat wireless headphones, black color. In good condition.',
            status: 'verified',
            storedAt: 'Lost & Found Office',
            foundBy: 'Event Coordinator',
            reporterId: 'EVT001',
            reportedBy: {
                name: 'Event Coordinator',
                collegeId: 'EVT001',
                email: 'events@college.edu',
                phone: '9876543218'
            },
            phone: '9876543218',
            email: 'events@college.edu',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            reportedAt: '2024-03-12T18:00:00.000Z',
            lastUpdated: '2024-03-13T10:00:00.000Z'
        },
        {
            id: 'FOUND_005',
            type: 'found',
            name: 'Bike Keys',
            category: 'Keys',
            location: 'Parking Lot',
            date: '2024-03-11',
            time: 'Morning (6 AM – 9 AM)',
            description: 'Hero Honda bike keys with remote. Keychain has a small metal tag.',
            status: 'ready',
            storedAt: 'Security Office',
            foundBy: 'Security Guard',
            reporterId: 'SEC001',
            reportedBy: {
                name: 'Security Guard',
                collegeId: 'SEC001',
                email: 'security@college.edu',
                phone: '9876543219'
            },
            phone: '9876543219',
            email: 'security@college.edu',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
            reportedAt: '2024-03-11T07:30:00.000Z',
            lastUpdated: '2024-03-11T07:30:00.000Z'
        },
        {
            id: 'FOUND_006',
            type: 'found',
            name: 'Dell Laptop',
            category: 'Electronics',
            location: 'Library',
            date: '2024-03-10',
            time: 'Forenoon (9 AM – 12 PM)',
            description: 'Dell Inspiron laptop, silver color, with stickers of coding languages.',
            status: 'ready',
            storedAt: 'Lost & Found Office',
            foundBy: 'Library Staff',
            reporterId: 'LIB002',
            reportedBy: {
                name: 'Library Staff',
                collegeId: 'LIB002',
                email: 'library@college.edu',
                phone: '9876543225'
            },
            phone: '9876543225',
            email: 'library@college.edu',
            image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
            reportedAt: '2024-03-10T10:30:00.000Z',
            lastUpdated: '2024-03-10T10:30:00.000Z'
        },
        {
            id: 'FOUND_007',
            type: 'found',
            name: 'Brown Leather Wallet',
            category: 'Wallet',
            location: 'Cafeteria',
            date: '2024-03-09',
            time: 'Afternoon (12 PM – 3 PM)',
            description: 'Brown leather wallet, contains some cash and a few cards.',
            status: 'verified',
            storedAt: 'Admin Office',
            foundBy: 'Canteen Manager',
            reporterId: 'CANT002',
            reportedBy: {
                name: 'Canteen Manager',
                collegeId: 'CANT002',
                email: 'canteen@college.edu',
                phone: '9876543226'
            },
            phone: '9876543226',
            email: 'canteen@college.edu',
            image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
            reportedAt: '2024-03-09T14:00:00.000Z',
            lastUpdated: '2024-03-11T09:00:00.000Z'
        },
        {
            id: 'FOUND_008',
            type: 'found',
            name: 'OnePlus Mobile Phone',
            category: 'Electronics',
            location: 'CSE Block',
            date: '2024-03-08',
            time: 'Morning (6 AM – 9 AM)',
            description: 'OnePlus 9, blue color, with transparent case. Screen protector applied.',
            status: 'ready',
            storedAt: 'Lost & Found Office',
            foundBy: 'Professor Sharma',
            reporterId: 'FAC001',
            reportedBy: {
                name: 'Professor Sharma',
                collegeId: 'FAC001',
                email: 'faculty@college.edu',
                phone: '9876543227'
            },
            phone: '9876543227',
            email: 'faculty@college.edu',
            image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400',
            reportedAt: '2024-03-08T09:00:00.000Z',
            lastUpdated: '2024-03-08T09:00:00.000Z'
        },
        {
            id: 'FOUND_009',
            type: 'found',
            name: 'Physics Textbook',
            category: 'Books',
            location: 'Lecture Hall 1',
            date: '2024-03-07',
            time: 'Afternoon (12 PM – 3 PM)',
            description: 'HC Verma - Physics Part 1, covered with brown paper.',
            status: 'ready',
            storedAt: 'Lost & Found Office',
            foundBy: 'Student',
            reporterId: 'STU001',
            reportedBy: {
                name: 'Anonymous Student',
                collegeId: 'STU001',
                email: 'student@college.edu',
                phone: '9876543228'
            },
            phone: '9876543228',
            email: 'student@college.edu',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
            reportedAt: '2024-03-07T13:30:00.000Z',
            lastUpdated: '2024-03-07T13:30:00.000Z'
        },
        {
            id: 'FOUND_010',
            type: 'found',
            name: 'Blue Backpack',
            category: 'Bag',
            location: 'Bus Stop',
            date: '2024-03-06',
            time: 'Evening (3 PM – 6 PM)',
            description: 'Blue Skybags backpack, new condition. Contains notebooks and a water bottle.',
            status: 'verified',
            storedAt: 'Security Office',
            foundBy: 'Security Guard',
            reporterId: 'SEC002',
            reportedBy: {
                name: 'Security Guard',
                collegeId: 'SEC002',
                email: 'security@college.edu',
                phone: '9876543229'
            },
            phone: '9876543229',
            email: 'security@college.edu',
            image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
            reportedAt: '2024-03-06T17:00:00.000Z',
            lastUpdated: '2024-03-08T11:00:00.000Z'
        }
    ];
    
    // Sample contact messages
    const contactMessages = [
        {
            id: 'MSG_001',
            name: 'Venkatasaarathy',
            collegeId: 'CSE2023001',
            subject: 'Lost Item Query',
            message: 'I lost my ID card yesterday in the CSE block. Has anyone found it?',
            timestamp: '2024-03-15T10:00:00.000Z',
            status: 'replied'
        },
        {
            id: 'MSG_002',
            name: 'Priya Sharma',
            collegeId: 'AIDS2023005',
            subject: 'Technical Issue',
            message: 'I am unable to upload photos while reporting an item. Please help.',
            timestamp: '2024-03-14T15:30:00.000Z',
            status: 'unread'
        },
        {
            id: 'MSG_003',
            name: 'Amit Kumar',
            collegeId: 'ECE2023008',
            subject: 'Feedback',
            message: 'Great platform! Found my phone within hours. Keep up the good work!',
            timestamp: '2024-03-13T11:00:00.000Z',
            status: 'read'
        }
    ];
    
    // Sample notifications
    const notifications = {
        'CSE2023001': [
            {
                id: 'NOTIF_001',
                message: 'Your item "College ID Card" status changed to Ready for Pickup',
                type: 'status',
                itemId: 'LOST_001',
                read: false,
                createdAt: '2024-03-15T11:30:00.000Z'
            },
            {
                id: 'NOTIF_002',
                message: 'Potential match found for your "Apple Watch"',
                type: 'match',
                itemId: 'LOST_006',
                read: true,
                createdAt: '2024-03-14T10:00:00.000Z'
            }
        ],
        'AIDS2023005': [
            {
                id: 'NOTIF_003',
                message: 'Your report "Black Backpack" has been verified',
                type: 'status',
                itemId: 'LOST_002',
                read: false,
                createdAt: '2024-03-14T16:00:00.000Z'
            }
        ],
        'ECE2023008': [
            {
                id: 'NOTIF_004',
                message: 'Your item "Samsung Galaxy Phone" has been marked as Verified',
                type: 'status',
                itemId: 'LOST_003',
                read: true,
                createdAt: '2024-03-14T10:30:00.000Z'
            }
        ]
    };
    
    // Helper function to get all lost items
    function getLostItems() {
        return [...lostItems];
    }
    
    // Helper function to get all found items
    function getFoundItems() {
        return [...foundItems];
    }
    
    // Helper function to get all users
    function getUsers() {
        return [...users];
    }
    
    // Helper function to get all reports (lost + found)
    function getAllReports() {
        return [...lostItems, ...foundItems];
    }
    
    // Helper function to get reports by user
    function getReportsByUser(collegeId) {
        return [...lostItems, ...foundItems].filter(r => r.reporterId === collegeId);
    }
    
    // Helper function to get contact messages
    function getContactMessages() {
        return [...contactMessages];
    }
    
    // Helper function to get notifications for a user
    function getNotifications(collegeId) {
        return notifications[collegeId] || [];
    }
    
    // Helper function to get statistics
    function getStatistics() {
        const totalLost = lostItems.length;
        const totalFound = foundItems.length;
        const pendingLost = lostItems.filter(i => i.status === 'pending').length;
        const verifiedItems = [...lostItems, ...foundItems].filter(i => i.status === 'verified').length;
        const readyItems = foundItems.filter(i => i.status === 'ready').length;
        const collectedItems = lostItems.filter(i => i.status === 'collected').length;
        const recoveryRate = totalLost > 0 ? Math.round((collectedItems / totalLost) * 100) : 0;
        
        return {
            totalLost,
            totalFound,
            pendingLost,
            verifiedItems,
            readyItems,
            collectedItems,
            recoveryRate,
            totalUsers: users.length,
            totalReports: lostItems.length + foundItems.length
        };
    }
    
    // Helper function to get a specific item by ID
    function getItemById(id) {
        return [...lostItems, ...foundItems].find(item => item.id === id);
    }
    
    // Public API
    return {
        getLostItems,
        getFoundItems,
        getUsers,
        getAllReports,
        getReportsByUser,
        getContactMessages,
        getNotifications,
        getStatistics,
        getItemById,
        users,
        lostItems,
        foundItems,
        contactMessages,
        notifications
    };
})();

// Make available globally
window.FindERMockData = MockData;

// Also expose individual helpers for console usage
window.mockData = {
    lost: () => MockData.getLostItems(),
    found: () => MockData.getFoundItems(),
    users: () => MockData.getUsers(),
    reports: () => MockData.getAllReports(),
    stats: () => MockData.getStatistics(),
    help: () => console.log('Available: mockData.lost(), mockData.found(), mockData.users(), mockData.reports(), mockData.stats(), mockData.getItemById("ID")')
};