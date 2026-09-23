document.addEventListener("DOMContentLoaded", () => {

    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const MOBILE_REGEX = /^[6-9]\d{9}$/; // 10-digit Indian mobile number
    const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;


    function showError(input, message) {
        input.classList.add("input-error");
        const errorEl = document.getElementById(input.id + "Error");
        if (errorEl) errorEl.textContent = message;
    }

    function clearError(input) {
        input.classList.remove("input-error");
        const errorEl = document.getElementById(input.id + "Error");
        if (errorEl) errorEl.textContent = "";
    }

    const validators = {
        username(value) {
            if (!value.trim()) return "Username is required.";
            if (!USERNAME_REGEX.test(value.trim())) {
                return "Username must be 3-20 characters (letters, numbers, underscore only).";
            }
            return "";
        },
        name(value) {
            if (!value.trim()) return "Name is required.";
            if (value.trim().length < 2) return "Please enter your full name.";
            return "";
        },
        mobile(value) {
            if (!value.trim()) return "Mobile number is required.";
            if (!MOBILE_REGEX.test(value.trim())) {
                return "Enter a valid 10-digit mobile number (starting 6-9).";
            }
            return "";
        },
        email(value) {
            if (!value.trim()) return "Email address is required.";
            if (!EMAIL_REGEX.test(value.trim())) {
                return "Enter a valid email address.";
            }
            return "";
        },
        match(value) {
            return value ? "" : "Please select a match.";
        },
        tickets(value) {
            const n = Number(value);
            if (!String(value).trim()) return "Enter the number of tickets.";
            if (!Number.isInteger(n) || n < 1 || n > 10) {
                return "Tickets must be a whole number from 1 to 10.";
            }
            return "";
        },
        category(value) {
            return value ? "" : "Please select a seating category.";
        },
        password(value) {
            if (!value) return "Password is required.";
            if (value.length < 6) return "Password must be at least 6 characters.";
            return "";
        }
    };

    function validateField(input) {
        const validator = validators[input.name];
        if (!validator) return true;

        const error = validator(input.value);
        if (error) {
            showError(input, error);
            return false;
        }
        clearError(input);
        return true;
    }

    // Shared with script.js (booking form)
    window.FormValidation = { validateField, clearError };

    function wireForm(form) {
        if (!form) return;

        const inputs = Array.from(form.querySelectorAll("input[name]"));

        inputs.forEach((input) => {
            input.addEventListener("input", () => validateField(input));
            input.addEventListener("blur", () => validateField(input));
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            let isFormValid = true;
            inputs.forEach((input) => {
                const fieldIsValid = validateField(input);
                if (!fieldIsValid) isFormValid = false;
            });

            if (!isFormValid) {
                const firstInvalid = form.querySelector(".input-error");
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            alert("Form validated successfully! (Demo only — no backend connected.)");
            form.reset();
            inputs.forEach(clearError);
        });
    }

    wireForm(document.getElementById("loginForm"));
    wireForm(document.getElementById("signupForm"));
});