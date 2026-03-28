// Auth Form Handler (Login & Signup) with Inline Errors
document.addEventListener('DOMContentLoaded', function() {

    // ===== Helper functions =====
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(input, message) {
        let errorElem = input.nextElementSibling;
        if (!errorElem || !errorElem.classList.contains('error-message')) {
            errorElem = document.createElement('div');
            errorElem.classList.add('error-message');
            input.parentNode.insertBefore(errorElem, input.nextSibling);
        }
        errorElem.textContent = message;
    }

    function clearError(input) {
        const errorElem = input.nextElementSibling;
        if (errorElem && errorElem.classList.contains('error-message')) {
            errorElem.textContent = '';
        }
    }

    function clearAllErrors(form) {
        form.querySelectorAll('.error-message').forEach(e => e.textContent = '');
    }

    // ===== LOGIN FORM =====
    const loginForm = document.querySelector('.login-card form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors(loginForm);

            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            let hasError = false;

            if (!email) {
                showError(emailInput, 'Email is required');
                hasError = true;
            } else if (!isValidEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
                hasError = true;
            }

            if (!password) {
                showError(passwordInput, 'Password is required');
                hasError = true;
            }

            if (hasError) return;

            try {
                const formData = new FormData();
                formData.append('email', email);
                formData.append('password', password);

                const response = await fetch('login_handler.php', { method: 'POST', body: formData });
                const result = await response.json();

                if (result.success) {
                    window.location.href = (result.data && result.data.redirect) ? result.data.redirect : 'index.html';
                } else {
                    showError(passwordInput, result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                showError(passwordInput, 'An error occurred. Please try again.');
            }
        });
    }

    // ===== SIGNUP FORM =====
    const signupForm = document.querySelector('.signup-card form');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors(signupForm);

            const fullNameInput = signupForm.querySelector('input[type="text"]');
            const emailInput = signupForm.querySelector('input[type="email"]');
            const passwordInput = signupForm.querySelectorAll('input[type="password"]')[0];
            const confirmPasswordInput = signupForm.querySelectorAll('input[type="password"]')[1];

            const fullName = fullNameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            let hasError = false;

            if (!fullName) {
                showError(fullNameInput, 'Full name is required');
                hasError = true;
            }

            if (!email) {
                showError(emailInput, 'Email is required');
                hasError = true;
            } else if (!isValidEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
                hasError = true;
            }

            if (!password) {
                showError(passwordInput, 'Password is required');
                hasError = true;
            } else if (password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters');
                hasError = true;
            }

            if (!confirmPassword) {
                showError(confirmPasswordInput, 'Please confirm your password');
                hasError = true;
            } else if (password !== confirmPassword) {
                showError(confirmPasswordInput, 'Passwords do not match');
                hasError = true;
            }

            if (hasError) return;

            try {
                const formData = new FormData();
                formData.append('full_name', fullName);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('confirm_password', confirmPassword);

                const response = await fetch('signup_handler.php', { method: 'POST', body: formData });
                const result = await response.json();

                if (result.success) {
                    signupForm.reset(); // Reset form
                    window.location.href = (result.data && result.data.redirect) ? result.data.redirect : 'index.html';
                } else {
                    showError(emailInput, result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                showError(emailInput, 'An error occurred. Please try again.');
            }
        });
    }

});
