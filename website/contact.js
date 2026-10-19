$(document).ready(function() {
    // Initialize contact form after DOM is loaded
    initContactForm();
});

function initContactForm() {
    const $contactForm = $('.contact-form');
    
    if ($contactForm.length === 0) return;

    // Form fields
    const $nameInput = $contactForm.find('input[name="name"]');
    const $emailInput = $contactForm.find('input[name="email"]');
    const $phoneInput = $contactForm.find('input[name="phone"]');
    const $subjectInput = $contactForm.find('input[name="subject"]');
    const $messageInput = $contactForm.find('textarea[name="message"]');
    const $charCounter = $('.char-counter');

    // Event Listeners
    
    // Form submission
    $contactForm.on('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });

    // Focus events - clear errors when user focuses on field
    const $allInputs = $contactForm.find('input, textarea');
    $allInputs.on('focus', function() {
        clearFieldError($(this));
    });
    
    // Blur events - validate on blur
    $allInputs.on('blur', function() {
        validateField($(this));
    });

    // Keypress event - character counter for message
    if ($messageInput.length && $charCounter.length) {
        $messageInput.on('input', function() {
            updateCharCounter();
        });
    }

    // Change event for subject dropdown (if exists)
    if ($subjectInput.length && $subjectInput.prop('tagName') === 'SELECT') {
        $subjectInput.on('change', function() {
            validateField($(this));
        });
    }

    // Handle Form Submission
    function handleFormSubmit() {
        // Get form values
        const formData = {
            name: $nameInput.val().trim(),
            email: $emailInput.val().trim(),
            phone: $phoneInput.length ? $phoneInput.val().trim() : '',
            subject: $subjectInput.val().trim(),
            message: $messageInput.val().trim()
        };

        // Validate all fields
        let isValid = true;
        
        if (!validateName(formData.name)) isValid = false;
        if (!validateEmail(formData.email)) isValid = false;
        if ($phoneInput.length && formData.phone && !validatePhone(formData.phone)) isValid = false;
        if (!validateSubject(formData.subject)) isValid = false;
        if (!validateMessage(formData.message)) isValid = false;

        if (!isValid) return;

        // Check for duplicate submission (same email in last 5 minutes)
        if (isDuplicateSubmission(formData.email)) {
            showMessage('You have already submitted a message recently. Please wait before submitting again.', 'error');
            return;
        }

        // Save contact message
        const messageId = saveContactMessage(formData);

        // Show success modal
        showSuccessModal(messageId, formData.email);

        // Reset form
        $contactForm[0].reset();
        if ($charCounter.length) {
            $charCounter.text('0 / 500');
        }
    }

    // Validation Functions
    
    function validateName(name) {
        if (!name) {
            showFieldError($nameInput, 'Please enter your name');
            return false;
        }
        
        if (name.length < 3) {
            showFieldError($nameInput, 'Name must be at least 3 characters');
            return false;
        }
        
        clearFieldError($nameInput);
        return true;
    }

    function validateEmail(email) {
        if (!email) {
            showFieldError($emailInput, 'Please enter your email');
            return false;
        }
        
        if (!isValidEmail(email)) {
            showFieldError($emailInput, 'Please enter a valid email address');
            return false;
        }
        
        clearFieldError($emailInput);
        return true;
    }

    function validatePhone(phone) {
        if (phone && !isValidPhone(phone)) {
            showFieldError($phoneInput, 'Please enter a valid phone number (10+ digits)');
            return false;
        }
        
        clearFieldError($phoneInput);
        return true;
    }

    function validateSubject(subject) {
        if (!subject) {
            showFieldError($subjectInput, 'Please enter a subject');
            return false;
        }
        
        if (subject.length < 5) {
            showFieldError($subjectInput, 'Subject must be at least 5 characters');
            return false;
        }
        
        clearFieldError($subjectInput);
        return true;
    }

    function validateMessage(message) {
        if (!message) {
            showFieldError($messageInput, 'Please enter your message');
            return false;
        }
        
        if (message.length < 20) {
            showFieldError($messageInput, 'Message must be at least 20 characters');
            return false;
        }
        
        clearFieldError($messageInput);
        return true;
    }

    function validateField($field) {
        const value = $field.val().trim();
        
        switch($field.attr('name')) {
            case 'name':
                return validateName(value);
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'subject':
                return validateSubject(value);
            case 'message':
                return validateMessage(value);
            default:
                return true;
        }
    }

    // Character Counter
    function updateCharCounter() {
        const currentLength = $messageInput.val().length;
        const maxLength = 500;
        $charCounter.text(`${currentLength} / ${maxLength}`);
        
        if (currentLength > maxLength) {
            $charCounter.css('color', '#dc3545');
        } else if (currentLength >= maxLength * 0.9) {
            $charCounter.css('color', '#ffc107');
        } else {
            $charCounter.css('color', '#6a2c3e');
        }
    }
}

// Helper Functions

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\d{10,}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

function showFieldError($field, message) {
    // Remove existing error
    clearFieldError($field);
    
    // Add error class to field
    $field.addClass('error');
    
    // Create error message element
    const $errorDiv = $('<div></div>')
        .addClass('field-error')
        .text(message);
    
    // Insert error after field
    $field.after($errorDiv);
}

function clearFieldError($field) {
    $field.removeClass('error');
    $field.siblings('.field-error').remove();
}

function isDuplicateSubmission(email) {
    const messages = getContactMessages();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return messages.some(msg => 
        msg.email === email && 
        new Date(msg.submittedAt) > fiveMinutesAgo
    );
}

function saveContactMessage(contactData) {
    const messages = getContactMessages();
    const messageId = 'MSG-' + Date.now().toString().slice(-8);
    
    const newMessage = {
        id: messageId,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone || 'Not provided',
        subject: contactData.subject,
        message: contactData.message,
        status: 'unread',
        submittedAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    localStorage.setItem('bloomifycontact', JSON.stringify(messages));
    
    return messageId;
}

function getContactMessages() {
    const messagesData = localStorage.getItem('bloomifycontact');
    return messagesData ? JSON.parse(messagesData) : [];
}

function showSuccessModal(messageId, email) {
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
        <div style="font-size: 4em; margin-bottom: 20px;">✉️</div>
        <h2 style="color: #b3005e; margin-bottom: 15px; font-size: 1.8em;">Message Sent Successfully!</h2>
        <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
            Thank you for contacting us! We've received your message and will respond to 
            <strong>${email}</strong> within 24-48 hours.
        </p>
        <div style="background: linear-gradient(135deg, #ffe6f2 0%, #ffd6e7 100%); 
                    padding: 20px; 
                    border-radius: 15px; 
                    margin-bottom: 25px;">
            <p style="color: #666; margin-bottom: 10px; font-size: 0.9em;">Your Reference Number</p>
            <p style="color: #b3005e; 
                      font-size: 1.5em; 
                      font-weight: 700; 
                      letter-spacing: 2px; 
                      font-family: monospace;">${messageId}</p>
        </div>
        <p style="color: #999; font-size: 0.85em; margin-bottom: 25px; line-height: 1.5;">
            Please save this reference number for future correspondence.
        </p>
        <button onclick="copyReferenceNumber('${messageId}')" 
                style="background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
                       color: white;
                       border: none;
                       padding: 12px 30px;
                       border-radius: 25px;
                       font-size: 1em;
                       font-weight: 600;
                       cursor: pointer;
                       margin-right: 10px;
                       transition: all 0.3s ease;">
            📋 Copy Reference
        </button>
        <button onclick="closeSuccessModal()" 
                style="background: white;
                       color: #e91e63;
                       border: 2px solid #e91e63;
                       padding: 12px 30px;
                       border-radius: 25px;
                       font-size: 1em;
                       font-weight: 600;
                       cursor: pointer;
                       transition: all 0.3s ease;">
            Close
        </button>
    `);

    $overlay.append($modal);
    $('body').append($overlay);

    // Store overlay reference for closing
    window.currentModalOverlay = $overlay;
}

// Global functions for modal buttons
window.copyReferenceNumber = function(refNumber) {
    const $tempInput = $('<input>').val(refNumber);
    $('body').append($tempInput);
    $tempInput.select();
    document.execCommand('copy');
    $tempInput.remove();
    
    showMessage('Reference number copied to clipboard!', 'success');
};

window.closeSuccessModal = function() {
    if (window.currentModalOverlay) {
        window.currentModalOverlay.css('animation', 'fadeOut 0.3s ease');
        setTimeout(() => {
            window.currentModalOverlay.remove();
        }, 300);
    }
};

function showMessage(message, type) {
    // Remove any existing messages
    $('.message').remove();

    // Set styles based on type
    let bgColor, textColor, borderColor;
    if (type === 'success') {
        bgColor = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
        textColor = '#155724';
        borderColor = '#28a745';
    } else if (type === 'error') {
        bgColor = 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
        textColor = '#721c24';
        borderColor = '#dc3545';
    } else {
        bgColor = 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)';
        textColor = '#0c5460';
        borderColor = '#17a2b8';
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
            background: bgColor,
            color: textColor,
            border: `2px solid ${borderColor}`
        });

    $('body').append($messageDiv);

    // Remove after 4 seconds
    setTimeout(() => {
        $messageDiv.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => {
            $messageDiv.remove();
        }, 300);
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
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
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
    
    .field-error {
        color: #dc3545;
        font-size: 0.85em;
        margin-top: 5px;
        animation: slideIn 0.3s ease;
    }
    
    input.error,
    textarea.error {
        border-color: #dc3545 !important;
        background: #fff5f5 !important;
    }
`);
$('head').append(style);