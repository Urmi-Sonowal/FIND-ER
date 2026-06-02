/**
 * FIND-ER Helper Utilities
 * Common helper functions used across the application
 */

const Helpers = (function() {
    
    // Escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
        } catch {
            return String(dateString);
        }
    }
    
    // Format time ago
    function timeAgo(isoOrDate) {
        try {
            const d = new Date(isoOrDate);
            if (isNaN(d.getTime())) return '';
            const diffMs = Date.now() - d.getTime();
            const minutes = Math.floor(diffMs / 60000);
            if (minutes < 1) return 'just now';
            if (minutes < 60) return minutes + 'm ago';
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return hours + 'h ago';
            const days = Math.floor(hours / 24);
            if (days === 1) return 'Yesterday';
            if (days < 7) return days + 'd ago';
            return d.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch {
            return '';
        }
    }
    
    // Generate unique ID
    function generateId(prefix = '') {
        return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function for performance
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Deep clone object
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
    
    // Get query parameter from URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    // Validate email format
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Validate phone number (10 digits)
    function isValidPhone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(String(phone));
    }
    
    // Validate password strength
    function getPasswordStrength(password) {
        let strength = 0;
        if (!password) return 0;
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        return strength;
    }
    
    // Capitalize first letter
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    // Truncate text
    function truncate(str, length = 50, suffix = '...') {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    }
    
    // Scroll to element smoothly
    function scrollToElement(element, offset = 0) {
        if (!element) return;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
    
    // Copy to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return false;
        }
    }
    
    // Download as CSV
    function downloadCSV(data, filename) {
        if (!data || !data.length) return false;
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        csvRows.push(headers.join(','));
        
        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] || '';
                return `"${String(val).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
    }
    
    // Download as JSON
    function downloadJSON(data, filename) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        return true;
    }
    
    // Get time of day greeting
    function getTimeOfDayGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
    
    // Animate number counting
    function animateNumber(element, target, duration = 800, suffix = '') {
        if (!element) return;
        const start = 0;
        const end = parseFloat(String(target).replace(/[^0-9.-]/g, '')) || 0;
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            element.textContent = current + suffix;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // Run count-up animations on page
    function runCountUpAnimations() {
        document.querySelectorAll('[data-count-up]').forEach(el => {
            const target = el.getAttribute('data-count-up');
            const suffix = el.getAttribute('data-count-suffix') || '';
            if (target) {
                animateNumber(el, target, 800, suffix);
            }
        });
    }
    
    // Setup scroll reveal animations
    function setupScrollReveal() {
        const elements = document.querySelectorAll('[data-reveal]');
        if (!elements.length || !('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('visible'));
            return;
        }
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        
        elements.forEach(el => observer.observe(el));
    }
    
    // Show skeleton loader
    function showSkeleton(container, count = 4) {
        if (!container) return;
        const skeletons = [];
        for (let i = 0; i < count; i++) {
            skeletons.push(`
                <div class="skeleton-card">
                    <div class="skeleton skeleton-img" style="height:160px;border-radius:16px;"></div>
                    <div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
                        <div class="skeleton skeleton-line" style="height:12px;width:60%;border-radius:6px;"></div>
                        <div class="skeleton skeleton-line" style="height:18px;width:90%;border-radius:6px;"></div>
                        <div class="skeleton skeleton-line" style="height:12px;width:70%;border-radius:6px;"></div>
                    </div>
                </div>
            `);
        }
        container.innerHTML = skeletons.join('');
    }
    
    // Hide skeleton and show content
    function hideSkeleton(container, content) {
        if (!container) return;
        container.innerHTML = content;
    }
    
    // Normalize report data
    function normalizeReport(report) {
        if (!report) return null;
        
        return {
            ...report,
            statusClass: Constants.getStatusClass(report.status),
            statusDisplay: Constants.getStatusDisplay(report.status),
            categoryIcon: Constants.getCategoryIcon(report.category),
            categoryImage: Constants.getCategoryImage(report.category),
            formattedDate: formatDate(report.date),
            timeAgo: timeAgo(report.reportedAt)
        };
    }
    
    // Normalize reports array
    function normalizeReports(reports) {
        if (!Array.isArray(reports)) return [];
        return reports.map(r => normalizeReport(r));
    }
    
    // Show toast message (uses global FindER if available)
    function showToast(message, type = 'info', duration = 3000) {
        if (window.FindER && typeof window.FindER.toast === 'function') {
            window.FindER.toast(message, type, duration);
            return;
        }
        
        // Fallback toast
        const toast = document.createElement('div');
        const colors = {
            success: { bg: '#dcfce7', fg: '#065f46', border: '#22c55e' },
            error: { bg: '#fee2e2', fg: '#b91c1c', border: '#dc2626' },
            warning: { bg: '#fef3c7', fg: '#92400e', border: '#f59e0b' },
            info: { bg: '#dbeafe', fg: '#1e3a8a', border: '#3b82f6' }
        };
        const c = colors[type] || colors.info;
        
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            padding: 12px 16px; border-radius: 14px; background: ${c.bg};
            color: ${c.fg}; border: 1px solid ${c.border};
            box-shadow: 0 10px 25px rgba(0,0,0,0.12);
            font-weight: 600; max-width: 420px; line-height: 1.4;
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, duration);
    }
    
    // Public API
    return {
        escapeHtml,
        formatDate,
        timeAgo,
        generateId,
        debounce,
        throttle,
        deepClone,
        getQueryParam,
        isValidEmail,
        isValidPhone,
        getPasswordStrength,
        capitalize,
        truncate,
        scrollToElement,
        copyToClipboard,
        downloadCSV,
        downloadJSON,
        getTimeOfDayGreeting,
        animateNumber,
        runCountUpAnimations,
        setupScrollReveal,
        showSkeleton,
        hideSkeleton,
        normalizeReport,
        normalizeReports,
        showToast
    };
})();

window.FindERHelpers = Helpers;