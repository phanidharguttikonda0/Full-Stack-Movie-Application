document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '/index.html';
        return;
    }

    const api = axios.create({
        baseURL: config.baseUrl,
        params: {
            api_key: config.apiKey
        }
    });

    // Fetch and display featured movie
    async function loadFeaturedMovie() {
        try {
            const response = await api.get('/trending/movie/day');
            const movie = response.data.results[0];
            const backdrop = `${config.imageBaseUrl}${config.backdropSize}${movie.backdrop_path}`;
            
            const featuredEl = document.getElementById('featuredMovie');
            featuredEl.style.backgroundImage = `url(${backdrop})`;
            featuredEl.innerHTML = `
                <div class="featured-content">
                    <h2>${movie.title}</h2>
                    <p>${movie.overview}</p>
                    <button class="btn-primary" onclick="playTrailer('${movie.id}')">
                        Watch Trailer
                    </button>
                </div>
            `;
        } catch (error) {
            console.error('Error loading featured movie:', error);
        }
    }

    // Load movie section
    async function loadMovieSection(sectionId, endpoint) {
        try {
            const response = await api.get(endpoint);
            const movies = response.data.results;
            const container = document.getElementById(sectionId);
            
            container.innerHTML = movies.map(movie => `
                <div class="movie-card" onclick="showMovieDetails('${movie.id}')">
                    <img src="${config.imageBaseUrl}${config.posterSize}${movie.poster_path}" 
                         alt="${movie.title}">
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.title}</h3>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error(`Error loading ${sectionId}:`, error);
        }
    }

    // Initialize page
    loadFeaturedMovie();
    loadMovieSection('trendingMovies', '/trending/movie/week');
    loadMovieSection('comedyMovies', '/discover/movie?with_genres=35');
    loadMovieSection('horrorMovies', '/discover/movie?with_genres=27');
    loadMovieSection('romanticMovies', '/discover/movie?with_genres=10749');
    loadMovieSection('teluguMovies', '/discover/movie?with_original_language=te');
});

// Show movie details modal
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