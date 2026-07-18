const API_URL = 'http://localhost:8080/api/posts';
const AUTH_URL = 'http://localhost:8080/api/auth';

let currentUser = localStorage.getItem('bsbblog_username');
let authToken = localStorage.getItem('bsbblog_token');

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
        const posts = await response.json();

        if (posts.length === 0) {
            postsContainer.innerHTML = '<p>No posts yet. Be the first to write one!</p>';
            return;
        }

        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        postsContainer.innerHTML = posts.map(post => {
            const isOwner = currentUser && post.author === currentUser;
            const actions = isOwner
                ? `<div class="post-actions">
                       <button onclick="deletePost('${post.id}')" class="delete-btn">Delete</button>
                   </div>`
                : '';

            return `
                <div class="post-card">
                    <div class="post-title">${escapeHtml(post.title)}</div>
                    <div class="post-meta">By ${escapeHtml(post.author)} on ${formatDate(post.createdAt)}</div>
                    <div class="post-content">${escapeHtml(post.content)}</div>
                    ${actions}
                </div>
            `;
        }).join('');
    } catch (err) {
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Is the backend running?</p>';
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
