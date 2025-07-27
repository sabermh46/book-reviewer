class WishlistView {
    constructor(routerInstance) {
        this.router = routerInstance;
        this.renderBind = this.render.bind(this);
    }

    async render() {
        const content = document.getElementById('content');
        const wishlist = WishlistManager.getWishlist();

        // Clear content securely
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }

        if (wishlist.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-wishlist';

            const icon = document.createElement('div');
            icon.className = 'empty-icon';
            icon.textContent = '❤️';

            const heading = document.createElement('h3');
            heading.textContent = 'Your wishlist is empty';

            const message = document.createElement('p');
            message.textContent = 'Save books you\'re interested in by clicking the heart icon';

            const browseLink = document.createElement('a');
            browseLink.href = '#/home';
            browseLink.className = 'browse-books';
            browseLink.textContent = 'Browse books';

            emptyDiv.appendChild(icon);
            emptyDiv.appendChild(heading);
            emptyDiv.appendChild(message);
            emptyDiv.appendChild(browseLink);
            content.appendChild(emptyDiv);

            return;
        }

        // Create loading state
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';

        content.appendChild(spinner);

        try {
            const books = await Promise.all(
                wishlist.map(id => fetch(`https://gutendex.com/books/${encodeURIComponent(id)}`)
                    .then(r => {
                        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                        return r.json();
                    })
                )
            );

            // Clear loading state
            content.removeChild(spinner);

            // Create wishlist title
            const title = document.createElement('h2');
            title.textContent = 'Your Wishlist';
            content.appendChild(title);

            // Create books grid
            const grid = document.createElement('div');
            grid.className = 'books-grid';
            content.appendChild(grid);

            // Add books to grid
            books.forEach(book => {
                const card = document.createElement('div');
                card.className = 'book-card';
                card.dataset.id = book.id;

                const coverDiv = document.createElement('div');
                coverDiv.className = 'book-cover';

                const img = document.createElement('img');
                img.src = book.formats['image/jpeg'] || 'no-cover.jpg';
                img.alt = book.title;

                const wishlistBtn = document.createElement('button');
                wishlistBtn.className = 'wishlist-btn red';
                wishlistBtn.textContent = '❤';

                const infoDiv = document.createElement('div');
                infoDiv.className = 'book-info';

                const bookTitle = document.createElement('h3');
                bookTitle.textContent = book.title;

                const author = document.createElement('p');
                author.textContent = book.authors.map(a => a.name).join(', ') || 'N/A';

                coverDiv.appendChild(img);
                coverDiv.appendChild(wishlistBtn);
                infoDiv.appendChild(bookTitle);
                infoDiv.appendChild(author);
                card.appendChild(coverDiv);
                card.appendChild(infoDiv);
                grid.appendChild(card);
            });

            // Event delegation for card clicks
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.book-card');
                if (card) {
                    const bookId = card.dataset.id;
                    const wishlistBtn = e.target.closest('.wishlist-btn');
                    if (wishlistBtn) {
                        e.preventDefault();
                        WishlistManager.toggleWishlist(bookId);
                        card.remove();
                    } else {
                        window.location.hash = `#/book/${bookId}`;
                    }
                }
            });

        } catch (error) {
            console.error("Error loading wishlist:", error);
            // Replace loading with error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = 'Error loading wishlist. Please try again.';
            
            if (content.contains(spinner)) {
                content.replaceChild(errorDiv, spinner);
            } else {
                content.appendChild(errorDiv);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('wishlistUpdated', this.renderBind);
    }

    destroy() {
        document.removeEventListener('wishlistUpdated', this.renderBind);
    }
}
       