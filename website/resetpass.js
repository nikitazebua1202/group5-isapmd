$(document).ready(function() {
    const $resetForm = $('.reset-form');
    
    $resetForm.on('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = $('input[type="email"]').val().trim();
        const newPassword = $('input[type="password"]').eq(0).val();
        const confirmPassword = $('input[type="password"]').eq(1).val();
        
        // Validation
        if (!email) {
            showMessage('Please enter your email address', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (!newPassword || !confirmPassword) {
            showMessage('Please enter and confirm your new password', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        // Get users from storage
        const users = getUsers();
        
        // Check if user exists
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex === -1) {
            showMessage('No account found with this email address', 'error');
            return;
        }
        
        // Update user's password
        users[userIndex].password = newPassword;
        users[userIndex].passwordResetDate = new Date().toISOString();
        
        // Save updated users
        saveUsers(users);
        
        // Show success message
        showResetSuccess(email);
    });
});

// Helper Functions
function getUsers() {
    const usersData = localStorage.getItem('bloomify_users');
    return usersData ? JSON.parse(usersData) : [];
}

function saveUsers(users) {
    localStorage.setItem('bloomify_users', JSON.stringify(users));
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showResetSuccess(email) {
    // Create modal overlay
    const $overlay = $('<div></div>').css({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        animation: 'fadeIn 0.3s ease'
    });
    
    // Create modal
    const $modal = $('<div></div>').css({
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        animation: 'scaleIn 0.3s ease'
    });
    
    $modal.html(`
        <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
        <h2 style="color: #b3005e; margin-bottom: 15px; font-size: 1.8em;">Password Reset Successful!</h2>
        <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
            Your password for <strong>${email}</strong> has been successfully updated.
        </p>
        <p style="color: #999; font-size: 0.85em; margin-bottom: 25px; line-height: 1.5;">
            You can now log in with your new password.
        </p>
        <button onclick="goToLogin()" style="
            background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        ">Go to Login</button>
    `);
    
    $overlay.append($modal);
    $('body').append($overlay);
}

// Global function for modal button
window.goToLogin = function() {
    window.location.href = 'login.html';
};

function showMessage(message, type) {
    // Remove any existing messages
    $('.message').remove();
    
    // Set styles based on type
    let styles;
    if (type === 'success') {
        styles = {
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            color: '#155724',
            border: '2px solid #28a745'
        };
    } else {
        styles = {
            background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
            color: '#721c24',
            border: '2px solid #dc3545'
        };
    }
    
    // Create message element
    const $messageDiv = $('<div></div>')
        .addClass(`message ${type}`)
        .text(message)
        .css({
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '10px',
            fontWeight: '600',
            zIndex: 10001,
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            ...styles
        });
    
    $('body').append($messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        $messageDiv.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => $messageDiv.remove(), 300);
    }, 3000);
}

// Add animations
const style = $('<style></style>').text(`
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`);
$('head').append(style);