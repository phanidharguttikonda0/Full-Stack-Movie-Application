document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '/index.html';
        return;
    }

    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const searchResults = document.getElementById('searchResults');
    let debounceTimeout;

    const api = axios.create({
        baseURL: config.baseUrl,
        params: { api_key: config.apiKey }
    });

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const query = e.target.value.trim();

        if (query.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        debounceTimeout = setTimeout(async () => {
            try {
                const response = await api.get('/search/movie', {
                    params: { query }
                });

                const movies = response.data.results.slice(0, 5);
                searchSuggestions.innerHTML = movies.map(movie => `
                    <div class="suggestion-item" onclick="showMovieDetails('${movie.id}')">
                        ${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'})
                    </div>
                `).join('');

                searchSuggestions.style.display = 'block';
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }, 300);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchSuggestions.contains(e.target) && e.target !== searchInput) {
            searchSuggestions.style.display = 'none';
        }
    });

    // Search form submission
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query.length < 2) return;

            try {
                const response = await api.get('/search/movie', {
                    params: { query }
                });

                searchResults.innerHTML = response.data.results.map(movie => `
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

                searchSuggestions.style.display = 'none';
            } catch (error) {
                console.error('Error searching movies:', error);
            }
        }
    });
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