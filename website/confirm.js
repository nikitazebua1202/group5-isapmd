$(document).ready(function() {
    const orderDataString = sessionStorage.getItem('orderData');
    
    if (!orderDataString) {
        // If no order data, redirect back to order form
        window.location.href = 'purchase.html';
        return;
    }
    
    const orderData = JSON.parse(orderDataString);
    
    // Format the delivery date
    const dateObj = new Date(orderData.deliveryDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    // Update confirmation page with order data
    $('#confirmRecipientName').text(orderData.recipientName);
    $('#confirmAddress').text(orderData.deliveryAddress);
    $('#confirmDate').text(formattedDate);
    $('#orderNumber').text('#' + orderData.orderNumber);
    
    // Check the appropriate size radio button
    if (orderData.bouquetSize === 'standard') {
        $('#confirmStandard').prop('checked', true);
    } else {
        $('#confirmDeluxe').prop('checked', true);
    }
    
    // Save order to user's order history
    saveOrderToUser(orderData);
});

// Function to save order to user's order history
function saveOrderToUser(orderData) {
    // Get current user
    const currentUserData = localStorage.getItem('bloomify_current_user');
    if (!currentUserData) {
        console.warn('No user logged in');
        return;
    }
    
    const currentUser = JSON.parse(currentUserData);
    
    // Create order object
    const newOrder = {
        id: orderData.orderNumber,
        date: new Date().toISOString(),
        productName: orderData.bouquetName,
        size: orderData.bouquetSize,
        recipient: orderData.recipientName,
        address: orderData.deliveryAddress,
        deliveryDate: orderData.deliveryDate,
        giftMessage: orderData.giftMessage || '',
        paymentMethod: orderData.paymentMethod,
        totalPrice: orderData.totalPrice,
        status: 'order-make'
    };
    
    // Initialize orders array if it doesn't exist
    if (!currentUser.orders) {
        currentUser.orders = [];
    }
    
    // Add new order to the beginning of the array
    currentUser.orders.unshift(newOrder);
    
    // Update current user in localStorage
    localStorage.setItem('bloomify_current_user', JSON.stringify(currentUser));
    
    // Update user in users array
    const usersData = localStorage.getItem('bloomify_users');
    if (usersData) {
        const users = JSON.parse(usersData);
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('bloomify_users', JSON.stringify(users));
        }
    }
    
    // Clear session storage after saving
    sessionStorage.removeItem('orderData');
}

// View Order Details button
$('.view-btn').on('click', function() {
    // Redirect to home page with order tracking visible
    window.location.href = 'home.html#home';
    
    // Set a flag to open sidebar when home page loads
    sessionStorage.setItem('openSidebarOnLoad', 'true');
});