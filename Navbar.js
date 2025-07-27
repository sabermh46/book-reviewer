import BookStore from "./Store.js";

export default class Navbar {
  constructor() {
    this.store = new BookStore();
  }

  render() {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    navbar.innerHTML = `
      <div class="navbar-brand">Book Library</div>
      <ul class="navbar-links">
        <li><a href="#home" class="nav-link">Home</a></li>
        <li><a href="#wishlist" class="nav-link">Wishlist</a></li>
      </ul>
    `;
    return navbar;
  }

  updateWishlistCount() {
    const wishlistCount = this.store.getWishlist().length;
    const wishlistLink = document.querySelector('.nav-link[href="#wishlist"]');
    if (wishlistLink) {
      wishlistLink.textContent = `Wishlist (${wishlistCount})`;
    }
  }
}