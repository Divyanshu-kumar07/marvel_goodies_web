// ==========================================
// VARIABLES
// ==========================================

let products = [];

let cart = [];

let discountApplied = false;


// ==========================================
// LOAD PRODUCTS FROM JSON
// ==========================================

fetch("products.json")

    .then(response => {

        if (!response.ok) {

            throw new Error(
                "Could not load products.json"
            );

        }

        return response.json();

    })

    .then(data => {

        products = data;

        displayProducts(products);

        updateCart();

    })

    .catch(error => {

        console.error(error);


        document.getElementById(
            "productGrid"
        ).innerHTML = `

            <div class="error-message">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load figures
                </h3>

                <p>
                    Make sure products.json is in
                    the same folder and use Live Server.
                </p>

            </div>

        `;

    });



// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(list) {

    const grid =
        document.getElementById(
            "productGrid"
        );


    grid.innerHTML = "";


    if (list.length === 0) {

        grid.innerHTML = `

            <div class="error-message">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>
                    No figures found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    list.forEach(product => {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        card.innerHTML = `

            <div class="product-image">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >


                <span class="product-tag">

                    ${product.category}

                </span>

            </div>


            <div class="product-info">

                <span class="product-category">

                    COLLECTIBLE

                </span>


                <h3>

                    ${product.name}

                </h3>


                <p>

                    ${product.description}

                </p>


                <div class="product-bottom">


                    <strong class="price">

                        ${formatPrice(
                            product.price
                        )}

                    </strong>


                    <button
                        class="add-btn"
                        onclick="addToCart(
                            ${product.id}
                        )"
                    >

                        <i class="fa-solid fa-plus"></i>

                        Add

                    </button>

                </div>

            </div>

        `;


        grid.appendChild(card);

    });

}



// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id) {

    const product =
        products.find(
            item => item.id === id
        );


    if (!product) {

        return;

    }


    const existing =
        cart.find(
            item => item.id === id
        );


    if (existing) {

        existing.quantity++;

    }

    else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    updateCart();

    openCart();

}



// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    displayCart();

    updateCartCount();

    updatePrices();

}



// ==========================================
// CART COUNT
// ==========================================

function updateCartCount() {

    const count =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    document.getElementById(
        "cartCount"
    ).textContent = count;

}



// ==========================================
// DISPLAY CART
// ==========================================

function displayCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <i class="fa-solid fa-box-open"></i>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Your next collectible is waiting.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    cart.forEach(item => {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "cart-item";


        row.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >


            <div class="cart-item-info">


                <span>
                    ${item.category}
                </span>


                <h4>
                    ${item.name}
                </h4>


                <strong>
                    ${formatPrice(
                        item.price
                    )}
                </strong>


                <div class="quantity">


                    <button
                        onclick="changeQuantity(
                            ${item.id},
                            -1
                        )"
                    >

                        −

                    </button>


                    <span>

                        ${item.quantity}

                    </span>


                    <button
                        onclick="changeQuantity(
                            ${item.id},
                            1
                        )"
                    >

                        +

                    </button>


                </div>


                <button
                    class="remove"
                    onclick="removeFromCart(
                        ${item.id}
                    )"
                >

                    Remove

                </button>


            </div>

        `;


        container.appendChild(row);

    });

}



// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQuantity(
    id,
    change
) {

    const item =
        cart.find(
            item => item.id === id
        );


    if (!item) {

        return;

    }


    item.quantity += change;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item => item.id !== id
            );

    }


    updateCart();

}



// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(id) {

    cart =
        cart.filter(
            item => item.id !== id
        );


    updateCart();

}



// ==========================================
// PRICE CALCULATION
// ==========================================

function updatePrices() {

    const subtotal =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    const discount =
        discountApplied
            ? subtotal * 0.10
            : 0;


    const total =
        subtotal - discount;


    document.getElementById(
        "subtotal"
    ).textContent =
        formatPrice(subtotal);


    document.getElementById(
        "discount"
    ).textContent =
        formatPrice(discount);


    document.getElementById(
        "total"
    ).textContent =
        formatPrice(total);

}



// ==========================================
// COUPON
// ==========================================

function applyCoupon() {

    const input =
        document.getElementById(
            "couponInput"
        );


    const message =
        document.getElementById(
            "couponMessage"
        );


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (code === "COLLECT10") {

        discountApplied = true;


        message.textContent =
            "✓ COLLECT10 applied — 10% OFF";


        message.className =
            "success";

    }

    else {

        discountApplied = false;


        message.textContent =
            "Invalid coupon. Try COLLECT10";


        message.className =
            "error";

    }


    updatePrices();

}



// ==========================================
// CATEGORY FILTER
// ==========================================

function filterCategory(
    category,
    button
) {

    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    button.classList.add(
        "active"
    );


    if (category === "All") {

        displayProducts(
            products
        );

        return;

    }


    const filtered =
        products.filter(
            product =>
                product.category ===
                category
        );


    displayProducts(
        filtered
    );

}



// ==========================================
// SEARCH
// ==========================================

function searchProducts() {

    const value =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase()
            .trim();


    const filtered =
        products.filter(
            product =>

                product.name
                    .toLowerCase()
                    .includes(value)

                ||

                product.category
                    .toLowerCase()
                    .includes(value)

                ||

                product.description
                    .toLowerCase()
                    .includes(value)

        );


    displayProducts(
        filtered
    );

}



// ==========================================
// OPEN CART
// ==========================================

function openCart() {

    document
        .getElementById(
            "cartSidebar"
        )
        .classList.add(
            "open"
        );


    document
        .getElementById(
            "cartOverlay"
        )
        .classList.add(
            "show"
        );


    document.body.style.overflow =
        "hidden";

}



// ==========================================
// CLOSE CART
// ==========================================

function closeCart() {

    document
        .getElementById(
            "cartSidebar"
        )
        .classList.remove(
            "open"
        );


    document
        .getElementById(
            "cartOverlay"
        )
        .classList.remove(
            "show"
        );


    document.body.style.overflow =
        "auto";

}



// ==========================================
// SCROLL
// ==========================================

function scrollToProducts() {

    document
        .getElementById(
            "figures"
        )
        .scrollIntoView({

            behavior: "smooth"

        });

}



// ==========================================
// SEARCH BUTTON
// ==========================================

function focusSearch() {

    scrollToProducts();


    setTimeout(
        () => {

            document
                .getElementById(
                    "searchInput"
                )
                .focus();

        },
        500
    );

}



// ==========================================
// CHECKOUT
// ==========================================

function checkout() {

    if (cart.length === 0) {

        alert(
            "Your collection cart is empty!"
        );

        return;

    }


    const total =
        document.getElementById(
            "total"
        ).textContent;


    alert(

        "ORDER CONFIRMED!\n\n" +

        "Your collectible order total is " +

        total +

        ".\n\n" +

        "Thank you for shopping at FIGUREVERSE!"

    );


    cart = [];


    discountApplied = false;


    document.getElementById(
        "couponInput"
    ).value = "";


    document.getElementById(
        "couponMessage"
    ).textContent = "";


    updateCart();

}



// ==========================================
// FORMAT PRICE
// ==========================================

function formatPrice(price) {

    return "₹" +
        price.toLocaleString(
            "en-IN"
        );

}