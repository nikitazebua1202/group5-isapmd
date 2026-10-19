// Bouquet data
const bouquets = {
    '1': {
        name: 'Pink White Rose Bouquet',
        image: 'images/bouquet1.jpg',
        standardPrice: '150.000',
        deluxePrice: '350.000'
    },
    '2': {
        name: 'Sun Flower Bouquet',
        image: 'images/bouquet2.jpg',
        standardPrice: '200.000',
        deluxePrice: '420.000'
    },
    '3': {
        name: 'Gerbera Joy Bouquet',
        image: 'images/bouquet3.jpg',
        standardPrice: '150.000',
        deluxePrice: '280.000'
    },
    '4': {
        name: 'Bloom Harmony',
        image: 'images/bouquet4.jpg',
        standardPrice: '225.000',
        deluxePrice: '450.000'
    },
    '5': {
        name: 'Dreams Bouquet',
        image: 'images/bouquet5.jpg',
        standardPrice: '150.000',
        deluxePrice: '270.000'
    },
    '6': {
        name: 'Pink Tulip Bouquet',
        image: 'images/bouquet6.jpg',
        standardPrice: '180.000',
        deluxePrice: '250.000'
    },
    '7': {
        name: 'Exotic Orchid',
        image: 'images/bouquet7.jpg',
        standardPrice: '150.000',
        deluxePrice: '220.000'
    },
    '8': {
        name: 'White Rose Bouquet',
        image: 'images/bouquet8.jpg',
        standardPrice: '200.000',
        deluxePrice: '350.000'
    },
    '9': {
        name: 'Sparkle Bouquet',
        image: 'images/bouquet9.jpg',
        standardPrice: '350.000',
        deluxePrice: '520.000'
    },
    '10': {
        name: 'Bloom White Tulip Bouquet',
        image: 'images/bouquet10.jpg',
        standardPrice: '150.000',
        deluxePrice: '270.000'
    }
};

// Get bouquet ID from URL parameter
function getBouquetId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || '1';
}

// Initialize page
$(document).ready(function() {
    const bouquetId = getBouquetId();
    const bouquet = bouquets[bouquetId];
    
    if (bouquet) {
        // Set bouquet image and alt text
        const $bouquetImage = $('#bouquetImage');
        $bouquetImage.attr({
            src: bouquet.image,
            alt: bouquet.name
        });
        
        // Store prices in form data attributes
        const $form = $('#orderForm');
        $form.attr({
            'data-standard-price': bouquet.standardPrice,
            'data-deluxe-price': bouquet.deluxePrice,
            'data-bouquet-name': bouquet.name
        });
    }
    
    // Set today's date automatically
    const $dateInput = $('#dateDate');
    const today = new Date().toISOString().split('T')[0];
    $dateInput.val(today);
    
    // Update price when bouquet size changes
    $('input[name="bouquetSize"]').on('change', updatePrice);
    
    // Initial price update
    updatePrice();
});

function updatePrice() {
    const $form = $('#orderForm');
    const selectedSize = $('input[name="bouquetSize"]:checked').val();
    const $totalPriceElement = $('#totalPrice');
    
    // Get prices from data attributes
    const standardPrice = $form.attr('data-standard-price') || '150.000';
    const deluxePrice = $form.attr('data-deluxe-price') || '300.000';
    
    if (selectedSize === 'standard') {
        $totalPriceElement.text('Rp' + standardPrice);
    } else if (selectedSize === 'deluxe') {
        $totalPriceElement.text('Rp' + deluxePrice);
    }
}

// Handle form submission
$('#orderForm').on('submit', function(e) {
    e.preventDefault();
    
    const $form = $('#orderForm');
    
    // Get form values
    const recipientName = $('#recipientName').val();
    const deliveryAddress = $('#deliveryAddress').val();
    const deliveryDate = $('#dateDate').val();
    const giftMessage = $('#giftMessage').val();
    const bouquetSize = $('input[name="bouquetSize"]:checked').val();
    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    const totalPrice = $('#totalPrice').text();
    const bouquetName = $form.attr('data-bouquet-name');
    
    // Generate order number
    const orderNumber = 'ORD' + Date.now().toString().slice(-8);
    
    // Store data in sessionStorage
    const orderData = {
        bouquetName,
        recipientName,
        deliveryAddress,
        deliveryDate,
        giftMessage,
        bouquetSize,
        paymentMethod,
        totalPrice,
        orderNumber
    };
    
    sessionStorage.setItem('orderData', JSON.stringify(orderData));
    
    // Redirect to confirmation page
    window.location.href = 'confirm.html';
});