export default class BookCard {
  constructor(book, isWishlisted = false) {
    this.book = book;
    this.isWishlisted = isWishlisted;
  }
  
  render() {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-cover">
        <img src="${this.book.formats['image/jpeg'] || 'no-cover.jpg'}" alt="${this.book.title}">
        <button class="wishlist-btn ${this.isWishlisted ? 'active' : ''}">♥</button>
      </div>
      <div class="book-info">
        <h3>${this.book.title}</h3>
        <p>${this.book.authors.map(a => a.name).join(', ')}</p>
      </div>
    `;
    
    card.addEventListener('click', () => {
      window.location.hash = `book/${this.book.id}`;
    });
    
    card.querySelector('.wishlist-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleWishlist();
    });
    
    return card;
  }
  
  toggleWishlist() {
    const store = new BookStore();
    store.toggleWishlist(this.book.id);
  }
}