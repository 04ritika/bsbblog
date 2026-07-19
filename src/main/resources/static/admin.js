const ADMIN_URL = 'http://localhost:8080/api/admin';

const authToken = localStorage.getItem('bsbblog_token');
const currentUser = localStorage.getItem('bsbblog_username');

const accessDenied = document.getElementById('access-denied');
const adminContent = document.getElementById('admin-content');
const usersContainer = document.getElementById('users-container');
const postsContainer = document.getElementById('admin-posts-container');
const commentsContainer = document.getElementById('admin-comments-container');

function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (err) {
        return null;
    }
}

async function init() {
    if (!authToken) {
        accessDenied.style.display = 'block';
        return;
    }

    const decoded = decodeToken(authToken);
    if (!decoded || decoded.role !== 'ADMIN') {
        accessDenied.style.display = 'block';
        return;
    }

    adminContent.style.display = 'block';
    loadUsers();
    loadPosts();
    loadComments();
}

async function loadComments() {
    try {
        const response = await fetch(`${ADMIN_URL}/comments`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            commentsContainer.innerHTML = '<p class="error">Failed to load comments.</p>';
            return;
        }

        const comments = await response.json();

        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>No comments yet.</p>';
            return;
        }

        comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        commentsContainer.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Author</th><th>Comment</th><th>Post ID</th><th>Posted</th><th>Action</th></tr>
                </thead>
                <tbody>
                    ${comments.map(c => `
                        <tr>
                            <td>${escapeHtml(c.author)}</td>
                            <td>${escapeHtml(c.content)}</td>
                            <td style="font-size:11px; color:#888;">${c.postId}</td>
                            <td>${formatDate(c.createdAt)}</td>
                            <td><button class="delete-btn" onclick="deleteCommentAdmin('${c.id}')">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        commentsContainer.innerHTML = '<p class="error">Failed to load comments. Is the backend running?</p>';
        console.error(err);
    }
}

async function deleteCommentAdmin(commentId) {
    if (!confirm('Delete this comment? This cannot be undone.')) return;

    try {
        const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            alert('Failed to delete comment.');
            return;
        }

        loadComments();
    } catch (err) {
        alert('Failed to delete comment.');
        console.error(err);
    }
}

async function loadUsers() {
    try {
        const response = await fetch(`${ADMIN_URL}/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            usersContainer.innerHTML = '<p class="error">Failed to load users.</p>';
            return;
        }

        const users = await response.json();

        usersContainer.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Username</th><th>Role</th><th>Change Role</th><th>Action</th></tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td>${escapeHtml(u.username)}</td>
                            <td><span class="role-badge ${u.role}">${u.role}</span></td>
                            <td>
                                <select onchange="changeRole('${u.id}', this.value)">
                                    <option value="USER" ${u.role === 'USER' ? 'selected' : ''}>USER</option>
                                    <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
                                </select>
                            </td>
                            <td>
                                ${u.username !== currentUser
                                    ? `<button class="delete-btn" onclick="deleteUser('${u.id}')">Delete</button>`
                                    : '<em>(you)</em>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        usersContainer.innerHTML = '<p class="error">Failed to load users. Is the backend running?</p>';
        console.error(err);
    }
}

async function changeRole(userId, newRole) {
    try {
        const response = await fetch(`${ADMIN_URL}/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
            alert('Failed to update role.');
            loadUsers();
            return;
        }

        loadUsers();
    } catch (err) {
        alert('Failed to update role.');
        console.error(err);
    }
}

async function deleteUser(userId) {
    if (!confirm('Delete this user? This cannot be undone.')) return;

    try {
        const response = await fetch(`${ADMIN_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            alert('Failed to delete user.');
            return;
        }

        loadUsers();
    } catch (err) {
        alert('Failed to delete user.');
        console.error(err);
    }
}

async function loadPosts() {
    try {
        const response = await fetch(`${ADMIN_URL}/posts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            postsContainer.innerHTML = '<p class="error">Failed to load posts.</p>';
            return;
        }

        const posts = await response.json();

        postsContainer.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr><th>Title</th><th>Author</th><th>Likes</th><th>Created</th><th>Action</th></tr>
                </thead>
                <tbody>
                    ${posts.map(p => `
                        <tr>
                            <td>${escapeHtml(p.title)}</td>
                            <td>${escapeHtml(p.author)}</td>
                            <td>${(p.likedBy || []).length}</td>
                            <td>${formatDate(p.createdAt)}</td>
                            <td><button class="delete-btn" onclick="deletePostAdmin('${p.id}')">Delete</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (err) {
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Is the backend running?</p>';
        console.error(err);
    }
}

async function deletePostAdmin(postId) {
    if (!confirm('Delete this post? This cannot be undone.')) return;

    try {
        const response = await fetch(`${ADMIN_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            alert('Failed to delete post.');
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

init();
