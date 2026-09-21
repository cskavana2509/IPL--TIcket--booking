document.addEventListener("DOMContentLoaded", () => {

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

    const BOOKINGS_KEY = "iplVaultBookings";
    const SESSION_KEY = "iplVaultCurrentBooking";

    const matchSelect = document.getElementById("match");
    const ticketsInput = document.getElementById("ticketCount");
    const categorySelect = document.getElementById("category");
    const summaryBox = document.getElementById("bookingSummary");
    const standInfoBox = document.getElementById("standInfo");
    const bookingForm = document.getElementById("bookingForm");
    const bookingsTableBody = document.getElementById("bookingsTableBody");


    function formatINR(amount) {
        return "₹" + amount.toLocaleString("en-IN");
    }


    function getTicketQty() {
        const value = Number(ticketsInput.value);

        return Number.isFinite(value) && value > 0
            ? Math.floor(value)
            : 0;
    }


    function saveSessionBooking() {

        const booking = {
            match: matchSelect.value,
            tickets: ticketsInput.value,
            category: categorySelect.value
        };

        sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify(booking)
        );

        console.log("Session booking saved:", booking);
    }



    function loadSessionBooking() {

        const saved = sessionStorage.getItem(SESSION_KEY);

        if (!saved) {
            return;
        }

        try {

            const booking = JSON.parse(saved);

            matchSelect.value = booking.match || "";
            ticketsInput.value = booking.tickets || "";
            categorySelect.value = booking.category || "";

            console.log("Session booking restored:", booking);

        } catch (error) {

            console.error("Session storage error:", error);

            sessionStorage.removeItem(SESSION_KEY);
        }
    }


    function updateBookingSummary() {

        const matchText = matchSelect.value
            ? matchSelect.options[matchSelect.selectedIndex].text.trim()
            : "";

        const categoryKey = categorySelect.value;
        const stand = stands[categoryKey];
        const qty = getTicketQty();

        if (!matchText && !stand && qty === 0) {

            summaryBox.innerHTML = `
                <p class="summary-placeholder">
                    Select a match, stand and ticket quantity to see your live booking summary.
                </p>
            `;

            standInfoBox.innerHTML = "";

            return;
        }

        const price = stand ? stand.price : 0;
        const total = price * qty;

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
                <span>${qty}</span>
            </div>

            <div class="summary-row">
                <span>Price / Ticket</span>
                <span>${stand ? formatINR(price) : "—"}</span>
            </div>

            <div class="summary-row summary-total">
                <span>Total Amount</span>
                <span>${formatINR(total)}</span>
            </div>
        `;

        standInfoBox.innerHTML = stand
            ? `
                <h4>${stand.label} — What to Expect</h4>
                <p>${stand.info}</p>
            `
            : "";
    }


    function getBookings() {

        const saved = localStorage.getItem(BOOKINGS_KEY);

        if (!saved) {
            return [];
        }

        try {
            return JSON.parse(saved);
        } catch (error) {

            console.error("Local storage error:", error);

            return [];
        }
    }

    function displayBookings() {

        const bookings = getBookings();

        bookingsTableBody.innerHTML = "";

        if (bookings.length === 0) {

            bookingsTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No bookings yet. Book your first IPL ticket!
                    </td>
                </tr>
            `;

            return;
        }

        bookings.forEach((booking) => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${booking.id}</td>
                <td>${booking.match}</td>
                <td>${booking.stand}</td>
                <td>${booking.tickets}</td>
                <td>${formatINR(booking.price)}</td>
                <td>${formatINR(booking.total)}</td>
                <td>${booking.date}</td>
            `;

            bookingsTableBody.appendChild(row);
        });

        console.log("Bookings loaded from localStorage:", bookings);
    }


    function saveBooking() {

        const bookings = getBookings();

        const stand = stands[categorySelect.value];

        const qty = getTicketQty();

        const matchText =
            matchSelect.options[matchSelect.selectedIndex].text.trim();

        const booking = {

            id: "IPL-" + Date.now(),

            match: matchText,

            stand: stand.label,

            tickets: qty,

            price: stand.price,

            total: stand.price * qty,

            date: new Date().toLocaleString("en-IN")
        };

        bookings.push(booking);

        localStorage.setItem(
            BOOKINGS_KEY,
            JSON.stringify(bookings)
        );

        console.log("Booking saved to localStorage:", booking);

        displayBookings();

        return booking;
    }



    [matchSelect, categorySelect, ticketsInput].forEach((element) => {

        element.addEventListener("input", () => {

            updateBookingSummary();
            saveSessionBooking();

        });

        element.addEventListener("change", () => {

            updateBookingSummary();
            saveSessionBooking();

        });

    });


    
    bookingForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const stand = stands[categorySelect.value];
        const qty = getTicketQty();

        if (!matchSelect.value || !stand || qty <= 0) {

            alert(
                "Please select a match, a seating category and a valid number of tickets."
            );

            return;
        }

        const booking = saveBooking();

        alert(
            `Booking Confirmed!\n\n` +
            `Booking ID: ${booking.id}\n` +
            `Match: ${booking.match}\n` +
            `Stand: ${booking.stand}\n` +
            `Tickets: ${booking.tickets}\n` +
            `Total Amount: ${formatINR(booking.total)}`
        );

        
        sessionStorage.removeItem(SESSION_KEY);

        
        bookingForm.reset();

        updateBookingSummary();
    });


    loadSessionBooking();

    updateBookingSummary();

    displayBookings();

});