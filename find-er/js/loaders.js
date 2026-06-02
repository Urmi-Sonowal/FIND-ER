/**
 * FIND-ER Loaders Module
 * Handles loading states and skeletons
 */

const Loaders = (function() {
    
    let activeLoaders = new Map();
    let loaderCounter = 0;
    
    function init() {
        setupPageLoader();
    }
    
    function setupPageLoader() {
        // Hide loader immediately if page is already loaded
        if (document.readyState === 'complete') {
            hidePageLoader();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    hidePageLoader();
                }, 300);
            });
        }
        
        // Fallback timeout - force hide after 3 seconds
        setTimeout(() => {
            hidePageLoader();
        }, 3000);
    }
    
    function hidePageLoader() {
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }
    
    function showLoader(element, options = {}) {
        if (!element) return null;
        
        const loaderId = `loader_${++loaderCounter}`;
        const originalContent = element.innerHTML;
        
        activeLoaders.set(loaderId, {
            element: element,
            originalContent: originalContent,
            type: options.type || 'spinner'
        });
        
        switch(options.type) {
            case 'skeleton':
                element.innerHTML = generateSkeleton(options.skeletonType || 'card', options.count || 1);
                break;
            case 'spinner':
                element.innerHTML = generateSpinner();
                break;
            case 'bar':
                element.innerHTML = generateProgressBar();
                break;
            default:
                element.innerHTML = generateSpinner();
        }
        
        if (options.overlay) {
            element.style.position = 'relative';
            element.style.minHeight = '100px';
        }
        
        return loaderId;
    }
    
    function hideLoader(loaderId, restoreContent = true) {
        const loader = activeLoaders.get(loaderId);
        if (!loader) return false;
        
        if (restoreContent) {
            loader.element.innerHTML = loader.originalContent;
        }
        
        loader.element.style.position = '';
        loader.element.style.minHeight = '';
        
        activeLoaders.delete(loaderId);
        return true;
    }
    
    function showSkeleton(container, type = 'card', count = 3) {
        if (!container) return null;
        return showLoader(container, { type: 'skeleton', skeletonType: type, count: count });
    }
    
    function hideSkeleton(loaderId) {
        return hideLoader(loaderId, true);
    }
    
    function generateSkeleton(type, count) {
        let skeletonHtml = '';
        
        for (let i = 0; i < count; i++) {
            switch(type) {
                case 'card':
                    skeletonHtml += `
                        <div class="skeleton-card">
                            <div class="skeleton skeleton-img" style="height:160px;border-radius:16px;"></div>
                            <div style="padding:16px;display:flex;flex-direction:column;gap:10px;">
                                <div class="skeleton skeleton-line" style="height:12px;width:60%;border-radius:6px;"></div>
                                <div class="skeleton skeleton-line" style="height:18px;width:90%;border-radius:6px;"></div>
                                <div class="skeleton skeleton-line" style="height:12px;width:70%;border-radius:6px;"></div>
                            </div>
                        </div>
                    `;
                    break;
                case 'table-row':
                    skeletonHtml += `
                        <div class="skeleton-table-row" style="display:flex;gap:12px;padding:12px;border-bottom:1px solid var(--border);">
                            <div class="skeleton skeleton-line" style="height:20px;width:30%;border-radius:4px;"></div>
                            <div class="skeleton skeleton-line" style="height:20px;width:20%;border-radius:4px;"></div>
                            <div class="skeleton skeleton-line" style="height:20px;width:25%;border-radius:4px;"></div>
                            <div class="skeleton skeleton-line" style="height:20px;width:15%;border-radius:4px;"></div>
                        </div>
                    `;
                    break;
                case 'list-item':
                    skeletonHtml += `
                        <div class="skeleton-list-item" style="display:flex;gap:12px;padding:12px;margin-bottom:8px;border-radius:12px;">
                            <div class="skeleton skeleton-line" style="width:48px;height:48px;border-radius:8px;"></div>
                            <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                                <div class="skeleton skeleton-line" style="height:16px;width:60%;border-radius:4px;"></div>
                                <div class="skeleton skeleton-line" style="height:12px;width:40%;border-radius:4px;"></div>
                            </div>
                        </div>
                    `;
                    break;
                default:
                    skeletonHtml += `
                        <div class="skeleton-default" style="padding:20px;">
                            <div class="skeleton skeleton-line" style="height:20px;width:100%;border-radius:6px;"></div>
                        </div>
                    `;
            }
        }
        
        if (!document.getElementById('skeletonStyles')) {
            const style = document.createElement('style');
            style.id = 'skeletonStyles';
            style.textContent = `
                .skeleton {
                    background: linear-gradient(90deg, var(--border) 25%, var(--surface-2) 50%, var(--border) 75%);
                    background-size: 200% 100%;
                    animation: skeletonLoading 1.5s infinite;
                }
                @keyframes skeletonLoading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .skeleton-card {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }
        
        return skeletonHtml;
    }
    
    function generateSpinner() {
        return `
            <div class="loader-spinner-container" style="display:flex;justify-content:center;align-items:center;padding:40px;">
                <div class="loader-spinner" style="width:40px;height:40px;border:3px solid var(--primary-200);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    }
    
    function generateProgressBar() {
        return `
            <div class="loader-progress-container" style="padding:20px;">
                <div style="height:4px;background:var(--border);border-radius:4px;overflow:hidden;">
                    <div class="loader-progress-bar" style="width:0%;height:100%;background:var(--gradient);border-radius:4px;animation:progress 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
            <style>
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
            </style>
        `;
    }
    
    function showButtonLoader(button, loadingText = 'Please wait...') {
        if (!button) return;
        
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span class="btn-loader"></span> ${loadingText}`;
        button.style.opacity = '0.7';
        button.style.cursor = 'not-allowed';
        
        if (!document.getElementById('btnLoaderStyle')) {
            const style = document.createElement('style');
            style.id = 'btnLoaderStyle';
            style.textContent = `
                .btn-loader {
                    display: inline-block;
                    width: 14px;
                    height: 14px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: btnSpin 0.6s linear infinite;
                    margin-right: 6px;
                    vertical-align: middle;
                }
                @keyframes btnSpin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function hideButtonLoader(button) {
        if (!button) return;
        
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || button.innerHTML;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
    
    function showGlobalLoader() {
        let loader = document.getElementById('globalLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.className = 'global-loader';
            loader.innerHTML = `
                <div class="global-loader-content">
                    <div class="global-loader-spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(loader);
            
            const style = document.createElement('style');
            style.textContent = `
                .global-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                }
                .global-loader-content {
                    background: var(--surface);
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }
                .global-loader-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--primary-200);
                    border-top-color: var(--primary);
                    border-radius: 50%;
                    animation: globalSpin 0.8s linear infinite;
                    margin: 0 auto 15px;
                }
                @keyframes globalSpin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        loader.style.display = 'flex';
    }
    
    function hideGlobalLoader() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    // Public API
    return {
        init,
        showLoader,
        hideLoader,
        showSkeleton,
        hideSkeleton,
        showButtonLoader,
        hideButtonLoader,
        showGlobalLoader,
        hideGlobalLoader,
        hidePageLoader
    };
})();

window.FindERLoaders = Loaders;