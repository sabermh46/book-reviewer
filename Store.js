export default class BookStore {
  constructor() {
    this.wishlistKey = 'bookWishlist';
    this.preferencesKey = 'bookPreferences';
  }

  getWishlist() {
    return JSON.parse(localStorage.getItem(this.wishlistKey)) || [];
  }

  toggleWishlist(bookId) {
    const wishlist = this.getWishlist();
    const index = wishlist.indexOf(bookId);
    
    if (index === -1) {
      wishlist.push(bookId);
    } else {
      wishlist.splice(index, 1);
    }
    
    localStorage.setItem(this.wishlistKey, JSON.stringify(wishlist));
    return index === -1;
  }

  savePreferences(prefs) {
    localStorage.setItem(this.preferencesKey, JSON.stringify(prefs));
  }

  getPreferences() {
    return JSON.parse(localStorage.getItem(this.preferencesKey)) || {
      search: '',
      topic: '',
      page: 1
    };
  }
}