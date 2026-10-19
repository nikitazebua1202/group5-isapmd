$(document).ready(function() {
    // Check authentication
    checkAuth();
    
    // Load all orders
    loadAllOrders();
    
    // Initialize event listeners
    initSearchAndFilters();
    initModal();
});

// ============================
// AUTHENTICATION
// ============================

function checkAuth() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
}

function getCurrentUser() {
    const userData = localStorage.getItem('bloomify_current_user');
    return userData ? JSON.parse(userData) : null;
}

// ============================
// LOAD ORDERS
// ============================

let allOrders = [];
let filteredOrders = [];

function loadAllOrders() {
    const user = getCurrentUser();
    if (!user || !user.orders) {
        allOrders = [];
        filteredOrders = [];
        displayOrders([]);
        updateSummary([]);
        return;
    }
    
    allOrders = user.orders;
    filteredOrders = [...allOrders];
    
    // Sort by newest first by default
    sortOrders('newest');
    
    displayOrders(filteredOrders);
    updateSummary(allOrders);
}

function displayOrders(orders) {
    const $ordersList = $('#ordersList');
    const $emptyState = $('#emptyState');
    
    if (orders.length === 0) {
        $ordersList.empty();
        $emptyState.show();
        return;
    }
    
    $emptyState.hide();
    $ordersList.empty();
    
    orders.forEach(order => {
        const canCancel = ['order-make'].includes(order.status);
        const canDelete = ['delivered', 'cancelled'].includes(order.status);
        
        const $orderCard = $(`
            <div class="order-card" data-order-id="${order.id}">
                <div class="order-card-header">
                    <div class="order-card-title">
                        <div class="order-id">#${order.id}</div>
                        <div class="order-date">${formatDate(order.date)}</div>
                    </div>
                    <div class="order-status-badge ${order.status}">
                        <span>${getStatusIcon(order.status)}</span>
                        <span>${capitalizeFirst(order.status)}</span>
                    </div>
                </div>
                
                <div class="order-card-content">
                    <img src="${order.image || 'images/bouquet1.jpg'}" alt="${order.productName}" class="order-image" onerror="this.src='images/bouquet1.jpg'">
                    
                    <div class="order-details">
                        <h3>${order.productName}</h3>
                        ${order.recipient ? `<p><strong>Recipient:</strong> ${order.recipient}</p>` : ''}
                        <p><strong>Size:</strong> ${order.size}</p>
                    </div>
                    
                    <div class="order-price">
                        ${formatPrice(order.totalPrice)}
                    </div>
                </div>
                
                <div class="order-card-actions">
                    ${canCancel ? `
                        <button class="action-btn cancel-btn" data-order-id="${order.id}">
                            <span>❌</span>
                            <span>Cancel Order</span>
                        </button>
                    ` : ''}
                    ${canDelete ? `
                        <button class="action-btn delete-btn" data-order-id="${order.id}">
                            <span>🗑️</span>
                            <span>Delete Order</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `);
        
        $ordersList.append($orderCard);
    });
    
    // Initialize button handlers
    initActionButtons();
}

function updateSummary(orders) {
    const total = orders.length;
    const active = orders.filter(o => ['order-make', 'production', 'shipping'].includes(o.status)).length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    
    $('#totalOrders').text(total);
    $('#activeOrders').text(active);
    $('#deliveredOrders').text(delivered);
    $('#cancelledOrders').text(cancelled);
}

// ============================
// SEARCH AND FILTERS
// ============================

function initSearchAndFilters() {
    // Search functionality
    $('#searchOrders').on('input', function() {
        applyFilters();
    });
    
    // Status filter
    $('#statusFilter').on('change', function() {
        applyFilters();
    });
    
    // Sort functionality
    $('#sortBy').on('change', function() {
        const sortType = $(this).val();
        sortOrders(sortType);
        displayOrders(filteredOrders);
    });
}

function applyFilters() {
    const searchTerm = $('#searchOrders').val().toLowerCase();
    const statusFilter = $('#statusFilter').val();
    
    filteredOrders = allOrders.filter(order => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
            order.id.toLowerCase().includes(searchTerm) ||
            order.productName.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    // Reapply current sort
    const currentSort = $('#sortBy').val();
    sortOrders(currentSort);
    
    displayOrders(filteredOrders);
}

function sortOrders(sortType) {
    switch(sortType) {
        case 'newest':
            filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'oldest':
            filteredOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'price-high':
            filteredOrders.sort((a, b) => b.totalPrice - a.totalPrice);
            break;
        case 'price-low':
            filteredOrders.sort((a, b) => a.totalPrice - b.totalPrice);
            break;
    }
}

// ============================
// ACTION BUTTONS
// ============================

function initActionButtons() {
    // Cancel order
    $('.cancel-btn').on('click', function(e) {
        e.stopPropagation();
        const orderId = $(this).data('order-id');
        handleCancelOrder(orderId);
    });
    
    // Delete order
    $('.delete-btn').on('click', function(e) {
        e.stopPropagation();
        const orderId = $(this).data('order-id');
        handleDeleteOrder(orderId);
    });
}

// ============================
// MODAL
// ============================

function initModal() {
    $('#closeModal').on('click', closeModal);
    $('.modal-overlay').on('click', closeModal);
    
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $('#orderDetailModal').hasClass('active')) {
            closeModal();
        }
    });
}

function closeModal() {
    $('#orderDetailModal').removeClass('active');
    $('body').css('overflow', '');
}

// ============================
// ORDER ACTIONS
// ============================

function handleCancelOrder(orderId) {
    const confirmed = confirm(`Are you sure you want to cancel order #${orderId}?\n\nThis action cannot be undone.`);
    if (!confirmed) return;
    
    const user = getCurrentUser();
    if (!user || !user.orders) return;
    
    const orderIndex = user.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
        showMessage('Order not found', 'error');
        return;
    }
    
    const order = user.orders[orderIndex];
    if (!['order-make'].includes(order.status)) {
        showMessage('This order cannot be cancelled at its current status', 'error');
        return;
    }
    
    user.orders[orderIndex].status = 'cancelled';
    user.orders[orderIndex].cancelledDate = new Date().toISOString();
    
    updateUserData(user);
    
    showMessage(`Order #${orderId} has been cancelled successfully`, 'success');
    
    setTimeout(() => {
        loadAllOrders();
    }, 500);
}

function handleDeleteOrder(orderId) {
    const user = getCurrentUser();
    if (!user || !user.orders) return;
    
    const orderIndex = user.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
        showMessage('Order not found', 'error');
        return;
    }
    
    const order = user.orders[orderIndex];
    if (!['delivered', 'cancelled'].includes(order.status)) {
        showMessage('Only orders with "Delivered" or "Cancelled" status can be deleted', 'error');
        return;
    }
    
    const confirmed = confirm(
        `⚠️ DELETE ORDER\n\n` +
        `Order: #${orderId}\n` +
        `Product: ${order.productName}\n` +
        `Status: ${capitalizeFirst(order.status)}\n\n` +
        `Are you sure you want to permanently delete this order?\n\n` +
        `This action CANNOT be undone!`
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = confirm(
        `⚠️ FINAL CONFIRMATION\n\n` +
        `This will permanently delete order #${orderId}.\n\n` +
        `Click OK to confirm deletion.`
    );
    
    if (!doubleConfirm) return;
    
    user.orders.splice(orderIndex, 1);
    
    updateUserData(user);
    
    showMessage(`Order #${orderId} has been permanently deleted`, 'success');
    
    setTimeout(() => {
        loadAllOrders();
    }, 500);
}

// ============================
// UTILITY FUNCTIONS
// ============================

function updateUserData(user) {
    localStorage.setItem('bloomify_current_user', JSON.stringify(user));
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
        users[userIndex] = user;
        saveUsers(users);
    }
}

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

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
    return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
}

function showMessage(message, type) {
    $('.message').remove();
    
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
    
    setTimeout(() => {
        $messageDiv.css('animation', 'slideOut 0.3s ease');
        setTimeout(() => $messageDiv.remove(), 300);
    }, 3000);
}

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