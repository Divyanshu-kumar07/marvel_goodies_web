// ============================================================
// DIV-Mart - Marvel Shopping Cart & Checkout
// ============================================================

const TAX_RATE = 0.08;
const PROMO_CODE = "SAVE20";
const DISCOUNT_RATE = 0.20;

let products = [];
let cart = JSON.parse(localStorage.getItem("divMartCart")) || [];
let promoApplied = localStorage.getItem("divMartPromo") === "true";


// ============================================================
// LOAD PRODUCTS FROM products.json
// ============================================================

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("products.json could not be loaded");
        }

        products = await response.json();

        renderProductButtons();
        updateCartUI();

    } catch (error) {
        console.error(error);
        showToast("Products could not be loaded.");
    }
}


// ============================================================
// CART HELPER FUNCTIONS
// ============================================================

function saveCart() {
    localStorage.setItem("divMartCart", JSON.stringify(cart));
}


function getProduct(id) {
    return products.find(product => product.id === Number(id));
}


function getTotalItems() {
    return cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);
}


function getSubtotal() {
    return cart.reduce((total, item) => {

        const product = getProduct(item.id);

        if (!product) {
            return total;
        }

        return total + product.price * item.quantity;

    }, 0);
}


function formatPrice(amount) {

    return `Rs.${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

}


// ============================================================
// CONNECT ADD TO CART BUTTONS
// ============================================================

function renderProductButtons() {

    const cards = document.querySelectorAll(".product-card");

    cards.forEach((card, index) => {

        const product = products[index];

        if (!product) return;

        const button = card.querySelector("button");

        if (!button) return;

        button.onclick = function () {

            addToCart(product.id);

        };


        // Show stock

        let stock = card.querySelector(".stock-info");

        if (!stock) {

            stock = document.createElement("p");

            stock.className = "stock-info";

            card.appendChild(stock);

        }

        stock.textContent = `Stock: ${product.stock}`;

    });

}


// ============================================================
// ADD PRODUCT TO CART
// ============================================================

function addToCart(id) {

    const product = getProduct(id);

    if (!product) return;


    const existingItem = cart.find(item => item.id === product.id);


    // Product already exists

    if (existingItem) {

        if (existingItem.quantity >= product.stock) {

            showToast(
                `Only ${product.stock} ${product.name} available.`
            );

            return;
        }

        existingItem.quantity++;

    }

    // New product

    else {

        cart.push({

            id: product.id,

            quantity: 1

        });

    }


    saveCart();

    updateCartUI();

    showToast(`${product.name} added to cart.`);

}


// ============================================================
// CHANGE QUANTITY
// ============================================================

function changeQuantity(id, change) {

    const item = cart.find(
        item => item.id === Number(id)
    );

    const product = getProduct(id);


    if (!item || !product) return;


    const newQuantity =
        item.quantity + change;


    // Remove product

    if (newQuantity <= 0) {

        removeFromCart(id);

        return;
    }


    // Inventory limit

    if (newQuantity > product.stock) {

        showToast(
            `Only ${product.stock} ${product.name} available.`
        );

        return;
    }


    item.quantity = newQuantity;

    saveCart();

    updateCartUI();

}


// ============================================================
// REMOVE PRODUCT
// ============================================================

function removeFromCart(id) {

    cart = cart.filter(
        item => item.id !== Number(id)
    );

    saveCart();

    updateCartUI();

}


// ============================================================
// CREATE CART UI
// ============================================================

function createCartUI() {

    if (document.getElementById("cartButton")) {
        return;
    }


    const wrapper = document.createElement("div");


    wrapper.innerHTML = `

        <!-- CART BUTTON -->

        <button id="cartButton" class="cart-button">

            🛒

            <span id="cartCount">0</span>

        </button>


        <!-- CART BACKGROUND -->

        <div id="cartOverlay"
             class="cart-overlay">
        </div>


        <!-- CART DRAWER -->

        <aside id="cartDrawer"
               class="cart-drawer">


            <div class="cart-header">

                <div>

                    <small>
                        YOUR SELECTION
                    </small>

                    <h2>
                        Your bag
                        (<span id="bagCount">0</span>)
                    </h2>

                </div>


                <button id="closeCart"
                        class="cart-close">

                    ×

                </button>

            </div>


            <!-- CART PRODUCTS -->

            <div id="cartItems"
                 class="cart-items">

            </div>


            <!-- PROMO CODE -->

            <div class="promo-section">

                <label>
                    PROMO CODE
                </label>


                <div class="promo-row">

                    <input
                        id="promoInput"
                        type="text"
                        placeholder="Try SAVE20"
                    >


                    <button id="promoButton">

                        Apply

                    </button>

                </div>


                <p id="promoMessage"
                   class="promo-message">

                </p>

            </div>


            <!-- PRICE SUMMARY -->

            <div class="cart-summary">


                <div>

                    <span>
                        Subtotal
                    </span>

                    <strong id="subtotal">
                        Rs.0.00
                    </strong>

                </div>


                <div id="discountRow"
                     class="discount-row">

                    <span>
                        Discount (20%)
                    </span>

                    <strong id="discount">
                        -Rs.0.00
                    </strong>

                </div>


                <div>

                    <span>
                        Estimated Tax (8%)
                    </span>

                    <strong id="tax">
                        Rs.0.00
                    </strong>

                </div>


                <hr>


                <div class="grand-total">

                    <span>
                        Total
                    </span>

                    <strong id="grandTotal">
                        Rs.0.00
                    </strong>

                </div>

            </div>


            <!-- CHECKOUT BUTTON -->

            <button id="checkoutButton"
                    class="checkout-button">

                Continue to checkout →

            </button>


        </aside>


        <!-- CHECKOUT MODAL -->

        <div id="checkoutOverlay"
             class="checkout-overlay">


            <div class="checkout-modal">


                <button id="closeCheckout"
                        class="checkout-close">

                    ×

                </button>


                <div id="checkoutContent">

                </div>


            </div>

        </div>


        <!-- TOAST -->

        <div id="toast"
             class="div-toast">

        </div>

    `;


    document.body.appendChild(wrapper);


    // Button events

    document.getElementById("cartButton")
        .onclick = openCart;


    document.getElementById("closeCart")
        .onclick = closeCart;


    document.getElementById("cartOverlay")
        .onclick = closeCart;


    document.getElementById("promoButton")
        .onclick = applyPromo;


    document.getElementById("checkoutButton")
        .onclick = startCheckout;


    document.getElementById("closeCheckout")
        .onclick = closeCheckout;

}


// ============================================================
// UPDATE CART
// ============================================================

function updateCartUI() {

    createCartUI();


    const totalItems =
        getTotalItems();


    document.getElementById("cartCount")
        .textContent = totalItems;


    document.getElementById("bagCount")
        .textContent = totalItems;


    const cartItems =
        document.getElementById("cartItems");


    // EMPTY CART

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <div>
                    🛒
                </div>

                <h3>
                    Your bag is empty
                </h3>

                <p>
                    Add some Marvel action figures
                    to continue.
                </p>

            </div>

        `;

    }


    // CART HAS PRODUCTS

    else {

        cartItems.innerHTML = cart.map(item => {

            const product =
                getProduct(item.id);


            if (!product) return "";


            return `

                <div class="cart-item">


                    <img
                        src="${product.image}"
                        alt="${product.name}"
                    >


                    <div class="cart-item-details">


                        <h3>
                            ${product.name}
                        </h3>


                        <p>
                            ${formatPrice(product.price)}
                        </p>


                        <div class="quantity-row">


                            <button
                                onclick="changeQuantity(
                                    ${product.id},
                                    -1
                                )">

                                −

                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                onclick="changeQuantity(
                                    ${product.id},
                                    1
                                )">

                                +

                            </button>


                            <button
                                class="remove-item"
                                onclick="removeFromCart(
                                    ${product.id}
                                )">

                                ×

                            </button>


                        </div>

                    </div>

                </div>

            `;

        }).join("");

    }


    // ========================================================
    // CALCULATE PRICES
    // ========================================================

    const subtotal =
        getSubtotal();


    const discount =
        promoApplied
            ? subtotal * DISCOUNT_RATE
            : 0;


    const taxableAmount =
        subtotal - discount;


    const tax =
        taxableAmount * TAX_RATE;


    const total =
        taxableAmount + tax;


    document.getElementById("subtotal")
        .textContent =
        formatPrice(subtotal);


    document.getElementById("discount")
        .textContent =
        `-${formatPrice(discount)}`;


    document.getElementById("tax")
        .textContent =
        formatPrice(tax);


    document.getElementById("grandTotal")
        .textContent =
        formatPrice(total);


    // Show/hide discount

    document.getElementById("discountRow")
        .style.display =
        promoApplied
            ? "flex"
            : "none";


    // Disable checkout when empty

    document.getElementById("checkoutButton")
        .disabled =
        cart.length === 0;


    // Promo message

    const message =
        document.getElementById(
            "promoMessage"
        );


    if (promoApplied) {

        message.textContent =
            "✓ SAVE20 applied successfully.";

        message.className =
            "promo-message success";

    }

}


// ============================================================
// OPEN CART
// ============================================================

function openCart() {

    document.getElementById("cartDrawer")
        .classList.add("open");


    document.getElementById("cartOverlay")
        .classList.add("show");


    document.body.classList.add("no-scroll");

}


// ============================================================
// CLOSE CART
// ============================================================

function closeCart() {

    document.getElementById("cartDrawer")
        .classList.remove("open");


    document.getElementById("cartOverlay")
        .classList.remove("show");


    document.body.classList.remove("no-scroll");

}


// ============================================================
// APPLY PROMO CODE
// ============================================================

function applyPromo() {

    const input =
        document.getElementById(
            "promoInput"
        );


    const code =
        input.value
            .trim()
            .toUpperCase();


    const message =
        document.getElementById(
            "promoMessage"
        );


    if (code === PROMO_CODE) {

        promoApplied = true;


        localStorage.setItem(
            "divMartPromo",
            "true"
        );


        updateCartUI();


        showToast(
            "SAVE20 applied — 20% discount."
        );

    }

    else {

        promoApplied = false;


        localStorage.removeItem(
            "divMartPromo"
        );


        message.textContent =
            "✕ Invalid promo code.";


        message.className =
            "promo-message error";


        updateCartUI();

    }

}


// ============================================================
// CHECKOUT
// ============================================================

let checkoutStep = 1;


function startCheckout() {

    if (cart.length === 0) {
        return;
    }


    checkoutStep = 1;


    closeCart();


    renderCheckout();


    document.getElementById(
        "checkoutOverlay"
    ).classList.add("show");


    document.body.classList.add(
        "no-scroll"
    );

}


// ============================================================
// CLOSE CHECKOUT
// ============================================================

function closeCheckout() {

    document.getElementById(
        "checkoutOverlay"
    ).classList.remove("show");


    document.body.classList.remove(
        "no-scroll"
    );

}


// ============================================================
// FINAL TOTAL
// ============================================================

function getFinalTotal() {

    const subtotal =
        getSubtotal();


    const discount =
        promoApplied
            ? subtotal * DISCOUNT_RATE
            : 0;


    const tax =
        (subtotal - discount)
        * TAX_RATE;


    const total =
        subtotal - discount + tax;


    return formatPrice(total);

}


// ============================================================
// RENDER CHECKOUT
// ============================================================

function renderCheckout() {

    const content =
        document.getElementById(
            "checkoutContent"
        );


    // ========================================================
    // STEP 1
    // ========================================================

    if (checkoutStep === 1) {

        content.innerHTML = `

            <div class="checkout-progress">

                <span class="active">
                    1. Details
                </span>

                <span>
                    2. Payment
                </span>

                <span>
                    3. Confirmation
                </span>

            </div>


            <h2>
                Checkout
            </h2>


            <p class="checkout-subtitle">
                Enter your delivery details.
            </p>


            <form id="detailsForm"
                  novalidate>


                <label>

                    Full Name

                    <input
                        id="customerName"
                        required
                        placeholder="Your full name"
                    >

                    <small class="validation"></small>

                </label>


                <label>

                    Email

                    <input
                        id="customerEmail"
                        type="email"
                        required
                        placeholder="example@email.com"
                    >

                    <small class="validation"></small>

                </label>


                <label>

                    Phone

                    <input
                        id="customerPhone"
                        inputmode="numeric"
                        maxlength="10"
                        required
                        placeholder="10-digit phone number"
                    >

                    <small class="validation"></small>

                </label>


                <label>

                    Address

                    <textarea
                        id="customerAddress"
                        required
                        placeholder="House / Street / Area">
                    </textarea>

                    <small class="validation"></small>

                </label>


                <div class="two-fields">


                    <label>

                        City

                        <input
                            id="customerCity"
                            required
                            placeholder="City"
                        >

                        <small class="validation"></small>

                    </label>


                    <label>

                        PIN Code

                        <input
                            id="customerPin"
                            inputmode="numeric"
                            maxlength="6"
                            required
                            placeholder="6-digit PIN"
                        >

                        <small class="validation"></small>

                    </label>


                </div>


                <button
                    class="checkout-next"
                    type="submit">

                    Continue to Payment →

                </button>


            </form>

        `;


        attachDetailsValidation();

    }


    // ========================================================
    // STEP 2
    // ========================================================

    if (checkoutStep === 2) {

        content.innerHTML = `

            <div class="checkout-progress">

                <span class="done">
                    1. Details
                </span>

                <span class="active">
                    2. Payment
                </span>

                <span>
                    3. Confirmation
                </span>

            </div>


            <h2>
                Payment
            </h2>


            <p class="checkout-subtitle">

                Demo payment only —
                no real money will be charged.

            </p>


            <form id="paymentForm"
                  novalidate>


                <label>

                    Card Number

                    <input
                        id="cardNumber"
                        inputmode="numeric"
                        maxlength="19"
                        placeholder="4242 4242 4242 4242"
                        required
                    >

                    <small class="validation"></small>

                </label>


                <div class="two-fields">


                    <label>

                        Expiry

                        <input
                            id="cardExpiry"
                            maxlength="5"
                            placeholder="MM/YY"
                            required
                        >

                        <small class="validation"></small>

                    </label>


                    <label>

                        CVV

                        <input
                            id="cardCvv"
                            inputmode="numeric"
                            maxlength="3"
                            placeholder="123"
                            required
                        >

                        <small class="validation"></small>

                    </label>


                </div>


                <div class="checkout-total">

                    <span>
                        Total to pay
                    </span>

                    <strong>
                        ${getFinalTotal()}
                    </strong>

                </div>


                <div class="checkout-actions">


                    <button
                        type="button"
                        class="back-button"
                        onclick="
                            checkoutStep = 1;
                            renderCheckout();
                        ">

                        ← Back

                    </button>


                    <button
                        class="checkout-next"
                        type="submit">

                        Place Demo Order

                    </button>


                </div>


            </form>

        `;


        attachPaymentValidation();

    }


    // ========================================================
    // STEP 3
    // ========================================================

    if (checkoutStep === 3) {

        const orderId =
            "MAR-" +
            new Date().getFullYear() +
            "-" +
            Math.floor(
                10000 +
                Math.random() * 90000
            );


        content.innerHTML = `

            <div class="confirmation">


                <div class="success-icon">

                    ✓

                </div>


                <h2>
                    Order Confirmed!
                </h2>


                <p>
                    Thank you for shopping
                    at DIV-Mart.
                </p>


                <div class="order-box">


                    <p>

                        <span>
                            Order ID
                        </span>

                        <strong>
                            ${orderId}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Total
                        </span>

                        <strong>
                            ${getFinalTotal()}
                        </strong>

                    </p>


                    <p>

                        <span>
                            Status
                        </span>

                        <strong>
                            Demo Payment Successful
                        </strong>

                    </p>


                </div>


                <button
                    class="checkout-next"
                    onclick="finishOrder()">

                    Continue Shopping

                </button>


            </div>

        `;

    }

}


// ============================================================
// VALIDATION HELPER
// ============================================================

function setValidation(
    input,
    message,
    valid
) {

    const small =
        input.parentElement
            .querySelector(
                ".validation"
            );


    if (valid) {

        input.classList.add("valid");

        input.classList.remove(
            "invalid"
        );

        small.textContent =
            "✓ Valid";

        small.className =
            "validation valid-text";

    }

    else {

        input.classList.add(
            "invalid"
        );

        input.classList.remove(
            "valid"
        );

        small.textContent =
            message;

        small.className =
            "validation error-text";

    }


    return valid;

}


// ============================================================
// DETAILS VALIDATION
// ============================================================

function validateDetailsField(id) {

    const input =
        document.getElementById(id);


    const value =
        input.value.trim();


    if (id === "customerName") {

        return setValidation(
            input,
            "Enter your full name.",
            value.length >= 2
        );

    }


    if (id === "customerEmail") {

        const validEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(value);


        return setValidation(
            input,
            "Enter a valid email.",
            validEmail
        );

    }


    if (id === "customerPhone") {

        return setValidation(
            input,
            "Enter 10 digits.",
            /^\d{10}$/.test(value)
        );

    }


    if (id === "customerAddress") {

        return setValidation(
            input,
            "Enter your address.",
            value.length >= 5
        );

    }


    if (id === "customerCity") {

        return setValidation(
            input,
            "Enter your city.",
            value.length >= 2
        );

    }


    if (id === "customerPin") {

        return setValidation(
            input,
            "Enter a 6-digit PIN.",
            /^\d{6}$/.test(value)
        );

    }


    return true;

}


// ============================================================
// ATTACH DETAILS VALIDATION
// ============================================================

function attachDetailsValidation() {

    const fields = [

        "customerName",

        "customerEmail",

        "customerPhone",

        "customerAddress",

        "customerCity",

        "customerPin"

    ];


    fields.forEach(id => {

        document.getElementById(id)
            .addEventListener(
                "input",
                () => {

                    validateDetailsField(id);

                }
            );

    });


    document.getElementById(
        "detailsForm"
    ).addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            let valid = true;


            fields.forEach(id => {

                if (
                    !validateDetailsField(id)
                ) {

                    valid = false;

                }

            });


            if (valid) {

                checkoutStep = 2;

                renderCheckout();

            }

        }
    );

}


// ============================================================
// PAYMENT VALIDATION
// ============================================================

function attachPaymentValidation() {

    const card =
        document.getElementById(
            "cardNumber"
        );


    const expiry =
        document.getElementById(
            "cardExpiry"
        );


    const cvv =
        document.getElementById(
            "cardCvv"
        );


    card.addEventListener(
        "input",
        function() {

            card.value =
                card.value
                    .replace(/\D/g, "")
                    .slice(0, 16)
                    .replace(
                        /(.{4})/g,
                        "$1 "
                    )
                    .trim();


            validateCard();

        }
    );


    expiry.addEventListener(
        "input",
        function() {

            expiry.value =
                expiry.value
                    .replace(/\D/g, "")
                    .slice(0, 4);


            if (
                expiry.value.length > 2
            ) {

                expiry.value =
                    expiry.value.slice(0, 2)
                    + "/" +
                    expiry.value.slice(2);

            }


            validateExpiry();

        }
    );


    cvv.addEventListener(
        "input",
        function() {

            cvv.value =
                cvv.value
                    .replace(/\D/g, "")
                    .slice(0, 3);


            validateCvv();

        }
    );


    document.getElementById(
        "paymentForm"
    ).addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const validCard =
                validateCard();


            const validExpiry =
                validateExpiry();


            const validCvv =
                validateCvv();


            if (
                validCard &&
                validExpiry &&
                validCvv
            ) {

                checkoutStep = 3;

                renderCheckout();

            }

        }
    );

}


// ============================================================
// CARD VALIDATION
// ============================================================

function validateCard() {

    const input =
        document.getElementById(
            "cardNumber"
        );


    const digits =
        input.value.replace(
            /\D/g,
            ""
        );


    const valid =
        /^\d{16}$/.test(digits);


    return setValidation(
        input,
        "Enter a valid 16-digit card number.",
        valid
    );

}


// ============================================================
// EXPIRY VALIDATION
// ============================================================

function validateExpiry() {

    const input =
        document.getElementById(
            "cardExpiry"
        );


    const value =
        input.value.trim();


    if (
        !/^\d{2}\/\d{2}$/.test(value)
    ) {

        return setValidation(
            input,
            "Use MM/YY format.",
            false
        );

    }


    const [month, year] =
        value.split("/").map(Number);


    const valid =
        month >= 1 &&
        month <= 12 &&
        year >= 26;


    return setValidation(
        input,
        "Enter a valid expiry date.",
        valid
    );

}


// ============================================================
// CVV VALIDATION
// ============================================================

function validateCvv() {

    const input =
        document.getElementById(
            "cardCvv"
        );


    const valid =
        /^\d{3}$/.test(
            input.value
        );


    return setValidation(
        input,
        "Enter a 3-digit CVV.",
        valid
    );

}


// ============================================================
// FINISH ORDER
// ============================================================

function finishOrder() {

    cart = [];

    promoApplied = false;


    localStorage.removeItem(
        "divMartCart"
    );


    localStorage.removeItem(
        "divMartPromo"
    );


    closeCheckout();


    updateCartUI();


    showToast(
        "Thank you! Your order has been placed."
    );

}


// ============================================================
// TOAST MESSAGE
// ============================================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function() {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        createCartUI();

        loadProducts();

    }
);