$(document).ready(function() {
    // Check if user is logged in
    checkAuth();
    
    // Load user data into sidebar
    loadUserData();
    
    // Navigation functionality
    initNavigation();
    
    // Sidebar functionality
    initSidebar();
    
    // Account functionality
    initAccountActions();
    
    // Purchase button animations
    initPurchaseButtons();
    
    // Address selection
    initAddressSelection();
    
    // Handle hash navigation on page load
    handleHashNavigation();
    
    // Check if sidebar should open automatically (after order confirmation)
    checkAutoOpenSidebar();
});

// ============================
// AUTHENTICATION
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
// USER DATA LOADING
// ============================

function loadUserData() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Update account section with user info
    const $accountSection = $('.account-section');
    if ($accountSection.length) {
        // Update account icon with profile photo if available
        const $accountIcon = $accountSection.find('.account-icon');
        if (user.profilePhoto) {
            $accountIcon.html(`<img src="${user.profilePhoto}" alt="Profile" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid #f5a3ba; box-shadow: 0 4px 15px rgba(245, 163, 186, 0.4);">`);
        }
        
        const $accountInfo = $accountSection.find('.account-info');
        $accountInfo.html(`
            <p><strong>${user.fullName}</strong></p>
            <p class="email">${user.email}</p>
        `);
    }
    
    // Load addresses
    loadAddresses(user);
    
    // Load orders
    loadOrders(user);
}

function loadAddresses(user) {
    const $addressContent = $('.address-content');
    if ($addressContent.length === 0 || !user.addresses) return;
    
    // Clear existing addresses except the add button
    const $addBtn = $addressContent.find('.add-address-btn').clone();
    $addressContent.empty();
    
    // Add saved addresses
    user.addresses.forEach(address => {
        const $addressDiv = $('<div></div>')
            .addClass(`saved-address ${address.isDefault ? 'active' : ''}`)
            .html(`
                <h4>${address.type}</h4>
                <p>${address.street}</p>
                <p>${address.city}, ${address.zipCode}</p>
                <p>Phone: ${address.phone}</p>
            `);
        $addressContent.append($addressDiv);
    });
    
    // Re-add the button
    if ($addBtn.length) {
        $addressContent.append($addBtn);
    }
}

function loadOrders(user) {
    const $orderItems = $('.order-items');
    if ($orderItems.length === 0) return;
    
    if (!user.orders || user.orders.length === 0) {
        $orderItems.html(`
            <div style="text-align: center; padding: 30px; color: #6a2c3e;">
                <p style="font-size: 2em; margin-bottom: 10px;">📦</p>
                <p>No orders yet</p>
                <p style="font-size: 0.9em; margin-top: 5px;">Start shopping to see your orders here!</p>
            </div>
        `);
        return;
    }
    
    $orderItems.empty();
    user.orders.forEach(order => {
        const canCancel = ['order-make'].includes(order.status);
        const canDelete = ['delivered', 'cancelled'].includes(order.status);
        
        const cancelBtnClass = canCancel ? '' : 'hidden';
        const deleteBtnClass = canDelete ? '' : 'hidden';
        
        const $orderDiv = $('<div></div>')
            .addClass('order-item')
            .attr('data-order-id', order.id)
            .html(`
                <div class="order-header">
                    <span class="order-number">#${order.id}</span>
                    <span class="order-date">${formatDate(order.date)}</span>
                </div>
                <div class="order-product">
                    <p class="product-name">${order.productName}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status}">${getStatusIcon(order.status)} ${capitalizeFirst(order.status)}</span>
                </div>
                <div class="order-actions">
                    <button class="cancel-order-btn ${cancelBtnClass}" data-order-id="${order.id}">
                        <span>❌</span>
                        <span>Cancel Order</span>
                    </button>
                    <button class="delete-order-btn ${deleteBtnClass}" data-order-id="${order.id}">
                        <span>🗑️</span>
                        <span>Delete Order</span>
                    </button>
                </div>
            `);
        
        $orderItems.append($orderDiv);
    });
    
    // Initialize button handlers
    initCancelOrderButtons();
    initDeleteOrderButtons();
}

// ============================
// CANCEL ORDER FUNCTIONALITY
// ============================

function initCancelOrderButtons() {
    $('.cancel-order-btn:not(.hidden)').off('click').on('click', function(e) {
        e.stopPropagation();
        const orderId = $(this).attr('data-order-id');
        handleCancelOrder(orderId);
    });
}

function handleCancelOrder(orderId) {
    // Show confirmation dialog
    const confirmed = confirm(`Are you sure you want to cancel order #${orderId}?\n\nThis action cannot be undone.`);
    
    if (!confirmed) return;
    
    const user = getCurrentUser();
    if (!user || !user.orders) return;
    
    // Find the order
    const orderIndex = user.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
        showMessage('Order not found', 'error');
        return;
    }
    
    const order = user.orders[orderIndex];
    
    // Check if order can be cancelled
    if (!['order-make'].includes(order.status)) {
        showMessage('This order cannot be cancelled at its current status', 'error');
        return;
    }
    
    // Update order status to cancelled
    user.orders[orderIndex].status = 'cancelled';
    user.orders[orderIndex].cancelledDate = new Date().toISOString();
    
    // Update both current user and users array
    localStorage.setItem('bloomify_current_user', JSON.stringify(user));
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveUsers(users);
    }
    
    // Reload orders display
    loadOrders(user);
    
    // Show success message
    showMessage(`Order #${orderId} has been cancelled successfully`, 'success');
}

// ============================
// DELETE ORDER FUNCTIONALITY
// ============================

function initDeleteOrderButtons() {
    $('.delete-order-btn:not(.hidden)').off('click').on('click', function(e) {
        e.stopPropagation();
        const orderId = $(this).attr('data-order-id');
        handleDeleteOrder(orderId);
    });
}

function handleDeleteOrder(orderId) {
    const user = getCurrentUser();
    if (!user || !user.orders) return;
    
    // Find the order
    const orderIndex = user.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
        showMessage('Order not found', 'error');
        return;
    }
    
    const order = user.orders[orderIndex];
    
    // Check if order can be deleted
    if (!['delivered', 'cancelled'].includes(order.status)) {
        showMessage('Only orders with "Delivered" or "Cancelled" status can be deleted', 'error');
        return;
    }
    
    // Show confirmation dialog with order details
    const confirmed = confirm(
        `⚠️ DELETE ORDER\n\n` +
        `Order: #${orderId}\n` +
        `Product: ${order.productName}\n` +
        `Status: ${capitalizeFirst(order.status)}\n\n` +
        `Are you sure you want to permanently delete this order?\n\n` +
        `This action CANNOT be undone!`
    );
    
    if (!confirmed) return;
    
    // Double confirmation for extra safety
    const doubleConfirm = confirm(
        `⚠️ FINAL CONFIRMATION\n\n` +
        `This will permanently delete order #${orderId}.\n\n` +
        `Click OK to confirm deletion.`
    );
    
    if (!doubleConfirm) return;
    
    // Remove the order from the array
    user.orders.splice(orderIndex, 1);
    
    // Update both current user and users array
    localStorage.setItem('bloomify_current_user', JSON.stringify(user));
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveUsers(users);
    }
    
    // Reload orders display
    loadOrders(user);
    
    // Show success message
    showMessage(`Order #${orderId} has been permanently deleted`, 'success');
}

// ============================
// NAVIGATION FUNCTIONALITY
// ============================

function initNavigation() {
    // Smooth navigation between sections
    $('.nav-link1').on('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links and sections
        $('.nav-link1').removeClass('active');
        $('.page-section').removeClass('active');
        
        // Add active class to clicked link
        $(this).addClass('active');
        
        // Show corresponding section
        const targetId = $(this).attr('href').substring(1);
        const $targetSection = $('#' + targetId);
        if ($targetSection.length) {
            $targetSection.addClass('active');
        }
        
        // Scroll to top smoothly
        $('html, body').animate({ scrollTop: 0 }, 'smooth');
    });
}

function handleHashNavigation() {
    // Handle hash navigation on page load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const $targetLink = $(`.nav-link1[href="#${hash}"]`);
        if ($targetLink.length) {
            $targetLink.trigger('click');
        }
    }
}

// ============================
// SIDEBAR FUNCTIONALITY
// ============================

function initSidebar() {
    const $sidebar = $('#sidebar');
    const $sidebarOverlay = $('#sidebarOverlay');
    const $menuIcon = $('#menuIcon');
    const $closeSidebarBtn = $('#closeSidebar');

    // Open Sidebar
    $menuIcon.on('click', function() {
        openSidebar();
    });

    // Close Sidebar Function
    function closeSidebarFunc() {
        $sidebar.removeClass('active');
        $sidebarOverlay.removeClass('active');
        $menuIcon.removeClass('active');
        $('body').css('overflow', '');
    }

    // Close sidebar button
    $closeSidebarBtn.on('click', closeSidebarFunc);
    
    // Close sidebar overlay
    $sidebarOverlay.on('click', closeSidebarFunc);

    // Close sidebar on escape key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $sidebar.hasClass('active')) {
            closeSidebarFunc();
        }
    });
}

function openSidebar() {
    const $sidebar = $('#sidebar');
    const $sidebarOverlay = $('#sidebarOverlay');
    const $menuIcon = $('#menuIcon');
    
    // Reload user data when opening sidebar
    loadUserData();
    
    $sidebar.addClass('active');
    $sidebarOverlay.addClass('active');
    $menuIcon.addClass('active');
    $('body').css('overflow', 'hidden');
}

function checkAutoOpenSidebar() {
    const shouldOpen = sessionStorage.getItem('openSidebarOnLoad');
    if (shouldOpen === 'true') {
        sessionStorage.removeItem('openSidebarOnLoad');
        
        // Wait a bit for page to fully load
        setTimeout(() => {
            openSidebar();
            showMessage('Order placed successfully! Your order is now being tracked.', 'success');
        }, 500);
    }
}

// ============================
// ACCOUNT ACTIONS
// ============================

function initAccountActions() {
    // Profile settings link
    const $profileLink = $('a[href="profile.html"]');
    if ($profileLink.length) {
        $profileLink.on('click', function(e) {
            // Allow normal navigation to profile.html
            // No need to prevent default
        });
    }
    
    // Logout functionality
    const $logoutLink = $('a[href="#logout"]');
    if ($logoutLink.length) {
        $logoutLink.on('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // View all orders
    const $viewAllOrdersBtn = $('.view-all-orders-btn');
    if ($viewAllOrdersBtn.length) {
        $viewAllOrdersBtn.on('click', function() {
            showMessage('Full order history feature coming soon!', 'info');
        });
    }
    
    // Add address button
    const $addAddressBtn = $('.add-address-btn');
    if ($addAddressBtn.length) {
        $addAddressBtn.on('click', function() {
            showMessage('Add address feature coming soon!', 'info');
        });
    }
    
    // Initialize order action buttons
    initCancelOrderButtons();
    initDeleteOrderButtons();
}

function handleLogout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout?')) {
        // Clear current user session
        localStorage.removeItem('bloomify_current_user');
        
        showMessage('Logged out successfully!', 'success');
        
        // Redirect to login after short delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ============================
// PURCHASE BUTTONS
// ============================

function initPurchaseButtons() {
    // Purchase button animation
    $('.purchase-btn1').on('click', function() {
        const $this = $(this);
        $this.addClass('clicked');
        setTimeout(() => {
            $this.removeClass('clicked');
        }, 300);
    });
}

// ============================
// ADDRESS SELECTION
// ============================

function initAddressSelection() {
    // Address Selection in sidebar
    $('.saved-address').on('click', function() {
        const $this = $(this);
        
        // Don't process clicks on the add address button
        if ($this.hasClass('add-address-btn')) return;
        
        // Remove active from all addresses
        $('.saved-address').removeClass('active');
        
        // Add active to clicked address
        $this.addClass('active');
        
        // Update user's default address in storage
        const user = getCurrentUser();
        if (user && user.addresses) {
            const addressType = $this.find('h4').text();
            user.addresses.forEach(addr => {
                addr.isDefault = (addr.type === addressType);
            });
            
            // Update both current user and users array
            localStorage.setItem('bloomify_current_user', JSON.stringify(user));
            
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                saveUsers(users);
            }
            
            showMessage(`${addressType} address set as default`, 'success');
        }
    });
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

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getStatusIcon(status) {
    const icons = {
        'order-make': '🛒',
        'production': '🔨',
        'shipping': '🚚',
        'delivered': '✓',
        'cancelled': '✗'
    };
    return icons[status] || '📦';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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
            zIndex: 10000,
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            background: bgColor,
            color: textColor,
            border: `2px solid ${borderColor}`
        });
    
    $('body').append($messageDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        $messageDiv.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => $messageDiv.remove(), 300);
    }, 3000);
}

// ============================
// ANIMATIONS
// ============================

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
`);
$('head').append(style);