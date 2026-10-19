$(document).ready(function() {
    const $loginForm = $('.login-form');
    
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'home.html';
        return;
    }
    
    $loginForm.on('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const email = $('input[type="email"]').val().trim();
        const password = $('input[type="password"]').val();
        
        // Validation
        if (!email || !password) {
            showMessage('Please enter both email and password', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        // Get users from storage
        const users = getUsers();
        
        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showMessage('Invalid email or password', 'error');
            return;
        }
        
        // Save logged in user session
        localStorage.setItem('bloomify_current_user', JSON.stringify(user));
        
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to home page after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    });
});

// Helper Functions
function getUsers() {
    const usersData = localStorage.getItem('bloomify_users');
    return usersData ? JSON.parse(usersData) : [];
}

function getCurrentUser() {
    const userData = localStorage.getItem('bloomify_current_user');
    return userData ? JSON.parse(userData) : null;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

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
            zIndex: 10000,
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            ...styles
        });
    
    $('body').append($messageDiv);
    
    // Remove after 4 seconds
    setTimeout(() => {
        $messageDiv.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => $messageDiv.remove(), 300);
    }, 4000);
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
`);
$('head').append(style);