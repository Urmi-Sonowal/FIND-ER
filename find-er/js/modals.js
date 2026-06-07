/**
 * FIND-ER Modals Module
 * Centralized modal management
 */

const Modals = (function() {
    
    let activeModal = null;
    let modalStack = [];
    let scrollPosition = 0;
    
    function init() {
        setupModalTriggers();
        setupEscapeHandler();
    }
    
    function setupModalTriggers() {
        // Find all elements with data-modal attribute
        const triggers = document.querySelectorAll('[data-modal]');
        
        triggers.forEach(trigger => {
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal(modalId);
                });
            }
        });
    }
    
    function setupEscapeHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && activeModal) {
                closeModal();
            }
        });
    }
    
    function openModal(modalId, options = {}) {
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            // Create modal dynamically if it doesn't exist
            modal = createModal(modalId, options);
        }
        
        if (activeModal) {
            modalStack.push(activeModal);
            closeModalImmediate();
        }
        
        activeModal = modal;
        
        // Save scroll position
        scrollPosition = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.width = '100%';
        
        modal.classList.add('show');
        
        // Dispatch event
        const event = new CustomEvent('modal:open', { detail: { modalId, options } });
        document.dispatchEvent(event);
        
        return modal;
    }
    
    function closeModal() {
        if (!activeModal) return;
        
        activeModal.classList.remove('show');
        
        // Restore scroll position
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition);
        
        // Dispatch event
        const event = new CustomEvent('modal:close', { detail: { modalId: activeModal.id } });
        document.dispatchEvent(event);
        
        // Remove modal after animation
        setTimeout(() => {
            if (activeModal && activeModal.classList && !activeModal.classList.contains('show')) {
                activeModal = null;
            }
        }, 300);
        
        // Restore previous modal if exists
        if (modalStack.length > 0) {
            const previousModal = modalStack.pop();
            setTimeout(() => {
                openModal(previousModal.id);
            }, 350);
        }
    }
    
    function closeModalImmediate() {
        if (!activeModal) return;
        
        activeModal.classList.remove('show');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        activeModal = null;
    }
    
    function createModal(modalId, options) {
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = `find-modal ${options.size ? `modal-${options.size}` : ''} ${options.type ? `modal-${options.type}` : ''}`;
        
        modal.innerHTML = `
            <div class="modal-overlay" data-close="1"></div>
            <div class="modal-container" role="dialog" aria-modal="true">
                <div class="modal-header">
                    ${options.icon ? `<div class="modal-icon">${options.icon}</div>` : ''}
                    <h3 class="modal-title">${Helpers.escapeHtml(options.title || 'TraceIt')}</h3>
                    <button type="button" class="modal-close" aria-label="Close">×</button>
                </div>
                <div class="modal-content">
                    ${options.content || ''}
                </div>
                <div class="modal-actions">
                    ${options.buttons ? options.buttons.map(btn => `
                        <button type="button" class="btn ${btn.class || 'btn-primary'}" data-action="${btn.action || 'close'}">${Helpers.escapeHtml(btn.text || 'OK')}</button>
                    `).join('') : '<button type="button" class="btn btn-primary" data-action="close">OK</button>'}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup close handlers
        const overlay = modal.querySelector('.modal-overlay');
        const closeBtn = modal.querySelector('.modal-close');
        const actionBtns = modal.querySelectorAll('[data-action]');
        
        if (overlay) {
            overlay.addEventListener('click', () => closeModal());
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal());
        }
        
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'close') {
                    closeModal();
                } else if (options.onAction) {
                    options.onAction(action);
                }
            });
        });
        
        return modal;
    }
    
    function showAlert(message, title = 'TraceIt', type = 'info') {
        const iconMap = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        
        return new Promise((resolve) => {
            const modalId = `alert_${Date.now()}`;
            const modal = createModal(modalId, {
                title: title,
                icon: iconMap[type] || 'ℹ',
                content: `<p style="font-size:16px;line-height:1.6;">${Helpers.escapeHtml(message)}</p>`,
                type: type,
                buttons: [{ text: 'OK', class: 'btn-primary', action: 'close' }],
                onAction: () => {
                    closeModal();
                    resolve(true);
                }
            });
            openModal(modalId);
        });
    }
    
    function showConfirm(message, title = 'Confirm', options = {}) {
        return new Promise((resolve) => {
            const modalId = `confirm_${Date.now()}`;
            const modal = createModal(modalId, {
                title: title,
                icon: options.icon || '?',
                content: `<p style="font-size:16px;line-height:1.6;">${Helpers.escapeHtml(message)}</p>`,
                buttons: [
                    { text: options.cancelText || 'Cancel', class: 'btn-outline', action: 'cancel' },
                    { text: options.confirmText || 'Confirm', class: 'btn-primary', action: 'confirm' }
                ],
                onAction: (action) => {
                    closeModal();
                    resolve(action === 'confirm');
                }
            });
            openModal(modalId);
        });
    }
    
    function showPrompt(message, title = 'Enter Value', defaultValue = '') {
        return new Promise((resolve) => {
            const modalId = `prompt_${Date.now()}`;
            let inputValue = defaultValue;
            
            const modal = createModal(modalId, {
                title: title,
                icon: '✏',
                content: `
                    <p style="margin-bottom:16px;">${Helpers.escapeHtml(message)}</p>
                    <input type="text" id="promptInput" class="form-control" value="${Helpers.escapeHtml(defaultValue)}" style="width:100%;">
                `,
                buttons: [
                    { text: 'Cancel', class: 'btn-outline', action: 'cancel' },
                    { text: 'OK', class: 'btn-primary', action: 'confirm' }
                ],
                onAction: (action) => {
                    if (action === 'confirm') {
                        const input = document.getElementById('promptInput');
                        resolve(input ? input.value : inputValue);
                    } else {
                        resolve(null);
                    }
                    closeModal();
                }
            });
            
            openModal(modalId);
            
            // Focus input after modal opens
            setTimeout(() => {
                const input = document.getElementById('promptInput');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 100);
        });
    }
    
    function showLoading(message = 'Loading...', title = 'Please wait') {
        const modalId = `loading_${Date.now()}`;
        const modal = createModal(modalId, {
            title: title,
            icon: '⏳',
            content: `
                <div style="text-align:center;padding:20px;">
                    <div class="loading-spinner" style="width:40px;height:40px;border:3px solid var(--primary-200);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px;"></div>
                    <p>${Helpers.escapeHtml(message)}</p>
                </div>
            `,
            buttons: []
        });
        
        openModal(modalId);
        
        return {
            close: () => closeModal(),
            update: (newMessage) => {
                const content = modal.querySelector('.modal-content p');
                if (content) content.textContent = newMessage;
            }
        };
    }
    
    // Public API
    return {
        init,
        openModal,
        closeModal,
        showAlert,
        showConfirm,
        showPrompt,
        showLoading
    };
})();

window.TraceItModals = Modals;