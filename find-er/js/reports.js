/**
 * FIND-ER Reports Module
 * Handles report CRUD operations and rendering
 */

const Reports = (function() {
    
    let currentReports = [];
    
    function init() {
        loadReports();
    }
    
    function loadReports() {
        currentReports = Storage.getReports();
        currentReports = Helpers.normalizeReports(currentReports);
        return currentReports;
    }
    
    function refresh() {
        return loadReports();
    }
    
    function getReports() {
        return currentReports;
    }
    
    function getReportsByType(type) {
        return currentReports.filter(r => r.type === type);
    }
    
    function getReportsByUser(collegeId) {
        return currentReports.filter(r => r.reporterId === collegeId || r.collegeId === collegeId);
    }
    
    function getReportById(id) {
        return currentReports.find(r => r.id === id);
    }
    
    function addReport(reportData) {
        const newReport = {
            id: Helpers.generateId('RPT_'),
            ...reportData,
            status: Constants.STATUSES.PENDING,
            reportedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        Storage.addReport(newReport);
        loadReports();
        
        // Add notification for admin
        const admins = Storage.getUsers().filter(u => u.role === Constants.ROLES.ADMIN);
        admins.forEach(admin => {
            Storage.addNotification(admin.collegeId, {
                message: `New ${newReport.type} report: ${newReport.name}`,
                type: 'alert',
                itemId: newReport.id
            });
        });
        
        return newReport;
    }
    
    function updateReport(id, updates) {
        const updated = Storage.updateReport(id, updates);
        if (updated) {
            loadReports();
            
            // Add notification for the reporter
            const report = updated;
            const reporterId = report.reporterId || report.collegeId;
            if (reporterId && updates.status) {
                Storage.addNotification(reporterId, {
                    message: `Your item "${report.name}" status changed to ${Constants.getStatusDisplay(updates.status)}`,
                    type: 'status',
                    itemId: id
                });
            }
        }
        return updated;
    }
    
    function deleteReport(id) {
        const report = getReportById(id);
        if (!report) return false;
        
        Storage.deleteReport(id);
        loadReports();
        return true;
    }
    
    function getStats() {
        const total = currentReports.length;
        const lost = currentReports.filter(r => r.type === Constants.REPORT_TYPES.LOST).length;
        const found = currentReports.filter(r => r.type === Constants.REPORT_TYPES.FOUND).length;
        const pending = currentReports.filter(r => r.status === Constants.STATUSES.PENDING).length;
        const verified = currentReports.filter(r => r.status === Constants.STATUSES.VERIFIED).length;
        const ready = currentReports.filter(r => r.status === Constants.STATUSES.READY).length;
        const matched = currentReports.filter(r => r.status === Constants.STATUSES.MATCHED).length;
        const collected = currentReports.filter(r => r.status === Constants.STATUSES.COLLECTED).length;
        
        const recoveryRate = total > 0 ? Math.round((collected / total) * 100) : 0;
        
        return {
            total,
            lost,
            found,
            pending,
            verified,
            ready,
            matched,
            collected,
            recoveryRate
        };
    }
    
    function getUserStats(collegeId) {
        const userReports = getReportsByUser(collegeId);
        const total = userReports.length;
        const active = userReports.filter(r => r.status !== Constants.STATUSES.COLLECTED).length;
        const recovered = userReports.filter(r => r.status === Constants.STATUSES.COLLECTED).length;
        const successRate = total > 0 ? Math.round((recovered / total) * 100) : 0;
        
        return { total, active, recovered, successRate };
    }
    
    function findPotentialMatches(lostItem) {
        const foundItems = getReportsByType(Constants.REPORT_TYPES.FOUND);
        
        return foundItems.filter(found => {
            // Match by category
            if (found.category !== lostItem.category) return false;
            
            // Match by location similarity (basic)
            const locationMatch = found.location && lostItem.location && 
                (found.location.toLowerCase().includes(lostItem.location.toLowerCase()) ||
                 lostItem.location.toLowerCase().includes(found.location.toLowerCase()));
            
            // Match by name similarity
            const nameMatch = found.name && lostItem.name &&
                (found.name.toLowerCase().includes(lostItem.name.toLowerCase()) ||
                 lostItem.name.toLowerCase().includes(found.name.toLowerCase()));
            
            return locationMatch || nameMatch;
        }).map(match => ({
            ...match,
            matchScore: calculateMatchScore(lostItem, match)
        }));
    }
    
    function calculateMatchScore(lost, found) {
        let score = 0;
        
        // Category match (40%)
        if (lost.category === found.category) score += 40;
        
        // Location match (30%)
        if (lost.location && found.location) {
            const lostLoc = lost.location.toLowerCase();
            const foundLoc = found.location.toLowerCase();
            if (lostLoc === foundLoc) score += 30;
            else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) score += 15;
        }
        
        // Name match (20%)
        if (lost.name && found.name) {
            const lostName = lost.name.toLowerCase();
            const foundName = found.name.toLowerCase();
            if (lostName === foundName) score += 20;
            else if (lostName.includes(foundName) || foundName.includes(lostName)) score += 10;
        }
        
        // Date proximity (10%)
        if (lost.date && found.date) {
            const lostDate = new Date(lost.date);
            const foundDate = new Date(found.date);
            const daysDiff = Math.abs(lostDate - foundDate) / (1000 * 60 * 60 * 24);
            if (daysDiff <= 1) score += 10;
            else if (daysDiff <= 3) score += 5;
        }
        
        return score;
    }
    
    function exportToCSV() {
        const exportData = currentReports.map(r => ({
            ID: r.id,
            'Item Name': r.name,
            Type: r.type,
            Category: r.category,
            Location: r.location,
            Date: r.date,
            Status: Constants.getStatusDisplay(r.status),
            'Reported By': r.reporterId || r.collegeId,
            Phone: r.phone,
            Email: r.email,
            'Reported At': new Date(r.reportedAt).toLocaleString()
        }));
        
        return Helpers.downloadCSV(exportData, 'find-er-reports');
    }
    
    function exportToJSON() {
        const exportData = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            totalReports: currentReports.length,
            reports: currentReports.map(r => ({
                ...r,
                statusDisplay: Constants.getStatusDisplay(r.status)
            }))
        };
        
        return Helpers.downloadJSON(exportData, 'find-er-reports');
    }
    
    // Public API
    return {
        init,
        refresh,
        getReports,
        getReportsByType,
        getReportsByUser,
        getReportById,
        addReport,
        updateReport,
        deleteReport,
        getStats,
        getUserStats,
        findPotentialMatches,
        exportToCSV,
        exportToJSON
    };
})();

window.FindERReports = Reports;