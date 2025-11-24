// Community Platform JavaScript

let currentPage = 1;
let currentCategory = 'all';
let categories = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    checkAuthStatus();
    await loadCategories();
    await loadPosts();
    await loadStats();
    setupEventListeners();
});

// Check authentication status
function checkAuthStatus() {
    const isAuth = isLoggedIn();
    const user = getUserData();

    document.getElementById('loginLink').style.display = isAuth ? 'none' : 'inline';
    document.getElementById('registerLink').style.display = isAuth ? 'none' : 'inline';
    document.getElementById('logoutLink').style.display = isAuth ? 'inline' : 'none';
    document.getElementById('dashboardLink').style.display = isAuth ? 'inline' : 'none';
    document.getElementById('createPostBtn').style.display = isAuth ? 'inline-flex' : 'none';

    // Show welcome message for guests
    const guestWelcome = document.getElementById('guestWelcome');
    if (guestWelcome) {
        guestWelcome.style.display = isAuth ? 'none' : 'block';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Logout
    document.getElementById('logoutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            AuthAPI.logout();
        }
    });

    // Create post button
    document.getElementById('createPostBtn')?.addEventListener('click', () => {
        openPostModal();
    });

    // Post form submission
    document.getElementById('postForm').addEventListener('submit', handlePostSubmit);

    // Modal close buttons
    document.getElementById('closeModal')?.addEventListener('click', closePostModal);
    document.getElementById('cancelPost')?.addEventListener('click', closePostModal);
    document.getElementById('closeDetailModal')?.addEventListener('click', closeDetailModal);

    // Click outside modal to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closePostModal();
                closeDetailModal();
            }
        });
    });

    // Pagination
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPosts();
        }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        currentPage++;
        loadPosts();
    });

    // Category filter
    document.getElementById('categoryList')?.addEventListener('click', (e) => {
        const categoryItem = e.target.closest('li');
        if (categoryItem) {
            document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
            categoryItem.classList.add('active');
            currentCategory = categoryItem.dataset.category;
            currentPage = 1;
            loadPosts();
        }
    });
}

// Load categories
async function loadCategories() {
    try {
        const result = await CommunityAPI.getCategories();
        if (result.success) {
            categories = result.categories;
            renderCategories();
            populateCategorySelect();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render categories in sidebar
function renderCategories() {
    const categoryList = document.getElementById('categoryList');
    const categoriesHTML = categories.map(cat => `
        <li data-category="${cat.name}">
            <i class="${cat.icon}"></i> ${cat.name}
        </li>
    `).join('');

    categoryList.innerHTML += categoriesHTML;
}

// Populate category select in form
function populateCategorySelect() {
    const select = document.getElementById('postCategory');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

// Load posts
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading posts...</p></div>';

    try {
        let result;
        if (currentCategory === 'all') {
            result = await CommunityAPI.getPosts(currentPage);
            document.getElementById('feedTitle').textContent = 'All Posts';
        } else {
            result = await CommunityAPI.getPostsByCategory(currentCategory);
            document.getElementById('feedTitle').textContent = currentCategory;
        }

        if (result.success && result.posts.length > 0) {
            renderPosts(result.posts);
            updatePagination(result);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No posts yet</h3>
                    <p>Be the first to start a conversation!</p>
                </div>
            `;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error loading posts. Please try again.</p>
            </div>
        `;
        console.error('Error loading posts:', error);
    }
}

// Render posts
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = posts.map(post => `
        <div class="post-card" onclick="viewPost(${post.id})">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="author-info">
                        <h4>${post.author_name}</h4>
                        <p>${formatDate(post.created_at)}</p>
                    </div>
                </div>
                <span class="post-category">${post.category}</span>
            </div>
            <div class="post-content">
                <h3>${post.title}</h3>
                <p class="post-excerpt">${truncateText(post.content, 200)}</p>
            </div>
            <div class="post-footer">
                <div class="post-action ${post.liked ? 'liked' : ''}">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes_count} Likes</span>
                </div>
                <div class="post-action">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments_count} Comments</span>
                </div>
            </div>
        </div>
    `).join('');
}

// View post detail
async function viewPost(postId) {
    // Allow everyone to view posts, login only required for interactions
    const modal = document.getElementById('postDetailModal');
    const content = document.getElementById('postDetailContent');

    modal.classList.add('active');
    content.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading...</p></div>';

    try {
        const result = await CommunityAPI.getPost(postId);
        if (result.success) {
            renderPostDetail(result.post);
        }
    } catch (error) {
        content.innerHTML = '<p>Error loading post</p>';
        console.error('Error loading post:', error);
    }
}

// Render post detail with comments
function renderPostDetail(post) {
    const content = document.getElementById('postDetailContent');
    const user = getUserData();
    const isAuthor = user && user.id === post.user_id;

    content.innerHTML = `
        <div class="post-detail">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="author-info">
                        <h4>${post.author_name}</h4>
                        <p>${formatDate(post.created_at)}</p>
                    </div>
                </div>
                <span class="post-category">${post.category}</span>
            </div>
            <div class="post-content">
                <h2>${post.title}</h2>
                <p>${post.content.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="post-footer">
                <button class="post-action" onclick="likePost(${post.id})">
                    <i class="fas fa-heart"></i>
                    <span>${post.likes_count} Likes</span>
                </button>
                <div class="post-action">
                    <i class="fas fa-comment"></i>
                    <span>${post.comments_count} Comments</span>
                </div>
                ${isAuthor ? `<button class="post-action" onclick="deletePost(${post.id})"><i class="fas fa-trash"></i> Delete</button>` : ''}
            </div>

            <div class="comments-section">
                <h4><i class="fas fa-comments"></i> Comments (${post.comments.length})</h4>
                <div id="commentsList">
                    ${renderComments(post.comments)}
                </div>
                ${user ? `
                    <form class="comment-form" onsubmit="addComment(event, ${post.id})">
                        <textarea placeholder="Write a comment..." required></textarea>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Post Comment
                        </button>
                    </form>
                ` : '<p>Login to comment</p>'}
            </div>
        </div>
    `;
}

// Render comments
function renderComments(comments) {
    if (comments.length === 0) {
        return '<p>No comments yet. Be the first to comment!</p>';
    }

    return comments.map(comment => `
        <div class="comment-card">
            <div class="comment-header">
                <div class="comment-author">
                    <i class="fas fa-user-circle"></i>
                    ${comment.author_name}
                </div>
                <span class="comment-time">${formatDate(comment.created_at)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// Add comment
async function addComment(event, postId) {
    event.preventDefault();
    const form = event.target;
    const content = form.querySelector('textarea').value;

    try {
        const result = await CommunityAPI.addComment(postId, content);
        if (result.success) {
            showNotification('Comment added successfully', 'success');
            viewPost(postId); // Reload post
        }
    } catch (error) {
        showNotification(error.message || 'Error adding comment', 'error');
    }
}

// Like post
async function likePost(postId) {
    if (!isLoggedIn()) {
        if (confirm('You need to login to like posts. Would you like to login or register now?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    try {
        const result = await CommunityAPI.likePost(postId);
        if (result.success) {
            showNotification(result.message, 'success');
            viewPost(postId); // Reload post
            loadPosts(); // Refresh feed
        }
    } catch (error) {
        showNotification(error.message || 'Error processing like', 'error');
    }
}

// Delete post
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
        const result = await CommunityAPI.deletePost(postId);
        if (result.success) {
            showNotification('Post deleted successfully', 'success');
            closeDetailModal();
            loadPosts();
        }
    } catch (error) {
        showNotification(error.message || 'Error deleting post', 'error');
    }
}

// Open post modal
function openPostModal() {
    if (!isLoggedIn()) {
        if (confirm('You need to login to create posts. Would you like to login or register now?')) {
            window.location.href = 'login.html';
        }
        return;
    }

    document.getElementById('postModal').classList.add('active');
    document.getElementById('postForm').reset();
}

// Close post modal
function closePostModal() {
    document.getElementById('postModal').classList.remove('active');
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('postDetailModal').classList.remove('active');
}

// Handle post submission
async function handlePostSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    const postData = {
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value,
        category: document.getElementById('postCategory').value
    };

    console.log('Creating post:', postData);

    try {
        const result = await CommunityAPI.createPost(postData);
        console.log('Post result:', result);
        if (result.success) {
            showNotification('Post created successfully!', 'success');
            closePostModal();
            loadPosts();
        } else {
            showNotification(result.message || 'Error creating post', 'error');
        }
    } catch (error) {
        console.error('Post creation error:', error);
        showNotification(error.message || 'Error creating post', 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        const result = await UserAPI.getStats();
        if (result.success) {
            document.getElementById('totalUsers').textContent = result.stats.total_users;
            document.getElementById('totalPosts').textContent = result.stats.total_posts;
            document.getElementById('totalComments').textContent = result.stats.total_comments;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update pagination
function updatePagination(result) {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (result.posts.length < result.limit && currentPage === 1) {
        pagination.style.display = 'none';
    } else {
        pagination.style.display = 'flex';
        pageInfo.textContent = `Page ${currentPage}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = result.posts.length < result.limit;
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function truncateText(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}
