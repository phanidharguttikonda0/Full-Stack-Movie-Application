document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '/index.html';
        return;
    }

    const yearFilter = document.getElementById('yearFilter');
    const genreFilter = document.getElementById('genreFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const trendingResults = document.getElementById('trendingResults');

    const api = axios.create({
        baseURL: config.baseUrl,
        params: { api_key: config.apiKey }
    });

    // Populate year filter
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }

    // Fetch and populate genres
    async function loadGenres() {
        try {
            const response = await api.get('/genre/movie/list');
            response.data.genres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading genres:', error);
        }
    }

    // Load trending movies with filters
    async function loadTrendingMovies() {
        try {
            const year = yearFilter.value;
            const genreId = genreFilter.value;

            const params = {
                sort_by: 'popularity.desc',
                page: 1
            };

            if (year) params.primary_release_year = year;
            if (genreId) params.with_genres = genreId;

            const response = await api.get('/discover/movie', { params });
            const movies = response.data.results.slice(0, 20);

            trendingResults.innerHTML = movies.map(movie => `
                <div class="movie-card" onclick="showMovieDetails('${movie.id}')">
                    <img src="${config.imageBaseUrl}${config.posterSize}${movie.poster_path}" 
                         alt="${movie.title}"
                         onerror="this.src='https://via.placeholder.com/200x300?text=No+Poster'">
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.title}</h3>
                        <p>${movie.release_date?.split('-')[0] || 'N/A'}</p>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading trending movies:', error);
        }
    }

    loadGenres();
    loadTrendingMovies();

    applyFiltersBtn.addEventListener('click', loadTrendingMovies);
});

// Show movie details modal with trailer
async function showMovieDetails(movieId) {
    try {
        const api = axios.create({
            baseURL: config.baseUrl,
            params: { api_key: config.apiKey }
        });

        const response = await api.get(`/movie/${movieId}`);
        const movie = response.data;
        
        const modal = document.getElementById('movieModal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div style="display: flex; gap: 2rem;">
                <img src="${config.imageBaseUrl}${config.posterSize}${movie.poster_path}" 
                     alt="${movie.title}" 
                     style="width: 200px; border-radius: 4px;">
                <div>
                    <h2>${movie.title}</h2>
                    <p style="margin: 1rem 0;">${movie.overview}</p>
                    <p><strong>Rating:</strong> ${movie.vote_average}/10</p>
                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                    <button class="btn-primary" onclick="playTrailer('${movie.id}')" style="margin-top: 1rem;">
                        Watch Trailer
                    </button>
                </div>
            </div>
            <div id="trailerContainer"></div>
        `;
        
        modal.style.display = 'block';
        
        // Close modal when clicking the close button or outside the modal
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            const trailerContainer = document.getElementById('trailerContainer');
            trailerContainer.innerHTML = '';
        };
        
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                const trailerContainer = document.getElementById('trailerContainer');
                trailerContainer.innerHTML = '';
            }
        };
    } catch (error) {
        console.error('Error showing movie details:', error);
    }
}

// Play movie trailer
async function playTrailer(movieId) {
    try {
        const api = axios.create({
            baseURL: config.baseUrl,
            params: { api_key: config.apiKey }
        });

        const response = await api.get(`/movie/${movieId}/videos`);
        const videos = response.data.results;
        const trailer = videos.find(video => video.type === 'Trailer') || videos[0];
        
        if (trailer) {
            const trailerContainer = document.getElementById('trailerContainer');
            trailerContainer.innerHTML = `
                <div class="trailer-container">
                    <iframe
                        src="https://www.youtube.com/embed/${trailer.key}"
                        frameborder="0"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error playing trailer:', error);
    }
}