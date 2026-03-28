// Authentication and User Profile Management
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded');
    checkAuthStatus();
});

async function checkAuthStatus() {
    console.log('Checking auth status...');
    
    try {
        const response = await fetch('check_session.php');
        const result = await response.json();
        
        console.log('Auth response:', result);
        
        const userSection = document.getElementById('userSection');
        if (!userSection) {
            console.error('userSection element not found!');
            return;
        }
        
        if (result.logged_in) {
            // User is logged in - show profile dropdown (WITHOUT My Profile option)
            userSection.innerHTML = `
                <div class="user-profile">
                    <button class="profile-btn" onclick="toggleProfileMenu(event)">
                        <i class="fas fa-user-circle"></i>
                     
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="profile-dropdown" id="profileDropdown">
                        <div class="profile-header">
                            <i class="fas fa-user-circle"></i>
                            <div>
                                <strong>${result.user_name}</strong>
                                <span>${result.user_email}</span>
                            </div>
                        </div>
                        <hr>
                        <a href="bookedflights.html">
                            <i class="fas fa-ticket-alt"></i> My Bookings
                        </a>
                        <a href="#" onclick="logout(event)">
                            <i class="fas fa-sign-out-alt"></i> Sign Out
                        </a>
                    </div>
                </div>
            `;
            console.log('Profile dropdown created for:', result.user_name);
        } else {
            // User not logged in - show login button
            userSection.innerHTML = `
                <a href="login.html" class="login-btn">Login</a>
            `;
            console.log('Login button displayed');
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        const userSection = document.getElementById('userSection');
        if (userSection) {
            userSection.innerHTML = `<a href="login.html" class="login-btn">Login</a>`;
        }
    }
}

function toggleProfileMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
        console.log('Dropdown toggled');
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', function(e) {
    if (!e.target.closest('.user-profile')) {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
});

async function logout(event) {
    event.preventDefault();
    
    if (!confirm('Are you sure you want to sign out?')) {
        return;
    }
    
    try {
        const response = await fetch('logout.php', {
            method: 'POST'
        });
        const result = await response.json();
        
        if (result.success) {
            alert('You have been logged out successfully');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error logging out:', error);
        alert('Error logging out. Please try again.');
    }
}

// Check if user is logged in (for protected pages)
async function requireAuth() {
    try {
        const response = await fetch('check_session.php');
        const result = await response.json();
        
        if (!result.logged_in) {
            alert('Please login to access this page');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking auth:', error);
        return false;
    }
}

// Make functions globally accessible
window.toggleProfileMenu = toggleProfileMenu;
window.logout = logout;
window.requireAuth = requireAuth;
