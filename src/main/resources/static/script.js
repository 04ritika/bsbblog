const API_URL = 'http://localhost:8080/api/posts';

const form = document.getElementById('post-form');
const postsContainer = document.getElementById('posts-container');
const formError = document.getElementById('form-error');

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

        postsContainer.innerHTML = posts.map(post => `
            <div class="post-card">
                <div class="post-title">${escapeHtml(post.title)}</div>
                <div class="post-meta">By ${escapeHtml(post.author)} on ${formatDate(post.createdAt)}</div>
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button onclick="deletePost('${post.id}')" class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        postsContainer.innerHTML = '<p class="error">Failed to load posts. Is the backend running?</p>';
        console.error(err);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const newPost = {
        author: document.getElementById('author').value,
        title: document.getElementById('title').value,
        content: document.getElementById('content').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
        });

        if (!response.ok) {
            const errorData = await response.json();
            const firstError = Object.values(errorData)[0];
            formError.textContent = firstError || 'Something went wrong.';
            return;
        }

        form.reset();
        loadPosts();
    } catch (err) {
        formError.textContent = 'Failed to publish post. Is the backend running?';
        console.error(err);
    }
});

async function deletePost(id) {
    if (!confirm('Delete this post?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
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

loadPosts();
