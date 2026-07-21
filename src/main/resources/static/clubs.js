const CLUBS_URL = 'http://localhost:8080/api/clubs';
const CATEGORIES_URL = 'http://localhost:8080/api/club-categories';

const currentUser = localStorage.getItem('bsbblog_username');
const authToken = localStorage.getItem('bsbblog_token');

let allClubs = [];
let allCategories = [];
let activeCategory = 'all';

async function init() {
    try {
        const [clubsRes, categoriesRes] = await Promise.all([
            fetch(CLUBS_URL),
            fetch(CATEGORIES_URL)
        ]);
        allClubs = await clubsRes.json();
        allCategories = await categoriesRes.json();

        renderCategoryFilters();
        renderClubRows();
    } catch (err) {
        document.getElementById('clubs-by-category').innerHTML = '<p class="error">Failed to load clubs. Is the backend running?</p>';
        console.error(err);
    }
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    const buttons = allCategories.map(cat => `
        <button class="category-btn" data-category="${cat.id}" onclick="filterByCategory('${cat.id}')">${escapeHtml(cat.name)}</button>
    `).join('');
    container.innerHTML = `
        <button class="category-btn active" data-category="all" onclick="filterByCategory('all')">All</button>
        ${buttons}
    `;
}

function filterByCategory(categoryId) {
    activeCategory = categoryId;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === categoryId);
    });
    renderClubRows();
}

function renderClubRows() {
    const container = document.getElementById('clubs-by-category');

    const categoriesToShow = activeCategory === 'all'
        ? allCategories
        : allCategories.filter(c => c.id === activeCategory);

    if (allClubs.length === 0) {
        container.innerHTML = '<p>No clubs yet.</p>';
        return;
    }

    const rows = categoriesToShow.map(category => {
        const clubsInCategory = allClubs.filter(c => c.categoryId === category.id);
        if (clubsInCategory.length === 0) return '';

        return `
            <div class="category-row">
                <h3>${escapeHtml(category.name)}</h3>
                <div class="club-row-scroll">
                    ${clubsInCategory.map(club => renderClubCard(club)).join('')}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = rows || '<p>No clubs in this category yet.</p>';
}

function renderClubCard(club) {
    const imgSrc = club.imageUrl || '';
    return `
        <div class="club-card" onclick="openClub('${club.id}')">
            ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHtml(club.name)}">` : '<div style="width:100%;height:90px;background:#eee;border-radius:6px;margin-bottom:8px;"></div>'}
            <div class="club-card-name">${escapeHtml(club.name)}</div>
            <div class="club-card-meta">${club.members.length} members</div>
        </div>
    `;
}

async function openClub(clubId) {
    const club = allClubs.find(c => c.id === clubId);
    if (!club) return;

    const modal = document.getElementById('club-modal');
    const modalBody = document.getElementById('club-modal-body');

    const isManager = currentUser && club.managers.includes(currentUser);

    modalBody.innerHTML = `
        <div class="club-profile-header">
            ${club.imageUrl ? `<img src="${club.imageUrl}">` : '<div style="width:80px;height:80px;background:#eee;border-radius:8px;"></div>'}
            <div>
                <h2>${escapeHtml(club.name)} ${isManager ? '<span class="manager-badge">MANAGER</span>' : ''}</h2>
                <p>${escapeHtml(club.description || '')}</p>
            </div>
        </div>

        <div class="club-tabs">
            <button class="club-tab-btn active" data-tab="about" onclick="switchClubTab('about')">About</button>
            <button class="club-tab-btn" data-tab="events" onclick="switchClubTab('events')">Events</button>
            <button class="club-tab-btn" data-tab="members" onclick="switchClubTab('members')">Members</button>
        </div>

        <div class="club-tab-content active" id="tab-about">
            <div id="announcements-list">Loading announcements...</div>
            ${isManager ? `
                <form onsubmit="postAnnouncement(event, '${clubId}')" style="margin-top:10px;">
                    <input type="text" id="announcement-input" placeholder="Post an update..." required>
                    <button type="submit">Post</button>
                </form>
            ` : ''}
        </div>

        <div class="club-tab-content" id="tab-events">
            <div id="events-list">Loading events...</div>
            ${isManager ? `
                <form onsubmit="addEvent(event, '${clubId}')" style="margin-top:10px;">
                    <input type="text" id="event-title-input" placeholder="Event title" required>
                    <input type="datetime-local" id="event-date-input" required>
                    <textarea id="event-desc-input" placeholder="Description" rows="2"></textarea>
                    <button type="submit">Add Event</button>
                </form>
            ` : ''}
        </div>

        <div class="club-tab-content" id="tab-members">
            <div id="members-list">
                ${club.members.length === 0 ? '<p>No members yet.</p>' : club.members.map(m => `
                    <div class="member-item">${escapeHtml(m)}</div>
                `).join('')}
            </div>
            ${isManager ? `
                <form onsubmit="addMember(event, '${clubId}')" style="margin-top:10px;">
                    <input type="text" id="member-username-input" placeholder="Username to add" required>
                    <button type="submit">Add Member</button>
                </form>
            ` : ''}
        </div>
    `;

    modal.style.display = 'flex';
    loadAnnouncements(clubId);
    loadEvents(clubId);
}

function switchClubTab(tab) {
    document.querySelectorAll('.club-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.club-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tab}`);
    });
}

async function loadAnnouncements(clubId) {
    const listEl = document.getElementById('announcements-list');
    try {
        const response = await fetch(`${CLUBS_URL}/${clubId}/announcements`);
        const announcements = await response.json();

        if (announcements.length === 0) {
            listEl.innerHTML = '<p style="font-size:12px;color:#888;">No announcements yet.</p>';
            return;
        }

        announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        listEl.innerHTML = announcements.map(a => `
            <div class="announcement-item">
                ${escapeHtml(a.content)}
                <div class="event-date">By ${escapeHtml(a.postedBy)} on ${formatDate(a.createdAt)}</div>
            </div>
        `).join('');
    } catch (err) {
        listEl.innerHTML = '<p class="error">Failed to load announcements.</p>';
    }
}

async function loadEvents(clubId) {
    const listEl = document.getElementById('events-list');
    try {
        const response = await fetch(`${CLUBS_URL}/${clubId}/events`);
        const events = await response.json();

        if (events.length === 0) {
            listEl.innerHTML = '<p style="font-size:12px;color:#888;">No upcoming events.</p>';
            return;
        }

        events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        listEl.innerHTML = events.map(e => `
            <div class="event-item">
                <strong>${escapeHtml(e.title)}</strong>
                <div class="event-date">${formatDate(e.eventDate)}</div>
                ${e.description ? `<div>${escapeHtml(e.description)}</div>` : ''}
            </div>
        `).join('');
    } catch (err) {
        listEl.innerHTML = '<p class="error">Failed to load events.</p>';
    }
}

async function postAnnouncement(event, clubId) {
    event.preventDefault();
    const input = document.getElementById('announcement-input');
    const content = input.value.trim();
    if (!content) return;

    try {
        const response = await fetch(`${CLUBS_URL}/${clubId}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ content })
        });
        if (!response.ok) {
            alert('Failed to post announcement.');
            return;
        }
        input.value = '';
        loadAnnouncements(clubId);
    } catch (err) {
        alert('Failed to post announcement.');
    }
}

async function addEvent(event, clubId) {
    event.preventDefault();
    const title = document.getElementById('event-title-input').value;
    const eventDate = document.getElementById('event-date-input').value;
    const description = document.getElementById('event-desc-input').value;

    try {
        const response = await fetch(`${CLUBS_URL}/${clubId}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ title, eventDate, description })
        });
        if (!response.ok) {
            alert('Failed to add event.');
            return;
        }
        event.target.reset();
        loadEvents(clubId);
    } catch (err) {
        alert('Failed to add event.');
    }
}

async function addMember(event, clubId) {
    event.preventDefault();
    const input = document.getElementById('member-username-input');
    const username = input.value.trim();
    if (!username) return;

    try {
        const response = await fetch(`${CLUBS_URL}/${clubId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.error || 'Failed to add member.');
            return;
        }

        const clubIndex = allClubs.findIndex(c => c.id === clubId);
        if (clubIndex !== -1) allClubs[clubIndex] = data;

        document.getElementById('members-list').innerHTML = data.members.map(m => `
            <div class="member-item">${escapeHtml(m)}</div>
        `).join('');
        input.value = '';
    } catch (err) {
        alert('Failed to add member.');
    }
}

function closeModal() {
    document.getElementById('club-modal').style.display = 'none';
}

function closeModalOnOverlay(event) {
    if (event.target.id === 'club-modal') closeModal();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
