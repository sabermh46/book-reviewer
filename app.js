import RouteObserver from './routeObserver.js';
import Navbar from './Navbar.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize navbar
  const navbar = new Navbar();
  document.getElementById('navbar').appendChild(navbar.render());

  // Initialize route observer
  new RouteObserver();
  
  // Set default route if empty
  if (!window.location.hash) {
    window.location.hash = 'home';
  }
});