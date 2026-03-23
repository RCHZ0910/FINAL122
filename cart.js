// ============================================
// KAPE-TID KO - SHARED CART SYSTEM
// ============================================

// Global cart variable
let cart = [];

// ============================================
// LOCALSTORAGE FUNCTIONS
// ============================================

function loadCart() {
    const savedCart = localStorage.getItem('kapetidko_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('kapetidko_cart', JSON.stringify(cart));
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showNotification('🗑️ Cart cleared!');
    }
}

// ============================================
// CART UI FUNCTIONS
// ============================================

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update count badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `₱${total.toLocaleString()}`;
    
    // Render items
    if (cart.length === 0) {
        const pageIcon = document.querySelector('header').textContent.trim().split(' ')[0];
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">${pageIcon}</div>
                <p>Your cart is empty</p>
                <small>Add some items from our menu!</small>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/70?text=☕'">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₱${item.price.toLocaleString()}</div>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})" title="Remove item">×</button>
            </div>
        `).join('');
    }
}

// ============================================
// CART OPERATIONS
// ============================================

function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
        showNotification(`➕ Added another ${name}!`);
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
        showNotification(`✅ ${name} added to cart!`);
    }
    
    saveCart();
    updateCartUI();
    
    // Auto-open cart when adding first item
    if (cart.length === 1 && existingItem === undefined) {
        setTimeout(() => toggleCart(), 300);
    }
}

function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
    showNotification(`❌ ${itemName} removed`);
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
        updateCartUI();
    }
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(text) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = text;
    notification.classList.add('show');
    
    // Play sound effect (optional - browser policy may block)
    // const audio = new Audio('notification.mp3');
    // audio.play().catch(e => console.log('Audio blocked'));
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

// ============================================
// RECEIPT / CHECKOUT SYSTEM
// ============================================

function showReceipt() {
    if (cart.length === 0) {
        showNotification('⚠️ Your cart is empty!');
        return;
    }
    
    const modal = document.getElementById('receiptModal');
    const receiptBody = document.getElementById('receiptBody');
    const receiptDate = document.getElementById('receiptDate');
    
    const now = new Date();
    const dateStr = now.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6);
    
    receiptDate.innerHTML = `
        <div><strong>Order #:</strong> ${orderNumber}</div>
        <div>Date: ${dateStr}</div>
    `;
    
    let itemsHtml = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHtml += `
            <div class="receipt-item">
                <span class="receipt-item-name">${item.name}</span>
                <span class="receipt-item-qty">x${item.quantity}</span>
                <span class="receipt-item-price">₱${itemTotal.toLocaleString()}</span>
            </div>
        `;
    });
    
    itemsHtml += `
        <div class="receipt-total">
            <span>TOTAL</span>
            <span>₱${total.toLocaleString()}</span>
        </div>
    `;
    
    receiptBody.innerHTML = itemsHtml;
    modal.classList.add('open');
    
    // Close cart when opening receipt
    toggleCart();
}

function closeReceipt() {
    const modal = document.getElementById('receiptModal');
    modal.classList.remove('open');
}

function printReceipt() {
    window.print();
    
    // Optional: Ask to clear cart after printing
    setTimeout(() => {
        if (confirm('Order completed! Clear cart?')) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    }, 500);
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load cart on page load
    loadCart();
    
    // Close modal on outside click
    const receiptModal = document.getElementById('receiptModal');
    if (receiptModal) {
        receiptModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeReceipt();
            }
        });
    }
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const sidebar = document.getElementById('cartSidebar');
            const overlay = document.getElementById('cartOverlay');
            const modal = document.getElementById('receiptModal');
            
            if (sidebar) sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('open');
            if (modal) modal.classList.remove('open');
        }
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getCartSummary() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { items: totalItems, total: totalPrice };
}

function isCartEmpty() {
    return cart.length === 0;
}
const links = document.querySelectorAll('.category-btn');
  const currentPage = window.location.pathname.split('/').pop();

  links.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

