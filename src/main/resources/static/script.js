const API_URL = 'http://localhost:8080/api/posts';
const AUTH_URL = 'http://localhost:8080/api/auth';
const COMMENTS_URL = 'http://localhost:8080/api/comments';

let currentUser = localStorage.getItem('bsbblog_username');
let authToken = localStorage.getItem('bsbblog_token');
let allPosts = [];
let currentPostType = 'BLOG';

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

function switchPostType(type) {
    currentPostType = type;
    document.querySelectorAll('.type-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    document.getElementById('blog-post-form').style.display = type === 'BLOG' ? 'flex' : 'none';
    document.getElementById('image-post-form').style.display = type === 'IMAGE' ? 'flex' : 'none';
    document.getElementById('poll-post-form').style.display = type === 'POLL' ? 'flex' : 'none';
}

function addPollOption() {
    const container = document.getElementById('poll-options-container');
    const count = container.children.length + 1;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'poll-option-input';
    input.placeholder = `Option ${count}`;
    input.required = true;
    container.appendChild(input);
}

function updateAuthUI() {
    if (authToken && currentUser) {
        const decoded = JSON.parse(atob(authToken.split('.')[1]));
        const adminLink = decoded.role === 'ADMIN' ? ' <a href="/admin.html" class="admin-link">\u2699 Admin Dashboard</a>' : '';
        authStatus.innerHTML = `Logged in as <a href="/profile.html?user=${encodeURIComponent(currentUser)}"><strong>${escapeHtml(currentUser)}</strong></a>${adminLink} <button id="logout-btn">Logout</button>`;
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

document.getElementById('blog-post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const body = {
        title: document.getElementById('blog-title').value,
        content: document.getElementById('blog-content').value
    };

    try {
        const response = await fetch(`${API_URL}/blog`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const errData = await response.json();
            formError.textContent = errData.error || Object.values(errData)[0] || 'Something went wrong.';
            return;
        }
        e.target.reset();
        loadPosts();
    } catch (err) {
        formError.textContent = 'Failed to publish. Is the backend running?';
    }
});

document.getElementById('image-post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const fileInput = document.getElementById('image-file');
    const caption = document.getElementById('image-caption').value;

    if (!fileInput.files[0]) {
        formError.textContent = 'Please select an image.';
        return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('caption', caption);

    try {
        const response = await fetch(`${API_URL}/image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        if (!response.ok) {
            const errData = await response.json();
            formError.textContent = errData.error || 'Something went wrong.';
            return;
        }
        e.target.reset();
        loadPosts();
    } catch (err) {
        formError.textContent = 'Failed to publish. Is the backend running?';
    }
});

document.getElementById('poll-post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const question = document.getElementById('poll-question').value;
    const optionInputs = document.querySelectorAll('.poll-option-input');
    const options = Array.from(optionInputs).map(i => i.value).filter(v => v.trim() !== '');
    const allowMultiple = document.getElementById('poll-multiple').checked;

    if (options.length < 2) {
        formError.textContent = 'A poll needs at least 2 options.';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/poll`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ title: question, options, allowMultipleChoice: allowMultiple })
        });
        if (!response.ok) {
            const errData = await response.json();
            formError.textContent = errData.error || Object.values(errData)[0] || 'Something went wrong.';
            return;
        }
        e.target.reset();
        document.getElementById('poll-options-container').innerHTML = `
            <input type="text" class="poll-option-input" placeholder="Option 1" required>
            <input type="text" class="poll-option-input" placeholder="Option 2" required>
        `;
        loadPosts();
    } catch (err) {
        formError.textContent = 'Failed to publish. Is the backend running?';
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
    }
}

function renderPostBody(post) {
    if (post.type === 'IMAGE') {
        return `
            <img src="${post.imageUrl}" class="post-image" alt="Post image">
            ${post.content ? `<div class="post-content">${escapeHtml(post.content)}</div>` : ''}
        `;
    }

    if (post.type === 'POLL') {
        const totalVotes = post.pollOptions.reduce((sum, o) => sum + o.votedBy.length, 0);
        const userVoted = currentUser && post.pollOptions.some(o => o.votedBy.includes(currentUser));

        return `
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="poll-options">
                ${post.pollOptions.map((opt, idx) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votedBy.length / totalVotes) * 100) : 0;
                    const votedThis = currentUser && opt.votedBy.includes(currentUser);
                    return `
                        <div class="poll-option-bar ${votedThis ? 'voted' : ''}" onclick="votePoll('${post.id}', ${idx}, ${post.allowMultipleChoice})">
                            <div class="poll-option-fill" style="width:${userVoted ? pct : 0}%"></div>
                            <div class="poll-option-content">
                                <span>${escapeHtml(opt.text)}</span>
                                <span>${userVoted ? pct + '%' : ''}</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="post-meta">${totalVotes} vote${totalVotes !== 1 ? 's' : ''} ${post.allowMultipleChoice ? '\u2022 Multiple choice' : ''}</div>
        `;
    }

    return `
        <div class="post-title">${escapeHtml(post.title)}</div>
        <div class="post-content">${escapeHtml(post.content)}</div>
    `;
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
            <div class="post-meta">
                <a href="/profile.html?user=${encodeURIComponent(post.author)}">${escapeHtml(post.author)}</a>
                on ${formatDate(post.createdAt)}
                <span class="post-type-badge">${post.type}</span>
            </div>
            ${renderPostBody(post)}
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

async function votePoll(postId, optionIndex, allowMultiple) {
    if (!authToken) {
        alert('Please log in to vote.');
        return;
    }

    const post = allPosts.find(p => p.id === postId);
    let optionIndexes = [optionIndex];

    if (allowMultiple) {
        const currentVotes = post.pollOptions
            .map((o, i) => o.votedBy.includes(currentUser) ? i : -1)
            .filter(i => i !== -1);
        if (currentVotes.includes(optionIndex)) {
            optionIndexes = currentVotes.filter(i => i !== optionIndex);
        } else {
            optionIndexes = [...currentVotes, optionIndex];
        }
    }

    try {
        const response = await fetch(`${API_URL}/${postId}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ optionIndexes })
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Failed to vote.');
            return;
        }

        const updatedPost = await response.json();
        const index = allPosts.findIndex(p => p.id === postId);
        if (index !== -1) allPosts[index] = updatedPost;
        document.getElementById(`post-${postId}`).outerHTML = renderPostCard(updatedPost);
    } catch (err) {
        alert('Failed to vote.');
    }
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
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
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
    }
}

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
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

updateAuthUI();
loadPosts();
