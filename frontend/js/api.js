const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get Auth Token
function getToken() {
    return localStorage.getItem('token');
}

// Helper to check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Setup common UI elements (Navbar update based on auth)
function updateNavbar() {
    const authLinks = document.getElementById('auth-links');
    const userLinks = document.getElementById('user-links');
    const userNameDisplay = document.getElementById('user-name');

    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (authLinks) authLinks.classList.add('hidden');
        if (userLinks) userLinks.classList.remove('hidden');
        if (userNameDisplay && user) userNameDisplay.textContent = `Hi, ${user.name}`;
    } else {
        if (authLinks) authLinks.classList.remove('hidden');
        if (userLinks) userLinks.classList.add('hidden');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
});
