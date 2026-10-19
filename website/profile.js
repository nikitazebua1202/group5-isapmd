$(document).ready(function() {
    // Initialize profile page
    checkAuth();
    loadProfileData();
    initProfileHandlers();
});

// ============================
// AUTHENTICATION CHECK
// ============================

function checkAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
}

function getCurrentUser() {
    const userData = localStorage.getItem('bloomify_current_user');
    return userData ? JSON.parse(userData) : null;
}

// ============================
// LOAD PROFILE DATA
// ============================

function loadProfileData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Load profile image
    if (user.profilePhoto) {
        $('#profileImg').attr('src', user.profilePhoto);
    } else {
        // Set default placeholder if no photo
        $('#profileImg').attr('src', 'https://via.placeholder.com/150/f5a3ba/ffffff?text=' + 
            (user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'));
    }
    
    // Load user data into form
    $('#name').val(user.fullName || '');
    $('#email').val(user.email || '');
    $('#phone').val(user.phone || '');
}

// ============================
// INITIALIZE HANDLERS
// ============================

function initProfileHandlers() {
    // Photo upload handlers
    $('#uploadBtn').on('click', function() {
        $('#photoUpload').click();
    });
    
    $('.flower-frame').on('click', function(e) {
        // Prevent triggering when clicking the overlay directly
        if (!$(e.target).hasClass('upload-overlay') && 
            !$(e.target).parent().hasClass('upload-overlay')) {
            $('#photoUpload').click();
        }
    });
    
    $('#photoUpload').on('change', handlePhotoUpload);
    
    // Save button handler
    $('#saveBtn').on('click', handleSaveProfile);
    
    // Cancel button handler
    $('#cancelBtn').on('click', function() {
        window.location.href = 'home.html';
    });
    
    // Enter key to save
    $('input').on('keypress', function(e) {
        if (e.which === 13 && !$(this).prop('readonly')) {
            handleSaveProfile();
        }
    });
}

// ============================
// PHOTO UPLOAD HANDLER
// ============================

function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image size must be less than 5MB', 'error');
        return;
    }
    
    // Read and display image
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = event.target.result;
        $('#profileImg').attr('src', imageData);
        
        // Save to user data
        const user = getCurrentUser();
        if (user) {
            user.profilePhoto = imageData;
            
            // Update storage
            localStorage.setItem('bloomify_current_user', JSON.stringify(user));
            
            // Update in users array
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex].profilePhoto = imageData;
                saveUsers(users);
            }
            
            showMessage('Profile photo updated successfully!', 'success');
        }
    };
    reader.readAsDataURL(file);
}

// ============================
// SAVE PROFILE HANDLER
// ============================

function handleSaveProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Get form values
    const name = $('#name').val().trim();
    const phone = $('#phone').val().trim();
    
    // Validate name
    if (!name) {
        showMessage('Please enter your name', 'error');
        $('#name').focus();
        return;
    }
    
    // Update user data
    user.fullName = name;
    user.phone = phone;
    
    // Save to storage
    localStorage.setItem('bloomify_current_user', JSON.stringify(user));
    
    // Update in users array
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveUsers(users);
    }
    
    showMessage('Profile updated successfully!', 'success');
    
    // Redirect to home after 1.5 seconds
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
}

// ============================
// UTILITY FUNCTIONS
// ============================

function getUsers() {
    const usersData = localStorage.getItem('bloomify_users');
    return usersData ? JSON.parse(usersData) : [];
}

function saveUsers(users) {
    localStorage.setItem('bloomify_users', JSON.stringify(users));
}

function showMessage(message, type) {
    // Remove any existing messages
    $('.success-message, .error-message').remove();
    
    // Create message element
    const messageClass = type === 'success' ? 'success-message' : 'error-message';
    const $messageDiv = $('<div></div>')
        .addClass(messageClass)
        .text(message);
    
    $('body').append($messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        $messageDiv.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => $messageDiv.remove(), 300);
    }, 3000);
}