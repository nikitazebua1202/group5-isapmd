$(document).ready(function() {
    const $signupForm = $('.signup-form');
    
    $signupForm.on('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const fullName = $('input[type="text"]').val().trim();
        const email = $('input[type="email"]').val().trim();
        const password = $('input[type="password"]').eq(0).val();
        const confirmPassword = $('input[type="password"]').eq(1).val();
        
        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }
        
        // Check if user already exists
        const users = getUsers();
        if (users.some(user => user.email === email)) {
            showMessage('An account with this email already exists', 'error');
            return;
        }
        
        // Create new user object
        const newUser = {
            id: Date.now().toString(),
            fullName: fullName,
            email: email,
            password: password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
            addresses: [
                {
                    id: 'addr1',
                    type: 'Home',
                    street: '123 Blossom Street',
                    city: 'Flower City',
                    zipCode: 'FC 12345',
                    phone: '(555) 123-4567',
                    isDefault: true
                }
            ],
            orders: []
        };
        
        // Save user
        users.push(newUser);
        saveUsers(users);
        
        showMessage('Account created successfully! Redirecting to login...', 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
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