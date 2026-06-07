/**
 * FIND-ER Authentication Module
 * Handles login, registration, and session management
 */

const Auth = (function() {
    
    // Pre-computed password hashes for demo users
    // Password: "student123" -> hash
    const STUDENT_PASSWORD_HASH = '5d41402abc4b2a76b9719d911017c592';
    // Password: "Admin@Finder2025" -> hash
    const ADMIN_PASSWORD_HASH = 'b2d4c8f1a9e3d7c5b0f2e6a4d8c2b6f0e4a8d2c6b0f4e8a2d6c0b4f8e2a6d4c8';
    
    // Initialize auth module
    function init() {
        setupLoginForm();
        setupRegisterForm();
        setupForgotPassword();
        checkAuthRedirect();
        setupPasswordToggle();
    }
    
    // Hash password function (SHA-256)
    async function hashPassword(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Setup password toggle visibility
    function setupPasswordToggle() {
        const toggleBtns = document.querySelectorAll('.password-toggle');
        
        toggleBtns.forEach(btn => {
            btn.removeEventListener('click', handlePasswordToggle);
            btn.addEventListener('click', handlePasswordToggle);
        });
    }
    
    function handlePasswordToggle(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Change the button icon/text
        const btn = e.currentTarget;
        btn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    }
    
    // Setup login form
    function setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;
        
        const studentBtn = document.querySelector('.student-role');
        const adminBtn = document.querySelector('.admin-role');
        
        if (studentBtn) studentBtn.type = 'button';
        if (adminBtn) adminBtn.type = 'button';
        
        // Create error element if not exists
        let errorEl = document.getElementById('loginInlineError');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.id = 'loginInlineError';
            errorEl.style.cssText = `
                margin-top: 10px;
                color: #dc2626;
                font-size: 14px;
                text-align: center;
                display: none;
                padding: 10px;
                background: #fee2e2;
                border-radius: 8px;
            `;
            loginForm.insertAdjacentElement('afterend', errorEl);
        }
        
        function setError(msg) {
            if (!msg) {
                errorEl.textContent = '';
                errorEl.style.display = 'none';
                return;
            }
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
        }
        
        // Student login
        if (studentBtn) {
            studentBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const userId = document.getElementById('userId');
                const password = document.getElementById('password');
                const loginValue = (userId?.value || '').trim();
                const passwordVal = (password?.value || '').trim();
                
                setError('');
                
                if (!loginValue) {
                    setError('Please enter your name or College ID.');
                    userId?.focus();
                    return;
                }
                if (!passwordVal) {
                    setError('Please enter your password.');
                    password?.focus();
                    return;
                }
                
                // Show loading state
                const originalText = studentBtn.innerHTML;
                studentBtn.innerHTML = '<span style="opacity:0.7">⏳ Signing in...</span>';
                studentBtn.disabled = true;
                studentBtn.style.opacity = '0.7';
                
                try {
                    const users = Storage.getUsers();
                    const enteredHash = await hashPassword(passwordVal);
                    
                    // Find user by name OR collegeId
                    const matchedUser = users.find(u => {
                        const matchesId = u.collegeId?.toLowerCase() === loginValue.toLowerCase();
                        const matchesName = u.name?.toLowerCase() === loginValue.toLowerCase();
                        return (matchesId || matchesName) && 
                               u.role === 'student' && 
                               u.passwordHash === enteredHash;
                    });
                    
                    // Check demo student account
                    let studentUser = matchedUser;
                    if (!studentUser && loginValue.toLowerCase() === 'student' && passwordVal === 'student123') {
                        studentUser = {
                            id: 'demo_student',
                            name: 'Student User',
                            collegeId: 'STU001',
                            email: 'student@college.edu',
                            department: 'CSE',
                            year: '3rd Year',
                            role: 'student',
                            memberSince: new Date().toISOString()
                        };
                        // Save to storage for future logins
                        Storage.createUser(studentUser);
                    }
                    
                    if (studentUser) {
                        Storage.setCurrentUser(studentUser);
                        // Small delay to show loading state
                        setTimeout(() => {
                            window.location.href = 'dashboard/student-dashboard.html';
                        }, 500);
                        return;
                    }
                    
                    setError('Invalid student credentials. Use "student" / "student123"');
                    
                } catch (err) {
                    console.error('Login error:', err);
                    setError('Login failed. Please try again.');
                } finally {
                    // Reset button
                    studentBtn.innerHTML = originalText;
                    studentBtn.disabled = false;
                    studentBtn.style.opacity = '1';
                }
            });
        }
        
        // Admin login
        if (adminBtn) {
            adminBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                
                const userId = document.getElementById('userId');
                const password = document.getElementById('password');
                const loginValue = (userId?.value || '').trim();
                const passwordVal = (password?.value || '').trim();
                
                setError('');
                
                if (!loginValue) {
                    setError('Please enter your Admin ID.');
                    userId?.focus();
                    return;
                }
                if (!passwordVal) {
                    setError('Please enter your password.');
                    password?.focus();
                    return;
                }
                
                // Show loading state
                const originalText = adminBtn.innerHTML;
                adminBtn.innerHTML = '<span style="opacity:0.7">⏳ Signing in...</span>';
                adminBtn.disabled = true;
                adminBtn.style.opacity = '0.7';
                
                try {
                    const enteredHash = await hashPassword(passwordVal);
                    
                    // Check admin credentials
                    if (loginValue === 'admin' && passwordVal === 'Admin@Finder2025') {
                        const adminUser = {
                            id: 'admin_demo',
                            name: 'Administrator',
                            collegeId: 'admin',
                            role: 'admin',
                            email: 'admin@college.edu',
                            department: 'Administration',
                            memberSince: new Date().toISOString()
                        };
                        Storage.setCurrentUser(adminUser);
                        setTimeout(() => {
                            window.location.href = 'dashboard/admin-dashboard.html';
                        }, 500);
                        return;
                    }
                    
                    // Also check stored admin users
                    const users = Storage.getUsers();
                    const matchedAdmin = users.find(u => {
                        const matchesId = u.collegeId?.toLowerCase() === loginValue.toLowerCase();
                        const matchesName = u.name?.toLowerCase() === loginValue.toLowerCase();
                        return (matchesId || matchesName) && 
                               u.role === 'admin' && 
                               u.passwordHash === enteredHash;
                    });
                    
                    if (matchedAdmin) {
                        Storage.setCurrentUser(matchedAdmin);
                        setTimeout(() => {
                            window.location.href = 'dashboard/admin-dashboard.html';
                        }, 500);
                        return;
                    }
                    
                    setError('Invalid admin credentials. Use "admin" / "Admin@Finder2025"');
                    
                } catch (err) {
                    console.error('Admin login error:', err);
                    setError('Login failed. Please try again.');
                } finally {
                    adminBtn.innerHTML = originalText;
                    adminBtn.disabled = false;
                    adminBtn.style.opacity = '1';
                }
            });
        }
        
        // Check for registration success message
        const registerSuccess = sessionStorage.getItem('TraceIt_registerSuccess');
        if (registerSuccess) {
            setTimeout(() => {
                const toast = document.createElement('div');
                toast.textContent = registerSuccess;
                toast.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #10b981;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    z-index: 10000;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                `;
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }, 100);
            sessionStorage.removeItem('TraceIt_registerSuccess');
        }
    }
    
    // Setup register form
    function setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;
        
        // Step navigation functions
        window.showStep = function(stepNumber) {
            const steps = document.querySelectorAll('.register-step');
            const progressSteps = document.querySelectorAll('.progress-step');
            
            steps.forEach(step => step.classList.remove('active'));
            progressSteps.forEach(step => step.classList.remove('active'));
            
            const currentStep = document.getElementById('step' + stepNumber);
            if (currentStep) currentStep.classList.add('active');
            
            const currentProgress = document.querySelector(`.progress-step[data-step="${stepNumber}"]`);
            if (currentProgress) currentProgress.classList.add('active');
        };
        
        window.nextStep = function(step) {
            if (step === 2) {
                const step1Inputs = document.querySelectorAll('#step1 input.auth-input');
                const fullName = step1Inputs[0];
                const collegeId = step1Inputs[1];
                
                if (!fullName || !fullName.value.trim()) {
                    alert('Please enter your full name');
                    fullName?.focus();
                    return false;
                }
                
                if (!collegeId || !collegeId.value.trim()) {
                    alert('Please enter your College ID');
                    collegeId?.focus();
                    return false;
                }
                
                if (collegeId.value.trim().length < 3) {
                    alert('College ID should be at least 3 characters');
                    collegeId.focus();
                    return false;
                }
            }
            
            if (step === 3) {
                const department = document.querySelector('#step2 select:first-of-type');
                const year = document.querySelector('#step2 select:last-of-type');
                const email = document.querySelector('#step2 input[type="email"]');
                
                if (department && (!department.value || department.value === '')) {
                    alert('Please select your department');
                    department.focus();
                    return false;
                }
                
                if (year && (!year.value || year.value === '')) {
                    alert('Please select your year of study');
                    year.focus();
                    return false;
                }
                
                if (email && !email.value.trim()) {
                    alert('Please enter your college email');
                    email.focus();
                    return false;
                }
                
                if (email && email.value.trim() && !email.value.includes('@')) {
                    alert('Please enter a valid email address');
                    email.focus();
                    return false;
                }
            }
            
            showStep(step);
        };
        
        window.prevStep = function(step) {
            showStep(step);
        };
        
        // Password strength indicator
        const passwordInput = document.getElementById('regPassword');
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                let strength = 0;
                const val = this.value;
                if (val.length >= 6) strength++;
                if (val.match(/[a-z]/) && val.match(/[A-Z]/)) strength++;
                if (val.match(/\d/)) strength++;
                if (val.match(/[^a-zA-Z\d]/)) strength++;
                
                const strengthBars = document.querySelectorAll('.strength-bar');
                strengthBars.forEach((bar, i) => {
                    if (i < strength) {
                        if (strength <= 2) bar.style.background = '#ef4444';
                        else if (strength === 3) bar.style.background = '#f59e0b';
                        else bar.style.background = '#10b981';
                    } else {
                        bar.style.background = '#e2e8f0';
                    }
                });
            });
        }
        
        // Form submission
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const step1Inputs = document.querySelectorAll('#step1 input.auth-input');
            const nameInput = step1Inputs[0];
            const collegeIdInput = step1Inputs[1];
            
            const departmentSelect = document.querySelector('#step2 select:first-of-type');
            const yearSelect = document.querySelector('#step2 select:last-of-type');
            const emailInput = document.querySelector('#step2 input[type="email"]');
            
            const passwordInput = document.getElementById('regPassword');
            const confirmPasswordInput = document.getElementById('confirmPassword');
            const checkboxes = document.querySelectorAll('.auth-checkbox-group input[type="checkbox"]');
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            
            const name = (nameInput?.value || '').trim();
            const collegeId = (collegeIdInput?.value || '').trim();
            const department = (departmentSelect?.value || '').trim();
            const year = (yearSelect?.value || '').trim();
            const email = (emailInput?.value || '').trim();
            const password = (passwordInput?.value || '').trim();
            const confirmPassword = (confirmPasswordInput?.value || '').trim();
            
            // Validation
            if (!name) {
                alert('Please enter your full name.');
                showStep(1);
                nameInput?.focus();
                return;
            }
            if (!collegeId) {
                alert('Please enter your College ID.');
                showStep(1);
                collegeIdInput?.focus();
                return;
            }
            if (!department) {
                alert('Please select your department.');
                showStep(2);
                departmentSelect?.focus();
                return;
            }
            if (!year) {
                alert('Please select your year of study.');
                showStep(2);
                yearSelect?.focus();
                return;
            }
            if (!email || !email.includes('@')) {
                alert('Please enter a valid college email.');
                showStep(2);
                emailInput?.focus();
                return;
            }
            if (!password || password.length < 6) {
                alert('Password must be at least 6 characters.');
                showStep(3);
                passwordInput?.focus();
                return;
            }
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                showStep(3);
                confirmPasswordInput?.focus();
                return;
            }
            
            for (let checkbox of checkboxes) {
                if (!checkbox.checked) {
                    alert('Please agree to the Terms and Conditions.');
                    showStep(3);
                    return;
                }
            }
            
            // Check if user exists
            const existingUser = Storage.getUserByCollegeId(collegeId);
            if (existingUser) {
                alert('This College ID is already registered. Please login.');
                return;
            }
            
            // Show loading
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Creating Account...';
            submitBtn.disabled = true;
            
            const passwordHash = await hashPassword(password);
            
            const newUser = {
                id: `user_${Date.now()}`,
                name,
                collegeId,
                department,
                year,
                email,
                passwordHash,
                role: 'student',
                memberSince: new Date().toISOString()
            };
            
            Storage.createUser(newUser);
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            sessionStorage.setItem('TraceIt_registerSuccess', 'Registration successful! Please login.');
            window.location.href = 'login.html';
        });
        
        // Show first step
        showStep(1);
    }
    
    // Setup forgot password modal
    function setupForgotPassword() {
        const forgotLink = document.getElementById('forgotPasswordLink');
        if (!forgotLink) return;
        
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Please visit the Admin Block, Room 205 to reset your password.');
        });
    }
    
    // Check if user should be redirected based on auth state
    function checkAuthRedirect() {
        const currentUser = Storage.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();
        const isAuthPage = currentPage === 'login.html' || currentPage === 'register.html';
        
        if (currentUser && isAuthPage) {
            if (currentUser.role === 'admin') {
                window.location.replace('dashboard/admin-dashboard.html');
            } else {
                if (!Storage.isOnboarded() && currentPage !== 'onboarding.html') {
                    window.location.replace('dashboard/onboarding.html');
                } else {
                    window.location.replace('dashboard/student-dashboard.html');
                }
            }
        }
    }
    
    // Logout function
    function logout() {
        Storage.clearCurrentUser();
        window.location.href = 'login.html';
    }
    
    // Public API
    return {
        init,
        logout,
        hashPassword,
        simpleHash: hashPassword
    };
})();

// Make available globally
window.TraceItAuth = Auth;