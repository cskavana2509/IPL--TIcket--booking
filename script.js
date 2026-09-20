// ===============================
// IPL Vault — Dynamic Booking Logic
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // Price + info lookup for each seating category
    const stands = {
        "balcony": {
            label: "Balcony",
            price: 1500,
            info: "Comfortable elevated seating with a clear, wide view of the ground. A solid pick for first-time visitors who want good sightlines at a fair price."
        },
        "box-balcony": {
            label: "Box Balcony",
            price: 2500,
            info: "Semi-private box seating a step up from the general balcony, with a bit more room and a closer view of the pitch."
        },
        "luxury-balcony": {
            label: "Luxury Balcony",
            price: 4000,
            info: "Premium cushioned seating with extra legroom and quicker access to food & beverage counters — built for fans who want comfort with the action."
        },
        "ground": {
            label: "Ground",
            price: 1000,
            info: "The most affordable, high-energy zone right near the boundary rope. Expect big crowds, loud chants and an up-close view of the fielders."
        },
        "first-class": {
            label: "1st Class",
            price: 6000,
            info: "The top hospitality tier — best-in-house viewing angles, dedicated service and premium in-seat food & beverage options."
        }
    };

    const matchSelect = document.getElementById("match");
    const ticketsInput = document.getElementById("ticketCount");
    const categorySelect = document.getElementById("category");
    const summaryBox = document.getElementById("bookingSummary");
    const standInfoBox = document.getElementById("standInfo");
    const bookingForm = document.getElementById("bookingForm");

    function formatINR(amount) {
        return "₹" + amount.toLocaleString("en-IN");
    }

    // Reliable way to read <input type="number">; falls back to Number()
    // for older browsers that don't support valueAsNumber.
    function getTicketQty() {
        const raw = ticketsInput.valueAsNumber;
        if (Number.isFinite(raw) && raw > 0) return Math.floor(raw);
        const fallback = Number(ticketsInput.value);
        return Number.isFinite(fallback) && fallback > 0 ? Math.floor(fallback) : 0;
    }

    function updateBookingSummary() {
        const matchText = matchSelect.value
            ? matchSelect.options[matchSelect.selectedIndex].text.trim()
            : "";

        const categoryKey = categorySelect.value;
        const stand = stands[categoryKey];
        const validQty = getTicketQty();

        if (!matchText && !stand && validQty === 0) {
            summaryBox.innerHTML = `
                <p class="summary-placeholder">
                    Select a match, stand and ticket quantity to see your live booking summary.
                </p>
            `;
            standInfoBox.innerHTML = "";
            return;
        }

        const pricePerTicket = stand ? stand.price : 0;
        const total = pricePerTicket * validQty;

        summaryBox.innerHTML = `
            <h4>Booking Summary</h4>
            <div class="summary-row">
                <span>Match</span>
                <span>${matchText || "Not selected"}</span>
            </div>
            <div class="summary-row">
                <span>Stand</span>
                <span>${stand ? stand.label : "Not selected"}</span>
            </div>
            <div class="summary-row">
                <span>Tickets</span>
                <span>${validQty}</span>
            </div>
            <div class="summary-row">
                <span>Price / Ticket</span>
                <span>${stand ? formatINR(pricePerTicket) : "—"}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total Amount</span>
                <span>${formatINR(total)}</span>
            </div>
        `;

        standInfoBox.innerHTML = stand
            ? `<h4>${stand.label} — What to Expect</h4><p>${stand.info}</p>`
            : "";
    }

    [matchSelect, categorySelect, ticketsInput].forEach((el) => {
        el.addEventListener("input", updateBookingSummary);
        el.addEventListener("change", updateBookingSummary);
    });

    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        updateBookingSummary();

        const categoryKey = categorySelect.value;
        const stand = stands[categoryKey];
        const qty = getTicketQty();

        if (!matchSelect.value || !stand || qty <= 0) {
            alert("Please select a match, a seating category and a valid number of tickets.");
            return;
        }

        const total = stand.price * qty;
        const matchText = matchSelect.options[matchSelect.selectedIndex].text.trim();

        alert(
            `Booking Confirmed!\n\n` +
            `Match: ${matchText}\n` +
            `Stand: ${stand.label}\n` +
            `Tickets: ${qty}\n` +
            `Total Amount: ${formatINR(total)}`
        );

        bookingForm.reset();
        updateBookingSummary();
    });

    updateBookingSummary();
});