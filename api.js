// API Configuration
// Auto-detect environment and use appropriate API URL
const getApiUrl = () => {
    // Check if we're in production (deployed site)
    const hostname = window.location.hostname;
    
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        // Production - Vercel deployment
        // When deployed to Vercel, use same domain for API
        // Update this with your Vercel project URL after deployment
        return window.location.origin + '/api';
        
        // OR if you prefer to specify the exact URL:
        // return 'https://kimberly-signature-scents.vercel.app/api';
    }
    
    // Development - local backend
    return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();
console.log('🔗 API URL:', API_URL);

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Set auth token
function setAuthToken(token) {
    localStorage.setItem('auth_token', token);
}

// Remove auth token
function removeAuthToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
}

// Get user data
function getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Set user data
function setUserData(user) {
    localStorage.setItem('user_data', JSON.stringify(user));
}

// Check if user is logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Auth API functions
const AuthAPI = {
    async register(userData) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (data.success) {
            setAuthToken(data.token);
            setUserData(data.user);
        }
        
        return data;
    },

    async login(email, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
            setAuthToken(data.token);
            setUserData(data.user);
        }
        
        return data;
    },

    async getProfile() {
        return await apiRequest('/auth/me');
    },

    logout() {
        removeAuthToken();
        window.location.href = '/index.html';
    }
};

// Registration API functions
const RegistrationAPI = {
    async submit(formData) {
        return await apiRequest('/registrations/submit', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    },

    async getAll() {
        return await apiRequest('/registrations');
    },

    async updateStatus(id, statusData) {
        return await apiRequest(`/registrations/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(statusData)
        });
    }
};

// Community API functions
const CommunityAPI = {
    async getPosts(page = 1, limit = 20) {
        return await apiRequest(`/community/posts?page=${page}&limit=${limit}`);
    },

    async getPostsByCategory(category) {
        return await apiRequest(`/community/posts/category/${category}`);
    },

    async getPost(id) {
        return await apiRequest(`/community/posts/${id}`);
    },

    async createPost(postData) {
        return await apiRequest('/community/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    },

    async updatePost(id, postData) {
        return await apiRequest(`/community/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    },

    async deletePost(id) {
        return await apiRequest(`/community/posts/${id}`, {
            method: 'DELETE'
        });
    },

    async addComment(postId, content) {
        return await apiRequest(`/community/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    },

    async deleteComment(commentId) {
        return await apiRequest(`/community/comments/${commentId}`, {
            method: 'DELETE'
        });
    },

    async likePost(postId) {
        return await apiRequest(`/community/posts/${postId}/like`, {
            method: 'POST'
        });
    },

    async getCategories() {
        return await apiRequest('/community/categories');
    }
};

// User API functions
const UserAPI = {
    async getProfile(userId) {
        return await apiRequest(`/users/profile/${userId}`);
    },

    async updateProfile(profileData) {
        return await apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    },

    async getStats() {
        return await apiRequest('/users/stats');
    }
};

// Update the original registration form to use the API
document.getElementById('registrationForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        kitChoice: document.getElementById('kitChoice').value
    };
    
    try {
        const result = await RegistrationAPI.submit(formData);
        
        if (result.success) {
            showNotification(result.message, 'success');
            this.reset();
            
            // Ask if they want to create an account
            setTimeout(() => {
                if (confirm('Registration submitted! Would you like to create an account to access our community platform?')) {
                    // Redirect to registration page
                    window.location.href = 'register.html?email=' + encodeURIComponent(formData.email);
                }
            }, 2000);
        }
    } catch (error) {
        showNotification(error.message || 'Error submitting registration', 'error');
    }
});
