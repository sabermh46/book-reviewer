export default class BookApi {
  constructor(baseUrl = 'https://gutendex.com/books') {
    this.baseUrl = baseUrl;
  }

  async getBooks(page = 1, search = '', topic = '') {
    const params = new URLSearchParams({ page });
    if (search) params.set('search', search);
    if (topic) params.set('topic', topic);

    const response = await fetch(`${this.baseUrl}/?${params}`);
    if (!response.ok) throw new Error('Failed to fetch books');
    return response.json();
  }

  async getBook(id) {
    if (!id) throw new Error('Invalid book ID');
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) throw new Error('Book not found');
    return response.json();
  }
}