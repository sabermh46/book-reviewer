class LoadingManager {
  constructor() {
    this.initOverlay();
    this.queue = 0;
  }

  initOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.setAttribute('aria-live', 'polite');
    this.overlay.setAttribute('aria-busy', 'true');
    this.overlay.innerHTML = `
      <div class="loading-spinner" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    `;
    document.body.appendChild(this.overlay);
  }

  show() {
    this.queue++;
    if (this.queue === 1) {
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    this.queue = Math.max(0, this.queue - 1);
    if (this.queue === 0) {
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}

// Singleton instance
const loadingManager = new LoadingManager();
export default loadingManager;