        class HomeView {
    constructor(routerInstance) {
        this.router = routerInstance;
        this.currentPage = 1;
        this.searchTerm = '';
        this.filterTopic = '';
        this.books = [];
    }

    async render() {
        const content = document.getElementById('content');
        
        // Clear content securely
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        // Create controls container
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'controls';

        // Create search box
        const searchBox = document.createElement('div');
        searchBox.className = 'search-box';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search books...';
        searchInput.value = this.searchTerm;

        const clearSearch = document.createElement('button');
        clearSearch.className = 'clear-search';
        clearSearch.textContent = '×';

        searchBox.appendChild(searchInput);
        searchBox.appendChild(clearSearch);

        // Create topic filter
        const topicFilter = document.createElement('select');
        topicFilter.className = 'topic-filter';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Topics';
        topicFilter.appendChild(defaultOption);

        controlsDiv.appendChild(searchBox);
        controlsDiv.appendChild(topicFilter);

        // Create books grid
        const booksGrid = document.createElement('div');
        booksGrid.className = 'books-grid';

        // Create pagination
        const pagination = document.createElement('div');
        pagination.className = 'pagination';

        // Assemble main structure
        content.appendChild(controlsDiv);
        content.appendChild(booksGrid);
        content.appendChild(pagination);

        await this.loadBooks();
        this.setupEventListeners();
    }

    destroy() {
        // Cleanup remains the same as before
    }

    async loadBooks() {
        const content = document.getElementById('content');
        const booksGrid = content.querySelector('.books-grid');
        
        if (booksGrid) {
            // Clear and show loading state
            while (booksGrid.firstChild) {
                booksGrid.removeChild(booksGrid.firstChild);
            }
            // Replace loading div with:
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';

            booksGrid.appendChild(spinner);
        }

        let url = `https://gutendex.com/books/?page=${this.currentPage}`;
        if (this.searchTerm) url += `&search=${encodeURIComponent(this.searchTerm)}`;
        if (this.filterTopic) url += `&topic=${encodeURIComponent(this.filterTopic)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            this.books = data.results;
            this.renderBooks(data.count);
            this.populateTopics();
        } catch (error) {
            console.error("Error loading books:", error);
            if (booksGrid) {
                while (booksGrid.firstChild) {
                    booksGrid.removeChild(booksGrid.firstChild);
                }
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.textContent = 'Error loading books. Please try again.';
                booksGrid.appendChild(errorDiv);
            }
        }
    }

    renderBooks(totalCount) {
        const grid = document.querySelector('.books-grid');
        if (!grid) return;

        const pagination = document.querySelector('.pagination');
        
        // Clear existing content
        while (grid.firstChild) {
            grid.removeChild(grid.firstChild);
        }

        if (this.books.length === 0) {
            grid.classList.add('no-results');
            
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            
            const icon = document.createElement('div');
            icon.className = 'no-results-icon';
            icon.textContent = '🔍';
            
            const heading = document.createElement('h3');
            heading.textContent = 'No books found';
            
            const message = document.createElement('p');
            message.textContent = 'Try adjusting your search or filter criteria';
            
            const clearBtn = document.createElement('button');
            clearBtn.className = 'clear-filters';
            clearBtn.textContent = 'Clear all filters';
            
            noResultsDiv.appendChild(icon);
            noResultsDiv.appendChild(heading);
            noResultsDiv.appendChild(message);
            noResultsDiv.appendChild(clearBtn);
            grid.appendChild(noResultsDiv);

            clearBtn.addEventListener('click', () => {
                this.searchTerm = '';
                this.filterTopic = '';
                this.currentPage = 1;
                
                const searchInput = document.querySelector('.search-box input');
                if (searchInput) searchInput.value = '';
                
                const topicFilter = document.querySelector('.topic-filter');
                if (topicFilter) topicFilter.value = '';
                
                this.loadBooks();
            });
            
            return;
        }

        grid.classList.remove('no-results');
        
        this.books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.dataset.id = book.id;

            const coverDiv = document.createElement('div');
            coverDiv.className = 'book-cover';

            const img = document.createElement('img');
            img.src = book.formats['image/jpeg'] || 'no-cover.jpg';
            img.alt = book.title;

            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = `wishlist-btn ${WishlistManager.isWishlisted(book.id) ? 'red' : ''}`;
            wishlistBtn.textContent = '❤';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'book-info';

            const title = document.createElement('h3');
            title.textContent = book.title;

            const author = document.createElement('p');
            author.textContent = book.authors.map(a => a.name).join(', ') || 'N/A';

            coverDiv.appendChild(img);
            coverDiv.appendChild(wishlistBtn);
            infoDiv.appendChild(title);
            infoDiv.appendChild(author);
            card.appendChild(coverDiv);
            card.appendChild(infoDiv);
            grid.appendChild(card);
        });

        this.setupPagination(totalCount);
    }

    setupPagination(totalCount) {
        const totalPages = Math.ceil(totalCount / 32);
        const pagination = document.querySelector('.pagination');

        if (!pagination || totalPages <= 1) {
            if (pagination) {
                while (pagination.firstChild) {
                    pagination.removeChild(pagination.firstChild);
                }
            }
            return;
        }

        // Clear existing pagination
        while (pagination.firstChild) {
            pagination.removeChild(pagination.firstChild);
        }

        const prevBtn = document.createElement('button');
        prevBtn.className = 'prev-btn';
        prevBtn.textContent = 'Previous';
        if (this.currentPage === 1) prevBtn.disabled = true;

        const nextBtn = document.createElement('button');
        nextBtn.className = 'next-btn';
        nextBtn.textContent = 'Next';
        if (this.currentPage === totalPages) nextBtn.disabled = true;

        // Create page buttons
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, this.currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) endPage = Math.min(totalPages, startPage + 4);
            else if (endPage === totalPages) startPage = Math.max(1, endPage - 4);
        }

        pagination.appendChild(prevBtn);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-btn ${i === this.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pagination.appendChild(pageBtn);
        }

        pagination.appendChild(nextBtn);

        // Event listeners
        prevBtn.addEventListener('click', () => {
            this.currentPage--;
            this.loadBooks();
        });

        nextBtn.addEventListener('click', () => {
            this.currentPage++;
            this.loadBooks();
        });

        pagination.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentPage = parseInt(btn.textContent);
                this.loadBooks();
            });
        });
    }

    populateTopics() {
        const topics = new Set();
        this.books.forEach(book => {
            book.subjects?.forEach(subject => {
                const mainTopic = subject.split(' -- ')[0].split('(')[0].trim();
                if (mainTopic) topics.add(mainTopic);
            });
        });

        const select = document.querySelector('.topic-filter');
        if (!select) return;

        // Clear options except first one
        while (select.childNodes.length > 1) {
            select.removeChild(select.lastChild);
        }

        Array.from(topics).sort().forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            option.selected = this.filterTopic === topic;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        const content = document.getElementById('content');

        // Search with debounce
        let searchTimeout;
        content.querySelector('.search-box input')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value.trim();
                this.currentPage = 1;
                this.loadBooks();
            }, 500);
        });

        // Clear search
        content.querySelector('.clear-search')?.addEventListener('click', () => {
            const searchInput = content.querySelector('.search-box input');
            if (searchInput) searchInput.value = '';
            this.searchTerm = '';
            this.currentPage = 1;
            this.loadBooks();
        });

        // Topic filter
        content.querySelector('.topic-filter')?.addEventListener('change', (e) => {
            this.filterTopic = e.target.value;
            this.currentPage = 1;
            this.loadBooks();
        });

        // Book card clicks (event delegation)
        content.querySelector('.books-grid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.book-card');
            if (card) {
                const bookId = card.dataset.id;
                const wishlistBtn = e.target.closest('.wishlist-btn');
                if (wishlistBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const isWishlisted = WishlistManager.toggleWishlist(bookId);
                    wishlistBtn.classList.toggle('red', isWishlisted);
                } else {
                    window.location.hash = `#/book/${bookId}`;
                }
            }
        });
    }
}
    