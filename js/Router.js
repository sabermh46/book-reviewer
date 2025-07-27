        class Router {
    constructor() {
        this.routes = new Map();
        this.currentView = null;
        this.previousHash = '';
        this.hashBeforeModal = '';
        this.modalOpenHash = '';

        this.parseRoutesConfig({
            '#/home': () => new HomeView(this),
            '#/book/:id': (params) => this.showBookModal(params.id),
            '#/wishlist': () => new WishlistView(this)
        });
        this.init();
    }

    parseRoutesConfig(config) {
        for (const path in config) {
            if (config.hasOwnProperty(path)) {
                // Escape special regex characters except for the parameter syntax
                let regexPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                                  .replace(/:(\w+)/g, '([^/]+)'); // Convert :param to regex group

                // Ensure the regex correctly matches the full hash, with optional trailing slash
                if (regexPath.endsWith('/')) {
                    regexPath = regexPath.slice(0, -1) + '(/)?$'; // Match with or without trailing slash
                } else {
                    regexPath += '(/)?$'; // Add optional trailing slash if not already there
                }
                const regex = new RegExp(`^${regexPath}`);

                // Extract parameter names from the original path string
                const paramNames = (path.match(/:(\w+)/g) || []).map(p => p.substring(1));

                this.routes.set(regex, { handler: config[path], paramNames: paramNames });
            }
        }
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    async handleRoute() {
        const hash = window.location.hash || '#/home';

        // --- Step 1: Handle Modal State Transitions ---

        // If navigating to a book modal
        if (hash.startsWith('#/book/')) {
            // If no modal was previously marked as open, record the current 'previousHash'
            if (!this.modalOpenHash) {
                this.hashBeforeModal = (this.previousHash && !this.previousHash.startsWith('#/book/')) 
                ? this.previousHash 
                : '#/home'; // Fallback to home if no actual previous hash
                if (!this.currentView && this.previousHash === '') {
                    this.currentView = new HomeView(this);
                    await this.currentView.render();
                }
            }
            this.modalOpenHash = hash; // Mark the current book hash as the open modal
            const bookId = hash.split('/')[2];
            await this.showBookModal(bookId);
            return;
        }
        // If navigating away from a book modal (to a non-modal hash)
        else {
            if (this.modalOpenHash) { // Check if a modal was actually open
                this.closeBookModal(); // Close the modal overlay
                this.modalOpenHash = ''; // Reset modal state

                if (hash === this.hashBeforeModal) {
                    this.previousHash = hash; // Ensure previousHash is correctly set for future navigations
                    return; // Prevent further processing if just closing modal to same page
                }
            }
            if (this.currentView?.destroy) {
                this.currentView.destroy();
            }
        }

        if (hash === this.previousHash) {
            return;
        }
        this.previousHash = hash;

        // --- Step 3: Match and Execute Route Handler ---

        let matchedRouteHandler = null;
        let pathParams = {};

        // Iterate through registered routes to find a match using regex
        for (const [regex, routeConfig] of this.routes) {
            const match = hash.match(regex);
            if (match) {
                matchedRouteHandler = routeConfig.handler;
                // Extract parameters from the regex match
                routeConfig.paramNames.forEach((name, index) => {
                    pathParams[name] = match[index + 1]; // match[0] is the full match, params start from match[1]
                });
                break; // Found a match, stop searching
            }
        }

        if (matchedRouteHandler) {
            this.currentView = await matchedRouteHandler(pathParams); // Handler can return a view instance
            if (this.currentView && typeof this.currentView.render === 'function' && !hash.startsWith('#/book/')) {
                 // Only render if it's a full page view (not a modal that overlays)
                this.currentView.render();
            }
        } else {
            // No route matched, handle as a 404 or redirect to home
            console.warn(`No route found for: ${hash}. Redirecting to home.`);
            window.location.hash = '#/home';
        }
    }

    // Displays the book details modal
    async showBookModal(bookId) {
    const modal = document.getElementById('book-modal');
    const content = document.getElementById('book-detail-content');

    // Clear content securely
    while (content.firstChild) {
        content.removeChild(content.firstChild);
    }

    // Create loading state
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    content.appendChild(spinner);

    modal.classList.add('show');

    try {
        const response = await fetch(`https://gutendex.com/books/${encodeURIComponent(bookId)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const book = await response.json();

        // Create modal structure
        const bookDetail = document.createElement('div');
        bookDetail.className = 'book-detail';

        // Create cover section
        const coverDiv = document.createElement('div');
        coverDiv.className = 'book-detail-cover';
        
        const img = document.createElement('img');
        img.src = book.formats['image/jpeg'] || 'no-cover.jpg';
        img.alt = book.title;
        coverDiv.appendChild(img);

        // Create info section
        const infoDiv = document.createElement('div');
        infoDiv.className = 'book-detail-info';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = book.title;
        infoDiv.appendChild(title);

        // Action buttons row (flex)
        const actionRow = document.createElement('div');
        actionRow.className = 'book-actions';
        
        // Wishlist button
        const wishlistBtn = document.createElement('button');
        wishlistBtn.className = `wishlist-btn ${WishlistManager.isWishlisted(book.id) ? 'red' : ''}`;
        wishlistBtn.textContent = '❤';
        actionRow.appendChild(wishlistBtn);
        
        // Downloads count with symbol
        const downloadsDiv = document.createElement('div');
        downloadsDiv.className = 'book-stat';
        downloadsDiv.textContent = `⇩ ${book.download_count?.toLocaleString() || '0'}`;
        actionRow.appendChild(downloadsDiv);
        
        // Language with symbol
        const languageDiv = document.createElement('div');
        languageDiv.className = 'book-stat';
        const langCode = book.languages?.[0] || 'en';
        const languageSymbol = langCode === 'ja' ? '日本' : 
                             langCode === 'fr' ? '🇫🇷' : 
                             langCode === 'es' ? '🇪🇸' : 
                             langCode === 'de' ? '🇩🇪' : '🌐';
        languageDiv.textContent = `${languageSymbol} ${langCode.toUpperCase()}`;
        actionRow.appendChild(languageDiv);
        
        infoDiv.appendChild(actionRow);

        // Author
        if (book.authors?.length > 0) {
            const authorDiv = document.createElement('div');
            authorDiv.className = 'book-meta-item';
            const authorText = document.createTextNode(
                `Author: ${book.authors.map(a => {
                    let authorStr = a.name;
                    if (a.birth_year || a.death_year) {
                        authorStr += ` (${a.birth_year || '?'}-${a.death_year || '?'})`;
                    }
                    return authorStr;
                }).join(', ')}`
            );
            authorDiv.appendChild(authorText);
            infoDiv.appendChild(authorDiv);
        }

        // Subjects
        if (book.subjects?.length > 0) {
            const subjectsDiv = document.createElement('div');
            subjectsDiv.className = 'book-meta-item';
            const subjectsText = document.createTextNode(
                `Subjects: ${book.subjects.slice(0, 5).join(', ')}`
            );
            subjectsDiv.appendChild(subjectsText);
            infoDiv.appendChild(subjectsDiv);
        }

        // Categories
        if (book.bookshelves?.length > 0) {
            const categoriesDiv = document.createElement('div');
            categoriesDiv.className = 'book-meta-item';
            const categoriesText = document.createTextNode(
                `Categories: ${book.bookshelves.slice(0, 3).join(', ')}`
            );
            categoriesDiv.appendChild(categoriesText);
            infoDiv.appendChild(categoriesDiv);
        }

        // Links
        const linksDiv = document.createElement('div');
        linksDiv.className = 'book-links';
        
        if (book.formats['text/html']) {
            const readLink = document.createElement('a');
            readLink.href = book.formats['text/html'];
            readLink.className = 'book-link';
            readLink.textContent = '🌐 Read Online';
            readLink.target = '_blank';
            readLink.rel = 'noopener noreferrer';
            linksDiv.appendChild(readLink);
        }
        
        if (book.formats['application/epub+zip']) {
            const epubLink = document.createElement('a');
            epubLink.href = book.formats['application/epub+zip'];
            epubLink.className = 'book-link';
            epubLink.textContent = '⇩ Download EPUB';
            epubLink.target = '_blank';
            epubLink.rel = 'noopener noreferrer';
            linksDiv.appendChild(epubLink);
        }
        
        infoDiv.appendChild(linksDiv);

        // Summary
        if (book.summaries?.length > 0) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'book-summary';
            
            const summaryHeading = document.createElement('h3');
            summaryHeading.textContent = 'Summary';
            summaryDiv.appendChild(summaryHeading);
            
            const summaryText = document.createElement('p');
            summaryText.textContent = book.summaries[0];
            summaryDiv.appendChild(summaryText);
            
            infoDiv.appendChild(summaryDiv);
        }

        // Assemble main structure
        bookDetail.appendChild(coverDiv);
        bookDetail.appendChild(infoDiv);

        // Replace loading with content
        content.replaceChild(bookDetail, spinner);

        // Add wishlist button handler
        wishlistBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isWishlisted = WishlistManager.toggleWishlist(book.id);
            wishlistBtn.classList.toggle('red', isWishlisted);
        });

    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = 'Error loading book details. Please try again.';
        content.replaceChild(errorDiv, spinner);
        console.error("Error fetching book details:", error);
    }

    // Close handlers
    const closeModal = () => {
        window.location.hash = this.hashBeforeModal;
    };

    document.querySelector('.close-btn').onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

closeBookModal() {
        const modal = document.getElementById('book-modal');
        const content = document.getElementById('book-detail-content');
        
        modal?.classList.remove('show');
        
        // Clear content securely
        while (content.firstChild) {
            content.removeChild(content.firstChild);
        }
        
        if (this.hashBeforeModal === '#/home' && this.previousHash === '') {
            window.location.hash = '#/home';
        } else {
            history.replaceState(null, '', this.hashBeforeModal);
            this.previousHash = this.hashBeforeModal;
        }
    }
    // Hides and clears the book details modal
    closeBookModal() {
        const modal = document.getElementById('book-modal');
        modal?.classList.remove('show');
        document.getElementById('book-detail-content').innerHTML = '';
        
        // Only force navigation if we came from direct URL access
        if (this.hashBeforeModal === '#/home' && this.previousHash === '') {
            window.location.hash = '#/home';
        }
        // Otherwise just update the URL without triggering navigation
        else {
            history.replaceState(null, '', this.hashBeforeModal);
            this.previousHash = this.hashBeforeModal;
        }
    }
}
        
