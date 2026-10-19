// Particle emojis for the effect
const flowerEmojis = ['🌸', '🌺', '🌷', '🌹'];
const heartEmojis = ['💖', '💕', '💗', '💓', '💝'];

// Track mouse position
let mouseX = 0;
let mouseY = 0;

// Cursor glow element
const $cursorGlow = $('.cursor-glow');

// Track mouse movement
$(document).on('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Update cursor glow position
    if ($cursorGlow.length) {
        $cursorGlow.css({
            left: mouseX + 'px',
            top: mouseY + 'px'
        });
    }
    
    // Create particles on mouse move
    createParticle(mouseX, mouseY);
    createSparkle(mouseX, mouseY);
});

// Mouse click effect
$(document).on('mousedown', function() {
    if ($cursorGlow.length) {
        $cursorGlow.addClass('clicking');
    }
    // Create burst of hearts on click
    createHeartBurst(mouseX, mouseY);
});

$(document).on('mouseup', function() {
    if ($cursorGlow.length) {
        $cursorGlow.removeClass('clicking');
    }
});

// Create floating flower particles
let particleCount = 0;
const maxParticles = 50;

function createParticle(x, y) {
    // Throttle particle creation
    if (Math.random() > 0.7) return; // Only create particle 30% of the time
    
    const $particle = $('<div></div>')
        .addClass('particle')
        .text(flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)]);
    
    // Random offset from cursor
    const offsetX = (Math.random() - 0.5) * 40;
    const offsetY = (Math.random() - 0.5) * 40;
    
    // Random animation values
    const tx = (Math.random() - 0.5) * 200;
    const ty = -100 - Math.random() * 100;
    const rotate = Math.random() * 720 - 360;
    
    $particle.css({
        left: (x + offsetX) + 'px',
        top: (y + offsetY) + 'px',
        '--tx': tx + 'px',
        '--ty': ty + 'px',
        '--rotate': rotate + 'deg'
    });
    
    $('body').append($particle);
    particleCount++;
    
    // Remove particle after animation
    setTimeout(() => {
        $particle.remove();
        particleCount--;
    }, 3000);
}

// Create sparkle effects
let sparkleCount = 0;
const maxSparkles = 30;

function createSparkle(x, y) {
    if (Math.random() > 0.5) return; // Only create sparkle 50% of the time
    
    const $sparkle = $('<div></div>').addClass('sparkle');
    
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 30;
    
    $sparkle.css({
        left: (x + offsetX) + 'px',
        top: (y + offsetY) + 'px'
    });
    
    $('body').append($sparkle);
    sparkleCount++;
    
    setTimeout(() => {
        $sparkle.remove();
        sparkleCount--;
    }, 1500);
}

// Create heart burst on click
function createHeartBurst(x, y) {
    const heartCount = 8;
    
    for (let i = 0; i < heartCount; i++) {
        const $heart = $('<div></div>')
            .addClass('heart-particle')
            .text(heartEmojis[Math.floor(Math.random() * heartEmojis.length)]);
        
        // Calculate angle for even distribution
        const angle = (Math.PI * 2 / heartCount) * i;
        const distance = 50 + Math.random() * 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        $heart.css({
            left: x + 'px',
            top: y + 'px',
            '--tx': tx + 'px',
            '--ty': ty + 'px'
        });
        
        $('body').append($heart);
        
        setTimeout(() => {
            $heart.remove();
        }, 2500);
    }
}

// Create occasional random floating flowers
function createRandomFloatingFlower() {
    const x = Math.random() * $(window).width();
    const y = Math.random() * $(window).height();
    
    createParticle(x, y);
}

// Add ambient floating flowers every 2 seconds
setInterval(createRandomFloatingFlower, 2000);

// Add smooth cursor movement trail
let trailTimer;
$(document).on('mousemove', function() {
    clearTimeout(trailTimer);
    trailTimer = setTimeout(() => {
        // Create a gentle sparkle trail when mouse stops moving
        if (Math.random() > 0.5) {
            createSparkle(mouseX, mouseY);
        }
    }, 100);
});

console.log('✨ Boutique Mouse Effect Loaded! Move your mouse to see the magic! 🌸');