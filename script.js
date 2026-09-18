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




function scrollToProducts() {

    document
        .getElementById(
            "figures"
        )
        .scrollIntoView({

            behavior: "smooth"

        });

}





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


function formatPrice(price) {

    return "₹" +
        price.toLocaleString(
            "en-IN"
        );

}

// =========================================================
// MARVEL + DC UNIVERSE SLIDER
// =========================================================

const universeTrack =
    document.querySelector(".universe-track");

const universeCards =
    document.querySelectorAll(".universe-card");

const universeDots =
    document.querySelectorAll(".universe-dot");

const previousUniverse =
    document.querySelector(".universe-prev");

const nextUniverse =
    document.querySelector(".universe-next");

let currentUniverse = 0;


// =========================================================
// SHOW SLIDE
// =========================================================

function showUniverse(index) {

    if (!universeTrack || !universeCards.length) {
        return;
    }

    // Keep index inside range

    if (index < 0) {
        index = universeCards.length - 1;
    }

    if (index >= universeCards.length) {
        index = 0;
    }

    currentUniverse = index;


    const card = universeCards[index];


    // Scroll selected card into view

    card.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    });


    // Active card

    universeCards.forEach((item, i) => {

        item.classList.toggle(
            "active",
            i === index
        );

    });


    // Active dots

    universeDots.forEach((dot, i) => {

        dot.classList.toggle(
            "active",
            i === index
        );

    });

}


// =========================================================
// NEXT
// =========================================================

if (nextUniverse) {

    nextUniverse.addEventListener(
        "click",
        () => {

            showUniverse(
                currentUniverse + 1
            );

        }
    );

}


// =========================================================
// PREVIOUS
// =========================================================

if (previousUniverse) {

    previousUniverse.addEventListener(
        "click",
        () => {

            showUniverse(
                currentUniverse - 1
            );

        }
    );

}


// =========================================================
// DOT CLICK
// =========================================================

universeDots.forEach((dot, index) => {

    dot.addEventListener(
        "click",
        () => {

            showUniverse(index);

        }
    );

});


// =========================================================
// CARD CLICK
// =========================================================

universeCards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            const universe =
                card.dataset.universe;

            if (!universe) {
                return;
            }


            // Find matching category button

            const categoryButtons =
                document.querySelectorAll(
                    ".category"
                );


            let matchingButton = null;


            categoryButtons.forEach(button => {

                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();

                if (
                    text ===
                    universe.toLowerCase()
                ) {

                    matchingButton = button;

                }

            });


            // Filter products

            if (matchingButton) {

                filterCategory(
                    universe,
                    matchingButton
                );

            }


            // Scroll to products

            const productsSection =
                document.getElementById(
                    "figures"
                );


            if (productsSection) {

                setTimeout(() => {

                    productsSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }, 150);

            }

        }
    );

});


// =========================================================
// TOUCH SWIPE
// =========================================================

let touchStartX = 0;
let touchEndX = 0;


if (universeTrack) {

    universeTrack.addEventListener(
        "touchstart",
        event => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        {
            passive: true
        }
    );


    universeTrack.addEventListener(
        "touchend",
        event => {

            touchEndX =
                event.changedTouches[0].screenX;


            const difference =
                touchStartX - touchEndX;


            // Minimum swipe distance

            if (Math.abs(difference) < 50) {
                return;
            }


            // Swipe left

            if (difference > 0) {

                showUniverse(
                    currentUniverse + 1
                );

            }


            // Swipe right

            else {

                showUniverse(
                    currentUniverse - 1
                );

            }

        },
        {
            passive: true
        }
    );

}


// =========================================================
// KEYBOARD SUPPORT
// =========================================================

document.addEventListener(
    "keydown",
    event => {

        // Only react when the slider exists

        if (!universeTrack) {
            return;
        }


        if (event.key === "ArrowRight") {

            showUniverse(
                currentUniverse + 1
            );

        }


        if (event.key === "ArrowLeft") {

            showUniverse(
                currentUniverse - 1
            );

        }

    }
);