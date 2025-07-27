import BookApi from './api.js';
import BookCard from './BookCard.js';
import BookStore from './Store.js';
import loadingManager from './loading.js';

export default class HomeView {
  constructor() {
    this.api = new BookApi();
    this.store = new BookStore();
    this.books = [];
    this.currentPage = 1;
    this.searchTerm = '';
    this.filterTopic = '';
  }

  async render() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="search-filter-container">
        <div class="search-box">
          <input type="text" placeholder="Search books..." class="search-input">
          <button class="clear-search">&times;</button>
        </div>
        <div class="filter-select">
          <select class="topic-filter">
            <option value="">All Topics</option>
          </select>
        </div>
      </div>
      <div class="books-grid"></div>
      <div class="pagination"></div>
    `;

    await this.loadBooks();
    this.setupEventListeners();
  }

  async loadBooks() {
    loadingManager.show();
    
    try {
      const data = await this.api.getBooks(this.currentPage, this.searchTerm, this.filterTopic);
      this.books = data.results;
      this.renderBooks();
      this.setupPagination(data.count);
      this.populateTopics(data.results);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      loadingManager.hide();
    }
  }

  renderBooks() {
    const booksGrid = document.querySelector('.books-grid');
    booksGrid.innerHTML = '';
    
    const wishlist = this.store.getWishlist();
    this.books.forEach(book => {
      const isWishlisted = wishlist.includes(book.id);
      const bookCard = new BookCard(book, isWishlisted);
      booksGrid.appendChild(bookCard.render());
    });
  }

  setupPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / 32);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';
    
    if (totalPages > 1) {
      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Previous';
      prevBtn.disabled = this.currentPage === 1;
      prevBtn.addEventListener('click', () => {
        this.currentPage--;
        this.loadBooks();
      });
      pagination.appendChild(prevBtn);
      
      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = this.currentPage === i ? 'active' : '';
        pageBtn.addEventListener('click', () => {
          this.currentPage = i;
          this.loadBooks();
        });
        pagination.appendChild(pageBtn);
      }
      
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next';
      nextBtn.disabled = this.currentPage === totalPages;
      nextBtn.addEventListener('click', () => {
        this.currentPage++;
        this.loadBooks();
      });
      pagination.appendChild(nextBtn);
    }
  }

  setupEventListeners() {
    // Search with debounce
    const searchInput = document.querySelector('.search-input');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchTerm = e.target.value;
        this.currentPage = 1;
        this.loadBooks();
      }, 500);
    });

    // Clear search
    document.querySelector('.clear-search').addEventListener('click', () => {
      searchInput.value = '';
      this.searchTerm = '';
      this.currentPage = 1;
      this.loadBooks();
    });

    // Topic filter
    document.querySelector('.topic-filter').addEventListener('change', (e) => {
      this.filterTopic = e.target.value;
      this.currentPage = 1;
      this.loadBooks();
    });
  }

  populateTopics(books) {
    const topics = new Set();
    books.forEach(book => {
      if (book.subjects) {
        book.subjects.forEach(topic => {
          topics.add(topic.split(',')[0].trim());
        });
      }
    });
    
    const topicFilter = document.querySelector('.topic-filter');
    topics.forEach(topic => {
      const option = document.createElement('option');
      option.value = topic;
      option.textContent = topic;
      topicFilter.appendChild(option);
    });
  }
}