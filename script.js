document.addEventListener("DOMContentLoaded", () => {

    

    const STANDS = {
        "balcony": {
            label: "Balcony", price: 1500,
            info: "Comfortable elevated seating with a clear, wide view of the ground. A solid pick for first-time visitors who want good sightlines at a fair price."
        },
        "box-balcony": {
            label: "Box Balcony", price: 2500,
            info: "Semi-private box seating a step up from the general balcony, with a bit more room and a closer view of the pitch."
        },
        "luxury-balcony": {
            label: "Luxury Balcony", price: 4000,
            info: "Premium cushioned seating with extra legroom and quicker access to food & beverage counters — built for fans who want comfort with the action."
        },
        "ground": {
            label: "Ground", price: 1000,
            info: "The most affordable, high-energy zone right near the boundary rope. Expect big crowds, loud chants and an up-close view of the fielders."
        },
        "first-class": {
            label: "1st Class", price: 6000,
            info: "The top hospitality tier — best-in-house viewing angles, dedicated service and premium in-seat food & beverage options."
        }
    };

    
    const MATCHES = [
        { id: "m1", teams: "MI vs RCB",   venue: "Wankhede Stadium, Mumbai",                date: "05 Apr 2027", time: "7:30 PM" },
        { id: "m2", teams: "CSK vs KKR",  venue: "M. A. Chidambaram Stadium, Chennai",      date: "08 Apr 2027", time: "7:30 PM" },
        { id: "m3", teams: "GT vs SRH",   venue: "Narendra Modi Stadium, Ahmedabad",        date: "11 Apr 2027", time: "3:30 PM" },
        { id: "m4", teams: "RCB vs KKR",  venue: "M. Chinnaswamy Stadium, Bengaluru",       date: "14 Apr 2027", time: "7:30 PM" },
        { id: "m5", teams: "DC vs PBKS",  venue: "Eden Gardens, Kolkata",                   date: "17 Apr 2027", time: "3:30 PM" }
    ];

    const BOOKINGS_KEY = "iplVaultBookings";
    const SESSION_KEY = "iplVaultCurrentBooking";

    const $ = (id) => document.getElementById(id);

    const matchSelect = $("match");
    const ticketsInput = $("ticketCount");
    const categorySelect = $("category");
    const formFields = [matchSelect, ticketsInput, categorySelect];

    const bookingForm = $("bookingForm");
    const summaryBox = $("bookingSummary");
    const standInfoBox = $("standInfo");
    const confirmationBox = $("bookingConfirmation");
    const scheduleBody = $("scheduleTableBody");
    const bookingsBody = $("bookingsTableBody");
    const filterMatch = $("filterMatch");
    const filterStand = $("filterStand");
    const bookingCount = $("bookingCount");

    const { validateField, clearError } = window.FormValidation;

    

    const formatINR = (amount) => "₹" + amount.toLocaleString("en-IN");
    const matchLabel = (m) => `${m.teams} — ${m.venue}`;
    const findMatch = (id) => MATCHES.find((m) => m.id === id);

    function getTicketQty() {
        const value = Number(ticketsInput.value);
        return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    }

    function readStorage(storage, key, fallback) {
        try {
            const saved = storage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (error) {
            console.error(`Storage error (${key}):`, error);
            return fallback;
        }
    }

    function writeStorage(storage, key, value) {
        storage.setItem(key, JSON.stringify(value));
    }

    
    function fillSelect(select, placeholder, options) {
        select.innerHTML = "";
        [{ value: "", label: placeholder }, ...options].forEach(({ value, label }) => {
            select.appendChild(new Option(label, value));
        });
    }

    
    function buildRow(cells) {
        const row = document.createElement("tr");
        cells.forEach((text) => {
            const td = document.createElement("td");
            td.textContent = text;
            row.appendChild(td);
        });
        return row;
    }

    function emptyRow(columns, message) {
        const row = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = columns;
        td.textContent = message;
        row.appendChild(td);
        return row;
    }

    function summaryRow(label, value, extraClass = "") {
        return `<div class="summary-row ${extraClass}"><span>${label}</span><span>${value}</span></div>`;
    }

    function renderSchedule() {
        scheduleBody.innerHTML = "";

        MATCHES.forEach((m) => {
            const row = buildRow([m.teams, m.venue, m.date, m.time]);
            const td = document.createElement("td");
            const button = document.createElement("button");

            button.type = "button";
            button.className = "table-book-btn";
            button.dataset.matchId = m.id;
            button.textContent = "Book";

            td.appendChild(button);
            row.appendChild(td);
            scheduleBody.appendChild(row);
        });
    }

    scheduleBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-match-id]");
        if (!button) return;

        matchSelect.value = button.dataset.matchId;
        onFormChange();
        $("tickets").scrollIntoView({ behavior: "smooth" });
        ticketsInput.focus({ preventScroll: true });
    });



    function saveSessionBooking() {
        writeStorage(sessionStorage, SESSION_KEY, {
            match: matchSelect.value,
            tickets: ticketsInput.value,
            category: categorySelect.value
        });
    }

    function loadSessionBooking() {
        const draft = readStorage(sessionStorage, SESSION_KEY, null);
        if (!draft) return;

        matchSelect.value = draft.match || "";
        ticketsInput.value = draft.tickets || "";
        categorySelect.value = draft.category || "";
    }

    

    function updateBookingSummary() {
        const match = findMatch(matchSelect.value);
        const stand = STANDS[categorySelect.value];
        const qty = getTicketQty();

        if (!match && !stand && qty === 0) {
            summaryBox.innerHTML = `
                <p class="summary-placeholder">
                    Select a match, stand and ticket quantity to see your live booking summary.
                </p>`;
            standInfoBox.innerHTML = "";
            return;
        }

        const price = stand ? stand.price : 0;

        summaryBox.innerHTML = `
            <h4>Booking Summary</h4>
            ${summaryRow("Match", match ? matchLabel(match) : "Not selected")}
            ${summaryRow("Stand", stand ? stand.label : "Not selected")}
            ${summaryRow("Tickets", qty)}
            ${summaryRow("Price / Ticket", stand ? formatINR(price) : "—")}
            ${summaryRow("Total Amount", formatINR(price * qty), "summary-total")}
        `;

        standInfoBox.innerHTML = stand
            ? `<h4>${stand.label} — What to Expect</h4><p>${stand.info}</p>`
            : "";
    }

    
    function onFormChange(event) {
        const field = event && event.target;
        if (field && field.classList.contains("input-error")) validateField(field);

        updateBookingSummary();
        saveSessionBooking();
    }


    const getBookings = () => readStorage(localStorage, BOOKINGS_KEY, []);

    function generateBookingId(existing) {
        let id;
        do {
            id = "IPL-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        } while (existing.some((b) => b.id === id));
        return id;
    }

    function saveBooking() {
        const bookings = getBookings();
        const match = findMatch(matchSelect.value);
        const stand = STANDS[categorySelect.value];
        const qty = getTicketQty();

        const booking = {
            id: generateBookingId(bookings),
            match: matchLabel(match),
            stand: stand.label,
            tickets: qty,
            price: stand.price,
            total: stand.price * qty,
            date: new Date().toLocaleString("en-IN")
        };

        bookings.push(booking);
        writeStorage(localStorage, BOOKINGS_KEY, bookings);
        return booking;
    }

    function displayBookings(highlightId = "") {
        const all = getBookings();
        const visible = all
            .filter((b) => !filterMatch.value || b.match === filterMatch.value)
            .filter((b) => !filterStand.value || b.stand === filterStand.value)
            .reverse(); 

        bookingsBody.innerHTML = "";

        if (visible.length === 0) {
            bookingsBody.appendChild(emptyRow(8, all.length === 0
                ? "No bookings yet. Book your first IPL ticket!"
                : "No bookings match the selected filters."));
        }

        visible.forEach((b) => {
            const row = buildRow([b.id, b.match, b.stand, b.tickets, formatINR(b.price), formatINR(b.total), b.date]);
            if (b.id === highlightId) row.classList.add("new-booking");

            const actionCell = document.createElement("td");
            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.className = "cancel-btn";
            cancelButton.dataset.cancelId = b.id;
            cancelButton.textContent = "Cancel";
            actionCell.appendChild(cancelButton);
            row.appendChild(actionCell);

            bookingsBody.appendChild(row);
        });

        bookingCount.textContent = all.length
            ? `Showing ${visible.length} of ${all.length} booking${all.length === 1 ? "" : "s"}`
            : "";
    }

    function showConfirmation(booking) {
        confirmationBox.innerHTML = `
            <h4>Booking confirmed</h4>
            <p>ID <strong>${booking.id}</strong> — ${booking.tickets} × ${booking.stand} for ${booking.match}.
               Total ${formatINR(booking.total)}.</p>
        `;
        confirmationBox.dataset.bookingId = booking.id;
        confirmationBox.hidden = false;
    }

    function cancelBooking(id) {
        const bookings = getBookings();
        const booking = bookings.find((b) => b.id === id);
        if (!booking) return;

        const ok = confirm(
            `Cancel booking ${booking.id}?\n\n${booking.tickets} × ${booking.stand} — ${booking.match}\nTotal: ${formatINR(booking.total)}`
        );
        if (!ok) return;

        writeStorage(localStorage, BOOKINGS_KEY, bookings.filter((b) => b.id !== id));

        if (confirmationBox.dataset.bookingId === id) confirmationBox.hidden = true;
        displayBookings();
    }

    

    function validateBookingForm() {
        const results = formFields.map((field) => validateField(field));
        const firstInvalid = formFields.find((_, i) => !results[i]);

        if (firstInvalid) firstInvalid.focus();
        return !firstInvalid;
    }



    formFields.forEach((field) => {
        field.addEventListener("input", onFormChange);
        field.addEventListener("change", onFormChange);
    });

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!validateBookingForm()) return;

        const booking = saveBooking();

        sessionStorage.removeItem(SESSION_KEY);
        bookingForm.reset();
        formFields.forEach(clearError);
        updateBookingSummary();

        showConfirmation(booking);
        displayBookings(booking.id);
    });

    [filterMatch, filterStand].forEach((select) => {
        select.addEventListener("change", () => displayBookings());
    });

    bookingsBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-cancel-id]");
        if (button) cancelBooking(button.dataset.cancelId);
    });

    $("clearFilters").addEventListener("click", () => {
        filterMatch.value = "";
        filterStand.value = "";
        displayBookings();
    });


    const matchOptions = MATCHES.map((m) => ({ value: m.id, label: matchLabel(m) }));
    const standOptions = Object.values(STANDS).map((s) => ({ value: s.label, label: s.label }));

    fillSelect(matchSelect, "-- Select Match --", matchOptions);
    fillSelect(categorySelect, "-- Select Category --",
        Object.entries(STANDS).map(([key, s]) => ({ value: key, label: `${s.label} — ${formatINR(s.price)}` })));

    
    fillSelect(filterMatch, "All matches", matchOptions.map((o) => ({ value: o.label, label: o.label })));
    fillSelect(filterStand, "All stands", standOptions);

    renderSchedule();
    loadSessionBooking();
    updateBookingSummary();
    displayBookings();
});