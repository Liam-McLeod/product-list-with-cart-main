let userCart = [];
let productList = [];
const productMap = new Map();

async function getData() {
    const response = await fetch('data.json');
    productList = await response.json();
    // Loop through each product in the list
    productList.forEach(product => {

        // Assign UUID
        product.id = crypto.randomUUID();

        // Add product to Map
        productMap.set(product.id, product);

        // Render product
        renderProduct(product);
    });
}

function renderProduct(product) {
    const productGrid = document.querySelector('.product-grid');
    const cardHTML =
        `
        <div class="product-card" data-id="${product.id}">

            <div class= "image-container">

                <picture>
                    <source media="(min-width:768px)" srcset=${product.image.tablet}>
                    <source media="(min-width:1200px)" srcset=${product.image.desktop}>
                    <img class="product-image" src=${product.image.mobile}>
                </picture>
                <button class="cart-btn add-to-cart"><img src="assets/images/icon-add-to-cart.svg" >Add to Cart</button>

                <div class="cart-btn cart-quantity hidden">
                    <button class="decrement"><img src="assets/images/icon-decrement-quantity.svg" ></button>
                    <span class="quantity-display">1</span> 
                    <button class="increment"><img src="assets/images/icon-increment-quantity.svg" ></button>
                </div>

            </div>
            <div class="card-content">
                <p>${product.category}</p>
                <h3>${product.name}</h3>
                <span>$${(product.price).toFixed(2)}</span>
            </div>
        </div>`

        productGrid.insertAdjacentHTML('beforeend', cardHTML);
        // Attach events to the newly created product card
        let productCard = productGrid.lastElementChild;
        attachProductCardEvents(productCard);
}


function attachProductCardEvents(productCard) {

    const addToCartBtn = productCard.querySelector('.add-to-cart');
    const incrementBtn = productCard.querySelector('.increment');
    const decrementBtn = productCard.querySelector('.decrement');

    const cartQuantityControls = productCard.querySelector('.cart-quantity');
    const quantityDisplay = productCard.querySelector('.quantity-display');

    // Add to Cart
    addToCartBtn.addEventListener('click', () => {

        const productId = productCard.dataset.id;
        const product = productMap.get(productId);
        userCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image.thumbnail,
            quantity: 1
        })

        // Swap button views
        addToCartBtn.classList.add('hidden');
        cartQuantityControls.classList.remove('hidden');
        displayCart();
    });

    // Increment
    incrementBtn.addEventListener('click', () => {
        let productInCart = userCart.find(item => item.id === productCard.dataset.id);
        productInCart.quantity++;
        quantityDisplay.textContent = productInCart.quantity;
        displayCart();
    });

    // Decrement
    decrementBtn.addEventListener('click', () => {
        let productInCart = userCart.find(item => item.id === productCard.dataset.id);
        if (productInCart.quantity > 1) {
            productInCart.quantity--;
            quantityDisplay.textContent = productInCart.quantity;
        } else {
            // If quantity is 0, remove from cart
            const index = userCart.indexOf(productInCart);
            userCart.splice(index, 1);
            // Swap button views
            cartQuantityControls.classList.add('hidden');
            addToCartBtn.classList.remove('hidden');
        }
        displayCart();
    });
    
}

function displayCart() {
    const cartContainer = document.querySelector('.cart-items');
    const cartCountDisplay = document.querySelector('.cart-count');
    const cartTotalDisplay = document.querySelector('.total-price');
    cartContainer.innerHTML = ''; // Clear previous items
    let cartTotal = 0;
    let cartCount = 0;

    // Swap Cart Views
    if (userCart.length === 0) {
        document.querySelector('.cart-card-empty').classList.remove('hidden');
        document.querySelector('.cart-card-full').classList.add('hidden');
        return;
    }

    document.querySelector('.cart-card-empty').classList.add('hidden');
    document.querySelector('.cart-card-full').classList.remove('hidden');

    // Render each item in the cart
    userCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        cartTotal += itemTotal;
        cartCount += item.quantity;

        let cartItemHTML =
        `<div class="cart-item" data-id="${item.id}">
            <p class="item-name">${item.name}</p>
            <div>
                <p class="item-quantity">${item.quantity}x</p>
                <p class="item-price">@ $${(item.price).toFixed(2)}</p>
                <p class="item-total">$${itemTotal.toFixed(2)}</p>
            </div>
            <button><img src="assets/images/icon-remove-item.svg" alt=""></button>
        </div>
        ` 
        cartContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        cartCountDisplay.textContent = `(${cartCount})`;
        cartTotalDisplay.textContent = `$${cartTotal.toFixed(2)}`;

        // Attach events to the newly created cart item card
        let cartItemCard = cartContainer.lastElementChild;
        attachCartItemEvents(cartItemCard);
    });


}

function attachCartItemEvents(cartItemCard) {
    const removeItemBtn = cartItemCard.querySelector('button');

    // Remove Item from Cart
    removeItemBtn.addEventListener('click', () => {
        let cartItem = userCart.find(item => item.id === cartItemCard.dataset.id);
        const index = userCart.indexOf(cartItem);
        userCart.splice(index, 1);
        displayCart();
        // Reset the product card view when removed directly from cart
        const productCard = document.querySelector(`.product-card[data-id="${cartItem.id}"]`);
        const quantityDisplay = productCard.querySelector('.quantity-display');
        productCard.querySelector('.cart-quantity').classList.add('hidden');
        productCard.querySelector('.add-to-cart').classList.remove('hidden');
        quantityDisplay.textContent = '1';
    });
}

function displayOrderConfirmation() {
    let orderItemsContainer = document.querySelector('.order-items');
    orderItemsContainer.innerHTML = ''; // Clear previous items
    let orderTotal = 0;

    // Display the order confirmation modal
    document.querySelector('.order-confirmed-modal').classList.remove('hidden');
    document.querySelector('.overlay').classList.remove('hidden');

    // Render each item in the cart
    userCart.forEach(orderItem => {
        const orderItemTotal = orderItem.price * orderItem.quantity;
        orderTotal += orderItemTotal;

        let orderItemHTML =
        `<div class="order-item" data-id="${orderItem.id}">
            <img class="item-image" src="${orderItem.image}" alt="${orderItem.name}">
            <div>
                <p class="item-name truncate">${orderItem.name}</p>
                <p class="item-quantity">${orderItem.quantity}x</p>
                <p class="orderItem-price">@ $${(orderItem.price).toFixed(2)}</p>
            </div>
            <p class="orderItem-total">$${orderItemTotal.toFixed(2)}</p>
        </div>`

        orderItemsContainer.insertAdjacentHTML('beforeend', orderItemHTML);
    });

    // Display order total
    const orderTotalHTML = 
        `<div class="order-total">
            <p>Order Total</p>
            <p class="order-total-price">$${orderTotal.toFixed(2)}</p>
        </div>`;

    orderItemsContainer.insertAdjacentHTML('beforeend', orderTotalHTML);

}

function startNewOrder() {
    // Reset the user cart and display
    userCart.length = 0;
    displayCart();

    // Hide the order confirmation modal
    document.querySelector('.order-confirmed-modal').classList.add('hidden');
    document.querySelector('.overlay').classList.add('hidden');

    // Reset product cards to initial state
    productMap.clear();
    document.querySelector('.product-grid').innerHTML = '';
    productList.forEach(product => {
        // Reset product ID
        product.id = crypto.randomUUID();

        // Add product to Map
        productMap.set(product.id, product);

        // Render product
        renderProduct(product);
    });
}

// Global Event Listeners
document.querySelector('.confirm-order-btn').addEventListener('click', displayOrderConfirmation)
document.querySelector('.new-order-btn').addEventListener('click', startNewOrder);

// Initialize the app
getData();

