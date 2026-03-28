// Fixed Signup Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.querySelector('.signup-card form');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fullName = signupForm.querySelector('input[type="text"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelectorAll('input[type="password"]')[0].value;
            const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;
            
            // Validation
            if (!fullName || !email || !password || !confirmPassword) {
                alert('All fields are required');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }
            
            // Disable button and show loading
            const submitBtn = signupForm.querySelector('.signup-btn-main');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Creating Account...';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData();
                formData.append('full_name', fullName);
                formData.append('email', email);
                formData.append('password', password);
                formData.append('confirm_password', confirmPassword);
                
                const response = await fetch('signup_handler.php', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Registration successful! Please login with your credentials.');
                    // Redirect to login page
                    window.location.href = 'login.html';
                } else {
                    alert(result.message);
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});