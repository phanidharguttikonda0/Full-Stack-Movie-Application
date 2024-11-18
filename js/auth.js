document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Skip validation and directly set login state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', document.getElementById('email').value || 'user@example.com');
            window.location.href = '/home.html';
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Skip validation and directly navigate to login
            window.location.href = '/index.html';
        });
    }
});