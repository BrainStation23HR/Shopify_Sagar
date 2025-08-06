console.log('Dynamic Delivery Scheduler App Block Loaded');

const hostUrl = "https://told-apnic-composite-southeast.trycloudflare.com";

let appBlockContainer = document.getElementById('dynamic-delivery-scheduler-app-block');
let selectedSlot = null;
let availableSlotsData = null; // Store slots data for re-rendering

function createSlotSelectionUI(availableSlots, cartItemCount, container) {
    // Store the slots data for later use
    availableSlotsData = availableSlots;

    // Clear existing content
    container.innerHTML = '';

    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.style.cssText = `
        font-family: Arial, sans-serif;
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
    `;

    // Title
    const title = document.createElement('h3');
    title.textContent = 'Select Your Delivery Slot';
    title.style.cssText = `
        margin-bottom: 15px;
        color: #333;
        text-align: center;
    `;
    mainContainer.appendChild(title);

    // Cart info
    const cartInfo = document.createElement('div');
    cartInfo.style.cssText = `
        background-color: #e8f4f8;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 20px;
        text-align: center;
        font-size: 14px;
        color: #666;
    `;
    cartInfo.textContent = `Cart Items: ${cartItemCount}`;
    cartInfo.id = 'cart-info-display'; // Add ID for easy updating
    mainContainer.appendChild(cartInfo);

    // Slots container
    const slotsContainer = document.createElement('div');
    slotsContainer.style.cssText = `
        display: grid;
        gap: 15px;
    `;

    // Process each date
    availableSlots.forEach((dateSlot, dateIndex) => {
        const dateContainer = document.createElement('div');
        dateContainer.style.cssText = `
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            background-color: white;
        `;

        // Date header
        const dateHeader = document.createElement('h4');
        dateHeader.textContent = formatDate(dateSlot.date);
        dateHeader.style.cssText = `
            margin: 0 0 10px 0;
            color: #444;
            font-size: 16px;
        `;
        dateContainer.appendChild(dateHeader);

        // Slots for this date
        const dateSlots = document.createElement('div');
        dateSlots.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        `;

        dateSlot.slots.forEach((slot, slotIndex) => {
            const slotButton = createSlotButton(slot, dateSlot.date, dateIndex, slotIndex, cartItemCount);
            dateSlots.appendChild(slotButton);
        });

        dateContainer.appendChild(dateSlots);
        slotsContainer.appendChild(dateContainer);
    });

    mainContainer.appendChild(slotsContainer);

    // Selected slot display
    const selectedSlotDisplay = document.createElement('div');
    selectedSlotDisplay.id = 'selected-slot-display';
    selectedSlotDisplay.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background-color: #e8f5e8;
        border-radius: 5px;
        text-align: center;
        display: none;
    `;
    mainContainer.appendChild(selectedSlotDisplay);

    container.appendChild(mainContainer);
}

function createSlotButton(slot, date, dateIndex, slotIndex, cartItemCount) {
    const button = document.createElement('button');
    const slotId = `${date}-${slotIndex}`;

    // Check if slot has enough capacity
    const hasCapacity = slot.capacity >= cartItemCount;
    const timeDisplay = slot.startTime === slot.endTime ?
        slot.startTime :
        `${slot.startTime} - ${slot.endTime}`;

    button.textContent = `${timeDisplay} (${slot.capacity} available)`;
    button.dataset.slotId = slotId;
    button.dataset.date = date;
    button.dataset.startTime = slot.startTime;
    button.dataset.endTime = slot.endTime;
    button.dataset.capacity = slot.capacity;

    // Base styles
    let buttonStyles = `
        padding: 10px 15px;
        border: 2px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        min-width: 150px;
        text-align: center;
    `;

    if (!hasCapacity) {
        // Disabled style
        buttonStyles += `
            background-color: #f5f5f5;
            color: #999;
            cursor: not-allowed;
            opacity: 0.6;
        `;
        button.disabled = true;
    } else {
        // Available style
        buttonStyles += `
            background-color: white;
            color: #333;
        `;
        button.disabled = false;

        // Add hover effect
        button.addEventListener('mouseenter', () => {
            if (!button.disabled && !button.classList.contains('selected')) {
                button.style.backgroundColor = '#f0f8ff';
                button.style.borderColor = '#007bff';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!button.disabled && !button.classList.contains('selected')) {
                button.style.backgroundColor = 'white';
                button.style.borderColor = '#ddd';
            }
        });
    }

    button.style.cssText = buttonStyles;

    // Add click handler for available slots
    if (hasCapacity) {
        button.addEventListener('click', () => handleSlotSelection(button, slotId));
    }

    return button;
}

function handleSlotSelection(clickedButton, slotId) {
    // Remove selection from all buttons
    document.querySelectorAll('[data-slot-id]').forEach(btn => {
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#ddd';
            btn.style.color = '#333';
        }
        // Re-enable all buttons that have capacity
        if (!btn.disabled) {
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });

    // Select clicked button
    clickedButton.classList.add('selected');
    clickedButton.style.backgroundColor = '#007bff';
    clickedButton.style.borderColor = '#007bff';
    clickedButton.style.color = 'white';

    // Disable other buttons (keep only selected one enabled)
    document.querySelectorAll('[data-slot-id]').forEach(btn => {
        if (btn.dataset.slotId !== slotId && !btn.disabled) {
            btn.style.opacity = '0.5';
            btn.addEventListener('click', handleSlotDeselection);
        }
    });

    // Update selected slot
    selectedSlot = {
        id: slotId,
        date: clickedButton.dataset.date,
        startTime: clickedButton.dataset.startTime,
        endTime: clickedButton.dataset.endTime,
        capacity: parseInt(clickedButton.dataset.capacity)
    };

    // Update display
    updateSelectedSlotDisplay();
}

function handleSlotDeselection() {
    // Clear selection
    selectedSlot = null;

    // Reset all buttons
    document.querySelectorAll('[data-slot-id]').forEach(btn => {
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#ddd';
            btn.style.color = '#333';
        }

        // Re-enable buttons with capacity
        if (!btn.disabled) {
            btn.style.opacity = '1';
            btn.removeEventListener('click', handleSlotDeselection);
        }
    });

    // Hide selected slot display
    document.getElementById('selected-slot-display').style.display = 'none';
}

function updateSelectedSlotDisplay() {
    const display = document.getElementById('selected-slot-display');

    if (selectedSlot) {
        const timeDisplay = selectedSlot.startTime === selectedSlot.endTime ?
            selectedSlot.startTime :
            `${selectedSlot.startTime} - ${selectedSlot.endTime}`;

        display.innerHTML = `
            <strong>Selected Slot:</strong><br>
            Date: ${formatDate(selectedSlot.date)}<br>
            Time: ${timeDisplay}<br>
            Available Capacity: ${selectedSlot.capacity}
            <br><br>
            <button onclick="handleSlotDeselection()" style="
                padding: 8px 16px;
                background-color: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Change Selection</button>
        `;
        display.style.display = 'block';
    } else {
        display.style.display = 'none';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

const getCartItems = async () => {
    try {
        // Add cache busting parameters
        const timestamp = new Date().getTime();
        const response = await fetch(`/cart.json?t=${timestamp}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data?.item_count || 0;
    } catch (error) {
        console.error("Fetch error:", error);
        return 0;
    }
};

// Store the last known cart count to compare
let lastKnownCartCount = 0;

// Function to update the UI when cart changes
async function updateUIAfterCartChange(retryCount = 0) {
    if (!availableSlotsData || !appBlockContainer) {
        return;
    }

    try {
        const newCartItemCount = await getCartItems();
        console.log('Cart check - Current count:', newCartItemCount, 'Last known:', lastKnownCartCount);

        // If cart count hasn't changed and we haven't tried multiple times, wait and retry
        if (newCartItemCount === lastKnownCartCount && retryCount < 3) {
            console.log('Cart count unchanged, retrying in 300ms...');
            setTimeout(() => updateUIAfterCartChange(retryCount + 1), 300);
            return;
        }

        // Only update if the cart count actually changed or after max retries
        if (newCartItemCount !== lastKnownCartCount || retryCount >= 3) {
            console.log('Cart updated, new count:', newCartItemCount);
            lastKnownCartCount = newCartItemCount;

            // Store the currently selected slot ID to restore it if possible
            const previouslySelectedSlotId = selectedSlot?.id;

            // Re-create the UI with new cart count
            createSlotSelectionUI(availableSlotsData, newCartItemCount, appBlockContainer);

            // Try to restore the previously selected slot if it's still valid
            if (previouslySelectedSlotId) {
                const previousButton = document.querySelector(`[data-slot-id="${previouslySelectedSlotId}"]`);
                if (previousButton && !previousButton.disabled) {
                    // Restore the selection
                    handleSlotSelection(previousButton, previouslySelectedSlotId);
                } else {
                    // Clear selection if the previously selected slot is no longer available
                    selectedSlot = null;
                }
            }
        }
    } catch (error) {
        console.error('Error updating UI after cart change:', error);
    }
}

// Debounce function to prevent too many rapid updates
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Create debounced version of the update function
const debouncedUpdateUI = debounce(updateUIAfterCartChange, 800);

// Function to set up quantity input listeners
function setupQuantityInputListeners() {
    // Listen for changes on quantity inputs
    document.addEventListener('change', function (event) {
        // Check if the changed element is a quantity input
        if (event.target.classList.contains('quantity__input') ||
            event.target.type === 'number' ||
            event.target.name === 'quantity' ||
            event.target.closest('.quantity')) {

            console.log('Quantity input changed:', event.target.value);
            debouncedUpdateUI();
        }
    });

    // Also listen for input events (real-time typing)
    document.addEventListener('input', function (event) {
        if (event.target.classList.contains('quantity__input') ||
            event.target.type === 'number' ||
            event.target.name === 'quantity' ||
            event.target.closest('.quantity')) {

            console.log('Quantity input changed (input event):', event.target.value);
            debouncedUpdateUI();
        }
    });

    // Listen for clicks on quantity buttons (+ and - buttons)
    document.addEventListener('click', function (event) {
        // Check if clicked element is a quantity button
        if (event.target.classList.contains('quantity__button') ||
            event.target.closest('.quantity__button') ||
            event.target.closest('[data-quantity-button]') ||
            (event.target.textContent === '+' || event.target.textContent === '-')) {

            console.log('Quantity button clicked');
            // Use a slight delay to allow the cart to update
            setTimeout(debouncedUpdateUI, 200);
        }

        // Check if clicked element is a cart remove button
        if (event.target.tagName === 'CART-REMOVE-BUTTON' ||
            event.target.closest('cart-remove-button') ||
            event.target.classList.contains('cart-remove-button') ||
            event.target.closest('.cart-remove-button') ||
            event.target.closest('[data-remove]') ||
            event.target.closest('[data-cart-remove]')) {

            console.log('Cart remove button clicked');
            // Use a longer delay for remove actions as they might take more time
            setTimeout(debouncedUpdateUI, 500);
        }
    });
}

// Initialize the app
async function initializeApp() {
    try {
        const response = await fetch(`${hostUrl}/api/storefront/slots?shop=${Shopify.shop}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log(data?.available);

        if (data && data.available.length > 0) {
            const cartItemCount = await getCartItems();
            lastKnownCartCount = cartItemCount; // Initialize the last known count
            const availableSlots = data.available;

            createSlotSelectionUI(availableSlots, cartItemCount, appBlockContainer);

            // Set up listeners after UI is created
            setupQuantityInputListeners();
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

// Start the app
initializeApp();


// const updateCart = async (zones) => {
//     await fetch('/cart/update.js', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             attributes: {
//                 zones: zones
//             }
//         })
//     })
// }



// fetch(`${hostUrl}/api/storefront/zones?shop=${Shopify.shop}`)
//     .then(response => {
//         if (!response.ok) {
//             throw new Error("Network response was not ok");
//         }
//         return response.json();
//     })
//     .then(async data => {
//         if (data && data.zones) {
//             console.log("Zones Address:", data.zones);
//             await updateCart(data.zones);
//         } else {
//             console.warn("Zones data missing or address not found:", data);
//         }

//         // ✅ Log the actual zones
//     })
//     .catch(error => {
//         console.error("Fetch error:", error);
//     });

