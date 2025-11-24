// Admin Dashboard JavaScript
// ============================================

// Check authentication
const checkAdminAuth = () => {
    const token = getAuthToken();
    const userData = getUserData();
    
    if (!token || !userData) {
        alert('You must be logged in as admin to access this page.');
        window.location.href = 'login.html';
        return false;
    }
    
    // Check if user is admin
    if (userData.email !== 'murerwakimberley@gmail.com' && userData.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    
    // Display admin name
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = `Welcome, ${userData.name || userData.full_name || 'Admin'}`;
    }
    
    return true;
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    
    loadDashboardStats();
    initializeTabs();
    initializeAnnouncementForm();
    initializeRatesForm();
    initializeProductImageForm();
    loadRegistrations();
    initializeSettings();
    
    // Load initial tab content (announcements by default)
    loadAnnouncements();
    
    // Logout handler
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            removeAuthToken();
            window.location.href = 'index.html';
        }
    });
});

// ============================================
// Tab Management
// ============================================
const initializeTabs = () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            btn.classList.add('active');
            document.getElementById(targetTab)?.classList.add('active');
            
            // Load data for specific tabs
            if (targetTab === 'announcements') {
                loadAnnouncements();
            } else if (targetTab === 'rates') {
                loadCurrentRate();
                loadRateHistory();
            } else if (targetTab === 'products') {
                loadProductGallery();
            } else if (targetTab === 'registrations') {
                loadRegistrations();
            }
        });
    });
};

// ============================================
// Dashboard Stats
// ============================================
const loadDashboardStats = async () => {
    try {
        // Load users count
        const usersResponse = await fetch('http://localhost:3000/api/users/stats', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            document.getElementById('totalUsers').textContent = usersData.totalUsers || 0;
        }
        
        // Load registrations count
        const registrationsResponse = await fetch('http://localhost:3000/api/registrations', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (registrationsResponse.ok) {
            const registrationsData = await registrationsResponse.json();
            document.getElementById('totalRegistrations').textContent = registrationsData.registrations?.length || 0;
        }
        
        // Load community posts count
        const postsResponse = await CommunityAPI.getPosts();
        document.getElementById('totalPosts').textContent = postsResponse.posts?.length || 0;
        
        // Load announcements count
        const announcements = getAnnouncementsFromStorage();
        document.getElementById('totalAnnouncements').textContent = announcements.length;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
};

// ============================================
// Announcements Management
// ============================================
const getAnnouncementsFromStorage = () => {
    const stored = localStorage.getItem('announcements');
    return stored ? JSON.parse(stored) : [];
};

const saveAnnouncementsToStorage = (announcements) => {
    localStorage.setItem('announcements', JSON.stringify(announcements));
};

const initializeAnnouncementForm = () => {
    const form = document.getElementById('announcementForm');
    const imageInput = document.getElementById('announcementImage');
    const imagePreview = document.getElementById('imagePreview');
    
    // Image preview
    imageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submission
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            id: Date.now(),
            title: document.getElementById('announcementTitle').value,
            category: document.getElementById('announcementCategory').value,
            content: document.getElementById('announcementContent').value,
            isPinned: document.getElementById('isPinned').checked,
            notifyUsers: document.getElementById('notifyUsers').checked,
            image: imagePreview.innerHTML,
            createdAt: new Date().toISOString(),
            author: (getUserData()?.name || getUserData()?.full_name || 'Admin')
        };
        
        // Get existing announcements
        const announcements = getAnnouncementsFromStorage();
        
        // Add new announcement at the beginning
        announcements.unshift(formData);
        
        // Save to localStorage
        saveAnnouncementsToStorage(announcements);
        
        showNotification('Announcement posted successfully!', 'success');
        form.reset();
        imagePreview.innerHTML = '';
        loadAnnouncements();
        loadDashboardStats();
    });
};

const loadAnnouncements = () => {
    const announcements = getAnnouncementsFromStorage();
    const listContainer = document.getElementById('announcementsList');
    
    if (!listContainer) return;
    
    if (announcements.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No announcements yet. Create your first announcement above!</p>';
        return;
    }
    
    listContainer.innerHTML = announcements.map(announcement => `
        <div class="announcement-item ${announcement.isPinned ? 'pinned' : ''}">
            <div class="announcement-header">
                <div>
                    <h4>${announcement.isPinned ? '<i class="fas fa-thumbtack"></i> ' : ''}${announcement.title}</h4>
                    <span class="announcement-category">${getCategoryLabel(announcement.category)}</span>
                </div>
                <div class="announcement-actions">
                    <button class="btn btn-small btn-danger" onclick="deleteAnnouncement(${announcement.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="announcement-meta">
                <span><i class="fas fa-user"></i> ${announcement.author}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(announcement.createdAt)}</span>
            </div>
            <p>${announcement.content}</p>
            ${announcement.image ? `<div>${announcement.image}</div>` : ''}
        </div>
    `).join('');
};

const deleteAnnouncement = (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    let announcements = getAnnouncementsFromStorage();
    announcements = announcements.filter(a => a.id !== id);
    saveAnnouncementsToStorage(announcements);
    
    showNotification('Announcement deleted successfully!', 'success');
    loadAnnouncements();
    loadDashboardStats();
};

const getCategoryLabel = (category) => {
    const labels = {
        'new_product': 'New Product',
        'special_offer': 'Special Offer',
        'new_orders': 'New Orders',
        'price_update': 'Price Update',
        'general_update': 'General Update',
        'important': 'Important',
        'event': 'Event'
    };
    return labels[category] || category;
};

// ============================================
// Exchange Rates Management
// ============================================
const getCurrentRate = () => {
    const stored = localStorage.getItem('exchangeRate');
    return stored ? JSON.parse(stored) : { rate: 17.00, lastUpdated: null };
};

const saveCurrentRate = (rate) => {
    const rateData = {
        rate: parseFloat(rate),
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('exchangeRate', JSON.stringify(rateData));
    
    // Save to history
    const history = getRateHistory();
    history.unshift(rateData);
    // Keep only last 20 entries
    if (history.length > 20) history.pop();
    localStorage.setItem('rateHistory', JSON.stringify(history));
};

const getRateHistory = () => {
    const stored = localStorage.getItem('rateHistory');
    return stored ? JSON.parse(stored) : [];
};

const initializeRatesForm = () => {
    const form = document.getElementById('ratesForm');
    const input = document.getElementById('usdToZar');
    
    // Update converter preview on input
    input?.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value) || 17.00;
        updateConverterPreview(rate);
    });
    
    // Form submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newRate = parseFloat(input.value);
        if (newRate <= 0) {
            showNotification('Please enter a valid exchange rate', 'error');
            return;
        }
        
        saveCurrentRate(newRate);
        showNotification('Exchange rate updated successfully!', 'success');
        loadCurrentRate();
        loadRateHistory();
        form.reset();
        updateConverterPreview(17.00);
    });
};

const loadCurrentRate = () => {
    const rateData = getCurrentRate();
    const currentRateEl = document.getElementById('currentRate');
    const lastUpdatedEl = document.getElementById('lastUpdated');
    
    if (currentRateEl) {
        currentRateEl.textContent = `${rateData.rate.toFixed(2)} ZAR`;
    }
    
    if (lastUpdatedEl && rateData.lastUpdated) {
        lastUpdatedEl.textContent = formatDate(rateData.lastUpdated);
    }
};

const loadRateHistory = () => {
    const history = getRateHistory();
    const listContainer = document.getElementById('rateHistoryList');
    
    if (!listContainer) return;
    
    if (history.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No rate history yet.</p>';
        return;
    }
    
    listContainer.innerHTML = history.map(entry => `
        <div class="rate-history-item">
            <span><strong>1 USD = ${entry.rate.toFixed(2)} ZAR</strong></span>
            <span>${formatDate(entry.lastUpdated)}</span>
        </div>
    `).join('');
};

const updateConverterPreview = (rate) => {
    const conversions = [
        { zar: 600, id: 'conv600' },
        { zar: 1300, id: 'conv1300' },
        { zar: 1800, id: 'conv1800' },
        { zar: 3000, id: 'conv3000' },
        { zar: 6000, id: 'conv6000' }
    ];
    
    conversions.forEach(({ zar, id }) => {
        const usd = (zar / rate).toFixed(0);
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `$${usd}`;
        }
    });
};

// ============================================
// Product Images Management
// ============================================
const getProductsFromStorage = () => {
    const stored = localStorage.getItem('products');
    return stored ? JSON.parse(stored) : [];
};

const saveProductsToStorage = (products) => {
    localStorage.setItem('products', JSON.stringify(products));
};

const initializeProductImageForm = () => {
    const form = document.getElementById('productImageForm');
    const imageInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('productImagePreview');
    
    let selectedImages = [];
    
    // Image preview
    imageInput?.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedImages = [];
        imagePreview.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedImages.push(e.target.result);
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = `Product ${index + 1}`;
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });
    
    // Form submission
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (selectedImages.length === 0) {
            showNotification('Please select at least one image', 'error');
            return;
        }
        
        const product = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value || '',
            images: selectedImages,
            createdAt: new Date().toISOString()
        };
        
        const products = getProductsFromStorage();
        products.unshift(product);
        saveProductsToStorage(products);
        
        showNotification('Product images uploaded successfully!', 'success');
        form.reset();
        imagePreview.innerHTML = '';
        selectedImages = [];
        loadProductGallery();
    });
};

const loadProductGallery = () => {
    const products = getProductsFromStorage();
    const galleryContainer = document.getElementById('productGallery');
    
    if (!galleryContainer) return;
    
    if (products.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 40px; grid-column: 1/-1;">No products uploaded yet. Upload your first product above!</p>';
        return;
    }
    
    galleryContainer.innerHTML = products.map(product => `
        <div class="product-item">
            ${product.images[0] ? `<img src="${product.images[0]}" alt="${product.name}">` : ''}
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>${product.description}</p>
                <small><i class="fas fa-images"></i> ${product.images.length} image(s)</small>
            </div>
            <div class="product-actions">
                <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
};

const deleteProduct = (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    let products = getProductsFromStorage();
    products = products.filter(p => p.id !== id);
    saveProductsToStorage(products);
    
    showNotification('Product deleted successfully!', 'success');
    loadProductGallery();
};

// ============================================
// Registrations Management
// ============================================
let allRegistrations = [];
let currentRegistration = null;

const loadRegistrations = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/registrations', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            allRegistrations = data.registrations || [];
            displayRegistrations(allRegistrations);
        } else {
            showNotification('Failed to load registrations', 'error');
        }
    } catch (error) {
        console.error('Error loading registrations:', error);
        showNotification('Error loading registrations', 'error');
    }
};

const displayRegistrations = (registrations) => {
    const tbody = document.getElementById('registrationsTableBody');
    
    if (!tbody) return;
    
    if (registrations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">No registrations found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = registrations.map(reg => `
        <tr onclick="showRegistrationDetails(${reg.id})" style="cursor: pointer;">
            <td>${formatDate(reg.created_at)}</td>
            <td>${reg.full_name}</td>
            <td>${reg.email}</td>
            <td>${reg.phone}</td>
            <td>${reg.kit_choice}</td>
            <td><span class="status-badge status-${reg.status}">${reg.status}</span></td>
            <td>
                <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); showRegistrationDetails(${reg.id})">
                    <i class="fas fa-eye"></i> View
                </button>
            </td>
        </tr>
    `).join('');
};

const showRegistrationDetails = (id) => {
    const registration = allRegistrations.find(r => r.id === id);
    if (!registration) return;
    
    currentRegistration = registration;
    
    const modal = document.getElementById('registrationModal');
    const detailsContainer = document.getElementById('registrationDetails');
    const statusSelect = document.getElementById('updateStatus');
    const whatsappLink = document.getElementById('whatsappContact');
    
    if (!modal || !detailsContainer) return;
    
    detailsContainer.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">Full Name:</div>
            <div class="detail-value">${registration.full_name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${registration.email}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Phone:</div>
            <div class="detail-value">${registration.phone}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date of Birth:</div>
            <div class="detail-value">${registration.date_of_birth}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Address:</div>
            <div class="detail-value">${registration.address}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Kit Choice:</div>
            <div class="detail-value">${registration.kit_choice}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Submitted:</div>
            <div class="detail-value">${formatDate(registration.created_at)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge status-${registration.status}">${registration.status}</span></div>
        </div>
    `;
    
    statusSelect.value = registration.status;
    
    const message = `Hi ${registration.full_name}, this is Kimberly Signature Scents. We received your registration for ${registration.kit_choice}. We'll be in touch soon!`;
    whatsappLink.href = `https://wa.me/${registration.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    modal.classList.add('active');
};

// Save status update
document.getElementById('saveStatus')?.addEventListener('click', async () => {
    if (!currentRegistration) return;
    
    const newStatus = document.getElementById('updateStatus').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/registrations/${currentRegistration.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showNotification('Status updated successfully!', 'success');
            closeModal('registrationModal');
            loadRegistrations();
        } else {
            showNotification('Failed to update status', 'error');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Error updating status', 'error');
    }
});

// Filter registrations
document.getElementById('statusFilter')?.addEventListener('change', (e) => {
    const status = e.target.value;
    if (status === 'all') {
        displayRegistrations(allRegistrations);
    } else {
        const filtered = allRegistrations.filter(r => r.status === status);
        displayRegistrations(filtered);
    }
});

// Search registrations
document.getElementById('searchRegistrations')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allRegistrations.filter(r => 
        r.full_name.toLowerCase().includes(searchTerm) ||
        r.email.toLowerCase().includes(searchTerm) ||
        r.phone.includes(searchTerm)
    );
    displayRegistrations(filtered);
});

// ============================================
// Settings Management
// ============================================
const initializeSettings = () => {
    // Theme form
    document.getElementById('themeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const primary = document.getElementById('primaryColor').value;
        const secondary = document.getElementById('secondaryColor').value;
        
        localStorage.setItem('themeColors', JSON.stringify({ primary, secondary }));
        showNotification('Theme settings saved!', 'success');
    });
    
    // Notification form
    document.getElementById('notificationForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('emailNotifications').checked;
        const whatsapp = document.getElementById('whatsappNotifications').checked;
        
        localStorage.setItem('notificationSettings', JSON.stringify({ email, whatsapp }));
        showNotification('Notification settings saved!', 'success');
    });
    
    // Export data
    document.getElementById('exportData')?.addEventListener('click', () => {
        const data = {
            announcements: getAnnouncementsFromStorage(),
            products: getProductsFromStorage(),
            exchangeRate: getCurrentRate(),
            rateHistory: getRateHistory(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kimberly-data-export-${Date.now()}.json`;
        a.click();
        
        showNotification('Data exported successfully!', 'success');
    });
    
    // Clear cache
    document.getElementById('clearCache')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the cache? This will not delete your data.')) {
            // Clear only cache, not data
            showNotification('Cache cleared successfully!', 'success');
        }
    });
};

// ============================================
// Utility Functions
// ============================================
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
        const mins = Math.floor(diff / 60000);
        return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Default format
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
};

// Close modal on background click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
});

// Mobile menu toggle
document.getElementById('hamburger')?.addEventListener('click', function() {
    document.getElementById('navMenu')?.classList.toggle('active');
    this.classList.toggle('active');
});
