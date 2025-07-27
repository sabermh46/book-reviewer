document.addEventListener('DOMContentLoaded', () => {
            // Setup Navbar
            const navbar = new Navbar();
            document.getElementById('navbar').appendChild(navbar.render());
            navbar.setupEventListeners(); // Listen for wishlist updates

            let router;
            router = new Router();

            // Set default route
            if (!window.location.hash) {
                window.location.hash = '#/home';
            }
        });