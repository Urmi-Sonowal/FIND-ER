/**
 * FIND-ER Search Module
 * Handles global search functionality
 */

const Search = (function() {
    
    let searchInput = null;
    let searchDropdown = null;
    let debounceTimer = null;
    let initialized = false;
    let observer = null;
    
    function init() {
        if (initialized) return;
        searchInput = document.getElementById('globalSearchInput');
        searchDropdown = document.getElementById('globalSearchDropdown');
        
        if (!searchInput || !searchDropdown) {
            // Header may be injected dynamically; observe document for the elements
            observeForHeader();
            return;
        }
        
        setupSearchListeners();
        setupKeyboardShortcuts();
        initialized = true;
    }
    
    function setupSearchListeners() {
        searchInput.addEventListener('focus', () => {
            performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('input', (e) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 300);
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header-search-wrap')) {
                closeDropdown();
            }
        });
    }
    
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            }
            
            // Escape to close dropdown
            if (e.key === 'Escape') {
                closeDropdown();
                if (searchInput) searchInput.blur();
            }
        });
    }

    function observeForHeader() {
        if (observer) return;
        observer = new MutationObserver((mutations, obs) => {
            searchInput = document.getElementById('globalSearchInput');
            searchDropdown = document.getElementById('globalSearchDropdown');
            if (searchInput && searchDropdown) {
                setupSearchListeners();
                setupKeyboardShortcuts();
                initialized = true;
                obs.disconnect();
                observer = null;
            }
        });
        observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
        // Fallback poll in case MutationObserver misses (very rare)
        const poll = setInterval(() => {
            if (initialized) { clearInterval(poll); return; }
            searchInput = document.getElementById('globalSearchInput');
            searchDropdown = document.getElementById('globalSearchDropdown');
            if (searchInput && searchDropdown) {
                setupSearchListeners();
                setupKeyboardShortcuts();
                initialized = true;
                if (observer) observer.disconnect(); observer = null;
                clearInterval(poll);
            }
        }, 200);
    }
    
    function performSearch(query) {
        const term = (query || '').toLowerCase().trim();
        
        if (!term) {
            closeDropdown();
            return;
        }
        
        const reports = Storage.getReports();
        const results = reports.filter(item => {
            return (item.name || '').toLowerCase().includes(term) ||
                   (item.location || '').toLowerCase().includes(term) ||
                   (item.category || '').toLowerCase().includes(term) ||
                   (item.description || '').toLowerCase().includes(term);
        }).slice(0, 8);
        
        if (!results.length) {
            searchDropdown.innerHTML = `
                <div class="global-search-item">
                    <span>🔍</span>
                    <span>No results found for "${Helpers.escapeHtml(term)}"</span>
                </div>
            `;
            searchDropdown.classList.add('is-open');
            return;
        }
        
        const basePath = window.location.pathname.includes('/dashboard/') ? '' : 'dashboard/';
        searchDropdown.innerHTML = results.map(item => `
            <a class="global-search-item" href="${basePath}item-detail.html?id=${encodeURIComponent(item.id)}">
                <span class="search-icon">${Constants.getCategoryIcon(item.category)}</span>
                <div class="search-info">
                    <strong>${Helpers.escapeHtml(item.name)}</strong>
                    <small>${Helpers.escapeHtml(item.category)} · ${Helpers.escapeHtml(item.type)} · ${Helpers.escapeHtml(item.location)}</small>
                </div>
            </a>
        `).join('');
        
        searchDropdown.classList.add('is-open');
        
        // Add styles for search results if not present
        if (!document.getElementById('searchStyles')) {
            const style = document.createElement('style');
            style.id = 'searchStyles';
            style.textContent = `
                .global-search-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    text-decoration: none;
                    color: var(--text-1);
                    border-bottom: 1px solid var(--border);
                    transition: background 0.2s;
                }
                .global-search-item:last-child {
                    border-bottom: none;
                }
                .global-search-item:hover {
                    background: var(--surface-2);
                }
                .search-icon {
                    font-size: 20px;
                }
                .search-info strong {
                    display: block;
                    font-size: 14px;
                    margin-bottom: 4px;
                }
                .search-info small {
                    font-size: 11px;
                    color: var(--text-3);
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function closeDropdown() {
        if (searchDropdown) {
            searchDropdown.classList.remove('is-open');
        }
    }
    
    function clearSearch() {
        if (searchInput) {
            searchInput.value = '';
            closeDropdown();
        }
    }
    
    // Public API
    return {
        init,
        performSearch,
        clearSearch,
        closeDropdown
    };
})();

window.FindERSearch = Search;