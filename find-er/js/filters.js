/**
 * FIND-ER Filters Module
 * Handles filtering functionality for lost/found items
 */

const Filters = (function() {
    
    let currentType = null;
    let currentFilters = {
        category: 'all',
        search: '',
        sort: 'newest',
        dateRange: 'all'
    };
    
    let itemsCache = [];
    let filteredItems = [];
    
    function init(type, items) {
        currentType = type;
        itemsCache = items || [];
        filteredItems = [...itemsCache];
        
        setupFilterListeners();
        applyFilters();
    }
    
    function setupFilterListeners() {
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortFilter');
        const dateRange = document.getElementById('dateRangeFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                currentFilters.category = e.target.value;
                applyFilters();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentFilters.search = e.target.value;
                applyFilters();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentFilters.sort = e.target.value;
                applyFilters();
            });
        }
        
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                currentFilters.dateRange = e.target.value;
                applyFilters();
            });
        }
    }
    
    function applyFilters() {
        let results = [...itemsCache];
        
        // Apply category filter
        if (currentFilters.category !== 'all') {
            results = results.filter(item => item.category === currentFilters.category);
        }
        
        // Apply search filter
        if (currentFilters.search) {
            const term = currentFilters.search.toLowerCase();
            results = results.filter(item => {
                return (item.name || '').toLowerCase().includes(term) ||
                       (item.location || '').toLowerCase().includes(term) ||
                       (item.description || '').toLowerCase().includes(term);
            });
        }
        
        // Apply date range filter
        if (currentFilters.dateRange !== 'all') {
            const now = new Date();
            let cutoffDate = new Date();
            
            switch(currentFilters.dateRange) {
                case 'today':
                    cutoffDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate.setDate(now.getDate() - 30);
                    break;
            }
            
            results = results.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= cutoffDate;
            });
        }
        
        // Apply sorting
        results = applySorting(results);
        
        filteredItems = results;
        
        // Trigger render callback
        if (typeof window.renderFilteredItems === 'function') {
            window.renderFilteredItems(filteredItems);
        }
        
        updateItemCount(filteredItems.length);
    }
    
    function applySorting(items) {
        const sorted = [...items];
        
        switch(currentFilters.sort) {
            case 'newest':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'az':
                sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
            case 'za':
                sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
                break;
            default:
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        
        return sorted;
    }
    
    function updateItemCount(count) {
        const countElement = document.getElementById('itemCountBadge');
        if (countElement) {
            countElement.textContent = `${count} item${count !== 1 ? 's' : ''}`;
        }
    }
    
    function updateItems(newItems) {
        itemsCache = newItems || [];
        applyFilters();
    }
    
    function getFilteredItems() {
        return filteredItems;
    }
    
    function getCurrentFilters() {
        return { ...currentFilters };
    }
    
    function resetFilters() {
        currentFilters = {
            category: 'all',
            search: '',
            sort: 'newest',
            dateRange: 'all'
        };
        
        // Reset UI elements
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        const sortSelect = document.getElementById('sortFilter');
        const dateRange = document.getElementById('dateRangeFilter');
        
        if (categoryFilter) categoryFilter.value = 'all';
        if (searchInput) searchInput.value = '';
        if (sortSelect) sortSelect.value = 'newest';
        if (dateRange) dateRange.value = 'all';
        
        applyFilters();
    }
    
    // Public API
    return {
        init,
        updateItems,
        getFilteredItems,
        getCurrentFilters,
        resetFilters,
        applyFilters
    };
})();

window.TraceItFilters = Filters;