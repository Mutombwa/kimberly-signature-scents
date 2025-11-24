// ============================================
// Navigation & Mobile Menu
// ============================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Check if user is logged in and update navigation
const updateNavigation = () => {
    const userData = localStorage.getItem('user_data');
    const adminLink = document.getElementById('adminLink');
    const loginLink = document.getElementById('loginLink');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Hide login link if user is logged in
            if (loginLink) {
                loginLink.style.display = 'none';
            }
            
            // Show admin link for admin users only
            if (adminLink && (user.email === 'murerwakimberley@gmail.com' || user.role === 'admin')) {
                adminLink.style.display = 'block';
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
};

// Update navigation on page load
updateNavigation();

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Navbar Background on Scroll
// ============================================
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// ============================================
// Scroll to Top Button
// ============================================
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ============================================
// Intersection Observer for Animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
const animateElements = document.querySelectorAll('.about-card, .product-card, .kit-card, .step-card, .contact-card');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// Registration Form Handling
// ============================================
const registrationForm = document.getElementById('registrationForm');

registrationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        kitChoice: document.getElementById('kitChoice').value
    };
    
    // Validate form
    if (!formData.fullName || !formData.dateOfBirth || !formData.email || 
        !formData.phone || !formData.address || !formData.kitChoice) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Create WhatsApp message
    const message = `
🌟 *NEW INUKA REGISTRATION* 🌟

*Full Name:* ${formData.fullName}
*Date of Birth:* ${formData.dateOfBirth}
*Email:* ${formData.email}
*Phone:* ${formData.phone}
*Address:* ${formData.address}
*Preferred Kit:* ${formData.kitChoice}

Please send payment instructions for processing this registration.
    `.trim();
    
    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/263788171405?text=${encodedMessage}`;
    
    // Show success message
    showNotification('Registration form prepared! Redirecting to WhatsApp...', 'success');
    
    // Redirect to WhatsApp after a short delay
    setTimeout(() => {
        window.open(whatsappURL, '_blank');
        registrationForm.reset();
    }, 1500);
});

// ============================================
// Notification System
// ============================================
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-success i {
            color: #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-error i {
            color: #ef4444;
        }
        
        .notification-info {
            border-left: 4px solid #3b82f6;
        }
        
        .notification-info i {
            color: #3b82f6;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    
    if (!document.querySelector('.notification-styles')) {
        style.className = 'notification-styles';
        document.head.appendChild(style);
    }
    
    // Append notification
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ============================================
// Product Image Modal/Lightbox
// ============================================
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('click', () => {
        const img = card.querySelector('.product-image img');
        const title = card.querySelector('.product-info h3').textContent;
        const description = card.querySelector('.product-info p').textContent;
        
        createImageModal(img.src, title, description);
    });
});

function createImageModal(imageSrc, title, description) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <img src="${imageSrc}" alt="${title}">
            <div class="modal-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
        }
        
        .modal-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            background: white;
            border-radius: 20px;
            padding: 2rem;
            animation: scaleIn 0.3s ease;
        }
        
        .modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #8b5cf6;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
        }
        
        .modal-close:hover {
            background: #7c3aed;
            transform: rotate(90deg);
        }
        
        .modal-content img {
            max-width: 100%;
            max-height: 70vh;
            border-radius: 15px;
            display: block;
            margin: 0 auto;
        }
        
        .modal-info {
            text-align: center;
            margin-top: 1.5rem;
        }
        
        .modal-info h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: #1e293b;
        }
        
        .modal-info p {
            color: #64748b;
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
        
        @media (max-width: 768px) {
            .modal-content {
                max-width: 95%;
                padding: 1rem;
            }
            
            .modal-info h3 {
                font-size: 1.25rem;
            }
        }
    `;
    
    if (!document.querySelector('.modal-styles')) {
        style.className = 'modal-styles';
        document.head.appendChild(style);
    }
    
    // Append modal
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Close modal handlers
    const closeModal = () => {
        modal.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Close on ESC key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

// ============================================
// Newsletter Form
// ============================================
const newsletterForm = document.querySelector('.newsletter-form');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input').value;
        
        if (email) {
            showNotification('Thank you for subscribing to our newsletter!', 'success');
            newsletterForm.reset();
        }
    });
}

// ============================================
// Dynamic Year in Footer
// ============================================
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.innerHTML = footerYear.innerHTML.replace('2025', currentYear);
}

// ============================================
// Loading Animation
// ============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Add fade-in animation to hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        setTimeout(() => {
            heroContent.style.transition = 'opacity 1s ease';
            heroContent.style.opacity = '1';
        }, 100);
    }
});

// ============================================
// Parallax Effect for Hero Section
// ============================================
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = hero.querySelector('.hero-content');
        if (parallax && scrolled < hero.offsetHeight) {
            parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// ============================================
// Scroll Progress Indicator
// ============================================
const createScrollIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-progress';
    indicator.innerHTML = '<div class="scroll-progress-bar"></div>';
    
    const style = document.createElement('style');
    style.textContent = `
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(139, 92, 246, 0.1);
            z-index: 9999;
        }
        
        .scroll-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%);
            width: 0%;
            transition: width 0.1s ease;
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(indicator);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        indicator.querySelector('.scroll-progress-bar').style.width = scrolled + '%';
    });
};

createScrollIndicator();

// ============================================
// Animated Counter for Stats
// ============================================
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
};

// Observe stats section for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ============================================
// FAQ Accordion
// ============================================
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        faqItems.forEach(faq => {
            faq.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// ============================================
// Floating WhatsApp Button
// ============================================
const createWhatsAppButton = () => {
    const whatsappBtn = document.createElement('a');
    whatsappBtn.href = 'https://wa.me/263788171405?text=Hi%2C%20I%27m%20interested%20in%20Kimberly%20Signature%20Scents%20and%20would%20like%20more%20information.';
    whatsappBtn.target = '_blank';
    whatsappBtn.className = 'whatsapp-float';
    whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
    whatsappBtn.setAttribute('aria-label', 'Contact us on WhatsApp');
    
    const style = document.createElement('style');
    style.textContent = `
        .whatsapp-float {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 60px;
            height: 60px;
            background: #25D366;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
            z-index: 998;
            transition: all 0.3s ease;
            animation: whatsappPulse 2s infinite;
        }
        
        .whatsapp-float:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
        }
        
        @keyframes whatsappPulse {
            0%, 100% {
                box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
            }
            50% {
                box-shadow: 0 4px 30px rgba(37, 211, 102, 0.7);
            }
        }
        
        @media (max-width: 768px) {
            .whatsapp-float {
                bottom: 80px;
                right: 20px;
                width: 55px;
                height: 55px;
                font-size: 1.75rem;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(whatsappBtn);
};

createWhatsAppButton();

// ============================================
// Limited Time Offer Countdown
// ============================================
const createCountdownTimer = () => {
    const countdownEl = document.createElement('div');
    countdownEl.className = 'countdown-banner';
    countdownEl.innerHTML = `
        <div class="countdown-content">
            <i class="fas fa-clock"></i>
            <span>Special Offer Ends In:</span>
            <div class="countdown-timer">
                <div class="time-unit">
                    <span id="hours">00</span>
                    <label>Hours</label>
                </div>
                <div class="time-separator">:</div>
                <div class="time-unit">
                    <span id="minutes">00</span>
                    <label>Minutes</label>
                </div>
                <div class="time-separator">:</div>
                <div class="time-unit">
                    <span id="seconds">00</span>
                    <label>Seconds</label>
                </div>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .countdown-banner {
            background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
            color: white;
            padding: 1rem;
            text-align: center;
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            z-index: 997;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
            animation: slideUp 0.5s ease;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(100%);
            }
            to {
                transform: translateY(0);
            }
        }
        
        .countdown-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            font-weight: 600;
        }
        
        .countdown-content i {
            font-size: 1.5rem;
        }
        
        .countdown-timer {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .time-unit {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        
        .time-unit span {
            font-size: 1.5rem;
            font-weight: 800;
            font-family: var(--font-display);
            background: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 0.75rem;
            border-radius: 8px;
            min-width: 45px;
        }
        
        .time-unit label {
            font-size: 0.7rem;
            margin-top: 0.25rem;
            text-transform: uppercase;
        }
        
        .time-separator {
            font-size: 1.5rem;
            font-weight: 800;
        }
        
        @media (max-width: 768px) {
            .countdown-banner {
                padding: 0.75rem 0.5rem;
            }
            
            .countdown-content {
                font-size: 0.85rem;
                gap: 0.5rem;
            }
            
            .time-unit span {
                font-size: 1.2rem;
                padding: 0.2rem 0.5rem;
                min-width: 38px;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Set countdown to end of day
    const updateCountdown = () => {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const diff = endOfDay - now;
        
        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }
    };
    
    document.body.appendChild(countdownEl);
    updateCountdown();
    setInterval(updateCountdown, 1000);
};

// Uncomment to enable countdown timer
// createCountdownTimer();

// ============================================
// Smooth Reveal Animations
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const revealElements = document.querySelectorAll('.benefit-card, .testimonial-card, .faq-item');
revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
});

// Add reveal animation styles
const revealStyle = document.createElement('style');
revealStyle.textContent = `
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(revealStyle);

// ============================================
// Enhanced Form with Better UX
// ============================================
const formInputs = document.querySelectorAll('.registration-form input, .registration-form textarea, .registration-form select');

formInputs.forEach(input => {
    // Add floating label effect
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
    
    // Real-time validation feedback
    input.addEventListener('input', () => {
        if (input.checkValidity()) {
            input.style.borderColor = '#10b981';
        } else {
            input.style.borderColor = '';
        }
    });
});

// ============================================
// Social Proof Popup
// ============================================
const showSocialProof = () => {
    const names = [
        'Someone from Johannesburg',
        'Someone from Cape Town',
        'Someone from Durban',
        'Someone from Pretoria',
        'Someone from Port Elizabeth'
    ];
    
    const kits = [
        'R1800 Premium Kit',
        'R1300 Classic Kit',
        'R3000 Professional Kit',
        'R600 Starter Kit',
        'R6000 Executive Kit'
    ];
    
    const createProofPopup = () => {
        const name = names[Math.floor(Math.random() * names.length)];
        const kit = kits[Math.floor(Math.random() * kits.length)];
        const time = Math.floor(Math.random() * 30) + 1;
        
        const popup = document.createElement('div');
        popup.className = 'social-proof-popup';
        popup.innerHTML = `
            <div class="proof-content">
                <i class="fas fa-check-circle"></i>
                <div class="proof-text">
                    <strong>${name}</strong> just purchased the <strong>${kit}</strong>
                    <span class="proof-time">${time} minutes ago</span>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            .social-proof-popup {
                position: fixed;
                bottom: 180px;
                left: 20px;
                background: white;
                padding: 1rem 1.25rem;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 996;
                animation: slideInLeft 0.5s ease, slideOutLeft 0.5s ease 4.5s;
                max-width: 350px;
            }
            
            .proof-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .proof-content i {
                color: #10b981;
                font-size: 1.75rem;
                flex-shrink: 0;
            }
            
            .proof-text {
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .proof-text strong {
                color: #1e293b;
            }
            
            .proof-time {
                display: block;
                font-size: 0.8rem;
                color: #64748b;
                margin-top: 0.25rem;
            }
            
            @keyframes slideInLeft {
                from {
                    transform: translateX(-400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutLeft {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-400px);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .social-proof-popup {
                    left: 10px;
                    right: 10px;
                    max-width: calc(100% - 20px);
                    bottom: 150px;
                }
            }
        `;
        
        if (!document.querySelector('.social-proof-styles')) {
            style.className = 'social-proof-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 5000);
    };
    
    // Show first popup after 5 seconds, then every 30 seconds
    setTimeout(() => {
        createProofPopup();
        setInterval(createProofPopup, 30000);
    }, 5000);
};

showSocialProof();

// ============================================
// Console Welcome Message
// ============================================
console.log('%c🌟 Welcome to Kimberly Signature Scents! 🌟', 'color: #8b5cf6; font-size: 20px; font-weight: bold;');
console.log('%cPowered by Inuka by Kiki', 'color: #ec4899; font-size: 14px;');
console.log('%cJoin us today and start your entrepreneurial journey!', 'color: #64748b; font-size: 12px;');
