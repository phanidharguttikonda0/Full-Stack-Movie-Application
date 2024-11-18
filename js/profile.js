document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '/index.html';
        return;
    }

    const userEmail = document.getElementById('userEmail');
    const watchHistory = document.getElementById('watchHistory');
    const favoriteMovies = document.getElementById('favoriteMovies');
    const logoutBtn = document.getElementById('logoutBtn');

    // Display user email
    userEmail.textContent = localStorage.getItem('userEmail') || 'user@example.com';

    // Mock watch history data
    const mockHistory = [
        { id: 1, title: 'Movie 1', poster: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop' },
        { id: 2, title: 'Movie 2', poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop' },
        // Add more mock data as needed
    ];

    // Mock favorites data
    const mockFavorites = [
        { id: 3, title: 'Movie 3', poster: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=200&h=300&fit=crop' },
        { id: 4, title: 'Movie 4', poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=300&fit=crop' },
        // Add more mock data as needed
    ];

    // Populate watch history
    watchHistory.innerHTML = mockHistory.map(movie => `
        <div class="movie-thumbnail">
            <img src="${movie.poster}" alt="${movie.title}">
        </div>
    `).join('');

    // Populate favorites
    favoriteMovies.innerHTML = mockFavorites.map(movie => `
        <div class="movie-thumbnail">
            <img src="${movie.poster}" alt="${movie.title}">
        </div>
    `).join('');

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        window.location.href = '/index.html';
    });
});