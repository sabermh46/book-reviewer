class RouteObserver {
  constructor() {
    this.currentRoute = null;
    this.currentBookId = null;
    this.modalOpen = false;
    this.init();
  }

  init() {
    // Observe URL changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    
    // Initial route handling
    this.handleRouteChange();
  }

  handleRouteChange() {
    const hash = window.location.hash.substring(1);
    const [route, id] = hash.split('/');

    // Skip if no actual change
    if (route === this.currentRoute && id === this.currentBookId) {
      return;
    }

    this.currentRoute = route || 'home';
    this.currentBookId = id;

    this.handleRouteTransition();
  }

  handleRouteTransition() {
    // Close modal if no book ID in URL
    if (!this.currentBookId) {
      this.closeBookModal();
      this.renderMainView();
      return;
    }

    // Open modal if book ID exists
    this.openBookModal(this.currentBookId);
  }

  async renderMainView() {
    const content = document.getElementById('content');
    
    // Clear existing content
    content.innerHTML = '';

    // Load appropriate view
    if (this.currentRoute === 'wishlist') {
      const { default: WishlistView } = await import('./wishlist.js');
      new WishlistView().render();
    } else {
      const { default: HomeView } = await import('./HomeView.js');
      new HomeView().render();
    }
  }

  async openBookModal(bookId) {
    this.modalOpen = true;
    const modal = document.getElementById('book-modal');
    const content = document.getElementById('book-detail-content');

    modal.classList.add('show');
    
    try {
      const { default: BookApi } = await import('./api.js');
      const api = new BookApi();
      const book = await api.getBook(bookId);
      
      // Render book details
      content.innerHTML = `
        <div class="book-detail">
          <!-- Your book detail HTML here -->
        </div>
      `;

      // Add close handlers
      document.querySelector('.close-btn').addEventListener('click', () => {
        this.navigateTo(this.currentRoute);
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.navigateTo(this.currentRoute);
        }
      });

    } catch (error) {
      content.innerHTML = `<div class="error">Error loading book</div>`;
      console.error(error);
    }
  }

  closeBookModal() {
    if (!this.modalOpen) return;
    
    const modal = document.getElementById('book-modal');
    modal.classList.remove('show');
    this.modalOpen = false;
  }

  navigateTo(route) {
    window.location.hash = route;
  }
}

export default RouteObserver;