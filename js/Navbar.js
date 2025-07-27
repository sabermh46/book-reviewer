        class Navbar {
    constructor() {
        this.navbarElement = document.createElement('nav');
        this.renderBind = this.render.bind(this);
    }

    render() {
        const wishlistCount = WishlistManager.getWishlistCount();

        // Clear existing content
        while (this.navbarElement.firstChild) {
            this.navbarElement.removeChild(this.navbarElement.firstChild);
        }

        // Create brand div
        const brandDiv = document.createElement('div');
        brandDiv.className = 'brand';
        brandDiv.textContent = 'Gutendex Books';

        // Create nav links container
        const navLinks = document.createElement('div');
        navLinks.className = 'nav-links';

        // Create home link
        const homeLink = document.createElement('a');
        homeLink.href = '#/home';
        homeLink.textContent = 'Home';

        // Create wishlist link
        const wishlistLink = document.createElement('a');
        wishlistLink.href = '#/wishlist';
        wishlistLink.textContent = 'Wishlist '; // Space before count

        // Create wishlist count span if needed
        if (wishlistCount > 0) {
            const countSpan = document.createElement('span');
            countSpan.className = 'wishlist-count';
            countSpan.textContent = `(${wishlistCount})`;
            wishlistLink.appendChild(countSpan);
        }

        // Assemble the navigation
        navLinks.appendChild(homeLink);
        navLinks.appendChild(wishlistLink);
        this.navbarElement.appendChild(brandDiv);
        this.navbarElement.appendChild(navLinks);

        return this.navbarElement;
    }

    setupEventListeners() {
        document.addEventListener('wishlistUpdated', this.renderBind);
    }

    destroy() {
        document.removeEventListener('wishlistUpdated', this.renderBind);
    }
}
        