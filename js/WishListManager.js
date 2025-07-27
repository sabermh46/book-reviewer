        class WishlistManager {
            static getWishlist() {
                return JSON.parse(localStorage.getItem('wishlist')) || [];
            }

            static isWishlisted(bookId) {
                const wishlist = WishlistManager.getWishlist();
                return wishlist.includes(parseInt(bookId)); // Ensure bookId is integer for comparison
            }

            static toggleWishlist(bookId) {
                const wishlist = WishlistManager.getWishlist();
                const idNum = parseInt(bookId);
                const index = wishlist.indexOf(idNum);
                let isWishlisted;

                if (index === -1) {
                    wishlist.push(idNum);
                    isWishlisted = true;
                } else {
                    wishlist.splice(index, 1);
                    isWishlisted = false;
                }

                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                    document.dispatchEvent(new CustomEvent('wishlistUpdated'));
                    return isWishlisted; // Return the new state
                }
            static getWishlistCount() {
                return WishlistManager.getWishlist().length;
            }
        }
