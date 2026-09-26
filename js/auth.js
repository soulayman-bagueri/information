const USER = {
    username: "admin",
    password: "youssefsoulayman"
};


const SESSION_KEY =
    "information_authenticated";


const form =
    document.getElementById(
        "loginForm"
    );

const usernameInput =
    document.getElementById(
        "username"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const message =
    document.getElementById(
        "loginMessage"
    );

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


if (
    sessionStorage.getItem(
        SESSION_KEY
    ) === "true"
) {

    window.location.replace(
        "dashboard.html"
    );

}


togglePassword.addEventListener(
    "click",
    () => {

        const hidden =
            passwordInput.type === "password";

        passwordInput.type =
            hidden
                ? "text"
                : "password";

        togglePassword.innerHTML =
            hidden
                ? `
                    <svg viewBox="0 0 24 24">
                        <path d="M3 3l18 18"/>
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
                        <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.1 3.9"/>
                        <path d="M6.1 6.1C3.6 7.7 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 3.2-.5"/>
                    </svg>
                `
                : `
                    <svg viewBox="0 0 24 24">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/>
                        <circle cx="12" cy="12" r="2.5"/>
                    </svg>
                `;

    }
);


form.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        message.textContent = "";

        if (
            username === USER.username &&
            password === USER.password
        ) {

            sessionStorage.setItem(
                SESSION_KEY,
                "true"
            );

            localStorage.setItem(
                "information_last_login",
                new Date().toISOString()
            );

            window.location.replace(
                "dashboard.html"
            );

            return;

        }

        message.textContent =
            "اسم المستخدم أو كلمة المرور غير صحيحة.";

        passwordInput.select();

    }
);