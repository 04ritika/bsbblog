const API_URL = 'http://localhost:8080/api/posts';
const COMMENTS_URL = 'http://localhost:8080/api/comments';

const currentUser = localStorage.getItem('bsbblog_username');
const authToken = localStorage.getItem('bsbblog_token');

const params = new URLSearchParams(window.location.search);
const profileUsername = params.get('user') || currentUser;

let profilePosts = [];

document.getElementById('profile-username').textContent = `${profileUsername}'s Profile`;

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/user/${encodeURIComponent(profileUsername)}`);
        profilePosts = await response.json();

        profilePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        document.getElementById('stat-posts').textContent = profilePosts.length;
        const totalLikes = profilePosts.reduce((sum, p) => sum + (p.likedBy ? p.likedBy.length : 0), 0);
        document.getElementById('stat-likes').textContent = totalLikes;

        const grid = document.getElementById('profile-grid');

        if (profilePosts.length === 0) {
            grid.innerHTML = '<p>No posts yet.</p>';
            return;
        }

        grid.innerHTML = profilePosts.map(post => renderGridItem(post)).join('');
    } catch (err) {
        document.getElementById('profile-grid').innerHTML = '<p class="error">Failed to load profile.</p>';
        console.error(err);
    }
}

function renderGridItem(post) {
    const icon = post.type === 'IMAGE' ? '\uD83D\uDDBC' : post.type === 'POLL' ? '\uD83D\uDCCA' : '\uD83D\uDCDD';

    if (post.type === 'IMAGE') {
        return `
            <div class="grid-item" onclick="openPost('${post.id}')">
                <img src="${post.imageUrl}" alt="Post image">
                <span class="grid-type-icon">${icon}</span>
            </div>
        `;
    }

    const previewText = post.type === 'POLL' ? post.title : (post.title || post.content);

    return `
        <div class="grid-item" onclick="openPost('${post.id}')">
            <span class="grid-type-icon">${icon}</span>
            <div class="grid-text-preview">${escapeHtml(previewText)}</div>
        </div>
    `;
}

async function openPost(postId) {
    const post = profilePosts.find(p => p.id === postId);
    if (!post) return;

    const modal = document.getElementById('post-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = renderFullPost(post);
    modal.style.display = 'flex';

    await loadModalComments(postId);
}

function renderFullPost(post) {
    const likedBy = post.likedBy || [];
    const likeCount = likedBy.length;
    const isLiked = currentUser && likedBy.includes(currentUser);

    let body = '';
    if (post.type === 'IMAGE') {
        body = `
            <img src="${post.imageUrl}" class="post-image" alt="Post image">
            ${post.content ? `<div class="post-content">${escapeHtml(post.content)}</div>` : ''}
        `;
    } else if (post.type === 'POLL') {
        const totalVotes = post.pollOptions.reduce((sum, o) => sum + o.votedBy.length, 0);
        body = `
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="poll-options">
                ${post.pollOptions.map(opt => {
                    const pct = totalVotes > 0 ? Math.round((opt.votedBy.length / totalVotes) * 100) : 0;
                    return `
                        <div class="poll-option-bar">
                            <div class="poll-option-fill" style="width:${pct}%"></div>
                            <div class="poll-option-content">
                                <span>${escapeHtml(opt.text)}</span>
                                <span>${pct}%</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="post-meta">${totalVotes} vote${totalVotes !== 1 ? 's' : ''}</div>
        `;
    } else {
        body = `
            <div class="post-title">${escapeHtml(post.title)}</div>
            <div class="post-content">${escapeHtml(post.content)}</div>
        `;
    }

    return `
        <div class="post-meta">By ${escapeHtml(post.author)} on ${formatDate(post.createdAt)} <span class="post-type-badge">${post.type}</span></div>
        ${body}
        <div class="post-social">
            <span class="like-btn ${isLiked ? 'liked' : ''}">${isLiked ? '\u2665' : '\u2661'} ${likeCount} like${likeCount !== 1 ? 's' : ''}</span>
        </div>
        <div class="comments-section open">
            <h3 style="font-size:14px;">Comments</h3>
            <div class="comments-list" id="modal-comments-list">Loading comments...</div>
        </div>
    `;
}

async function loadModalComments(postId) {
    const listEl = document.getElementById('modal-comments-list');
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

function closeModal() {
    document.getElementById('post-modal').style.display = 'none';
}

function closeModalOnOverlay(event) {
    if (event.target.id === 'post-modal') closeModal();
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

loadProfile();
