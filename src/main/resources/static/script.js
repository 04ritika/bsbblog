const API_URL = 'http://localhost:8080/api/posts';
const AUTH_URL = 'http://localhost:8080/api/auth';
const COMMENTS_URL = 'http://localhost:8080/api/comments';

let currentUser = localStorage.getItem('bsbblog_username');
let authToken = localStorage.getItem('bsbblog_token');
let allPosts = [];

const postForm = document.getElementById('post-form');
const postsContainer = document.getElementById('posts-container');
const formError = document.getElementById('form-error');
const authStatus = document.getElementById('auth-status');
const authSection = document.getElementById('auth-section');
const newPostSection = document.getElementById('new-post-section');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    registerFormContainer.style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
});

function updateAuthUI() {
    if (authToken && currentUser) {
        authStatus.innerHTML = `Logged in as <strong>${escapeHtml(currentUser)}</strong> <button id="logout-btn">Logout</button>`;
        document.getElementById('logout-btn').addEventListener('click', logout);
        authSection.style.display = 'none';
        newPostSection.style.display = 'block';
    } else {
        authStatus.innerHTML = '';
        authSection.style.display = 'block';
        newPostSection.style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('bsbblog_token');
    localStorage.removeItem('bsbblog_username');
    authToken = null;
    currentUser = null;
    updateAuthUI();
    loadPosts();
}

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';

    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            registerError.textContent = data.error || Object.values(data)[0] || 'Registration failed.';
            return;
        }

        authToken = data.token;
        currentUser = data.username;
        localStorage.setItem('bsbblog_token', authToken);
        localStorage.setItem('bsbblog_username', currentUser);

        registerForm.reset();
        updateAuthUI();
        loadPosts();
    } catch (err) {
        registerError.textContent = 'Something went wrong. Is the backend running?';
        console.error(err);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            loginError.textContent = data.error || 'Login failed.';
            return;
        }

        authToken = data.token;
        currentUser = data.username;
        localStorage.setItem('bsbblog_token', authToken);
        localStorage.setItem('bsbblog_username', currentUser);

        loginForm.reset();
        updateAuthUI();
        loadPosts();
    } catch (err) {
        loginError.textContent = 'Something went wrong. Is the backend running?';
        console.error(err);
    }
});

async function loadPosts() {
    postsContainer.innerHTML = '<p>Loading posts...</p>';
    try {
        const response = await fetch(API_URL);
        allPosts = await response.json();

        if (allPosts.length === 0) {
            postsContainer.innerHTML = '<p>No posts yet. Be the first to write one!</p>';
            return;
        }

        allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        postsContainer.innerHTML = allPosts.map(post => renderPostCard(post)).join('');
    } catch (err) {
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Is the backend running?</p>';
        console.error(err);
    }
}

function renderPostCard(post) {
    const isOwner = currentUser && post.author === currentUser;
    const likedBy = post.likedBy || [];
    const isLiked = currentUser && likedBy.includes(currentUser);
    const likeCount = likedBy.length;

    const deleteBtn = isOwner
        ? `<button onclick="deletePost('${post.id}')" class="delete-btn">Delete</button>`
        : '';

    return `
        <div class="post-card" id="post-${post.id}">
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-meta">By ${escapeHtml(post.author)} on ${formatDate(post.createdAt)}</div>
            <div class="post-content">${escapeHtml(post.content)}</div>
            <div class="post-social">
                <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post.id}')">
                    ${isLiked ? '\u2665' : '\u2661'} ${likeCount}
                </button>
                <button class="comment-toggle-btn" onclick="toggleComments('${post.id}')">Comments</button>
            </div>
            <div class="post-actions">${deleteBtn}</div>
            <div class="comments-section" id="comments-${post.id}">
                <div class="comments-list" id="comments-list-${post.id}">Loading comments...</div>
                ${currentUser ? `
                    <form class="comment-form" onsubmit="submitComment(event, '${post.id}')">
                        <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}" required>
                        <button type="submit">Post</button>
                    </form>
                ` : '<p style="font-size:12px;color:#888;">Log in to comment</p>'}
            </div>
        </div>
    `;
}

async function toggleLike(postId) {
    if (!authToken) {
        alert('Please log in to like posts.');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${postId}/like`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            alert('Failed to like post.');
            return;
        }

        const updatedPost = await response.json();
        const index = allPosts.findIndex(p => p.id === postId);
        if (index !== -1) allPosts[index] = updatedPost;

        document.getElementById(`post-${postId}`).outerHTML = renderPostCard(updatedPost);
    } catch (err) {
        alert('Failed to like post.');
        console.error(err);
    }
}

async function toggleComments(postId) {
    const section = document.getElementById(`comments-${postId}`);
    const isOpen = section.classList.contains('open');

    if (isOpen) {
        section.classList.remove('open');
        return;
    }

    section.classList.add('open');
    await loadComments(postId);
}

async function loadComments(postId) {
    const listEl = document.getElementById(`comments-list-${postId}`);
    listEl.innerHTML = 'Loading comments...';

    try {
        const response = await fetch(`${COMMENTS_URL}/${postId}`);
        const comments = await response.json();

        if (comments.length === 0) {
            listEl.innerHTML = '<p style="font-size:12px;color:#888;">No comments yet.</p>';
            return;
        }

        comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        listEl.innerHTML = comments.map(c => `
            <div class="comment-item">
                <span class="comment-author">${escapeHtml(c.author)}:</span> ${escapeHtml(c.content)}
            </div>
        `).join('');
    } catch (err) {
        listEl.innerHTML = '<p class="error">Failed to load comments.</p>';
        console.error(err);
    }
}

async function submitComment(event, postId) {
    event.preventDefault();
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        const response = await fetch(`${COMMENTS_URL}/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            alert('Failed to post comment.');
            return;
        }

        input.value = '';
        await loadComments(postId);
    } catch (err) {
        alert('Failed to post comment.');
        console.error(err);
    }
}

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const newPost = {
        title: document.getElementById('title').value,
        content: document.getElementById('content').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(newPost)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const firstError = errorData.error || Object.values(errorData)[0];
            formError.textContent = firstError || 'Something went wrong.';
            return;
        }

        postForm.reset();
        loadPosts();
    } catch (err) {
        formError.textContent = 'Failed to publish post. Is the backend running?';
        console.error(err);
    }
});

async function deletePost(id) {
    if (!confirm('Delete this post?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to delete post.');
            return;
        }

        loadPosts();
    } catch (err) {
        alert('Failed to delete post.');
        console.error(err);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

updateAuthUI();
loadPosts();
