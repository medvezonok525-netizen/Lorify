// Инициализируем локальную базу данных и тестовый аккаунт Drop4ik
if (!localStorage.getItem("lorify_user_Drop4ik")) {
    const testAcc = {
        email: "drop@lorify.music", name: "Разработчик", username: "Drop4ik", birthday: "01.01.2000", pass: "123"
    };
    localStorage.setItem("lorify_user_Drop4ik", JSON.stringify(testAcc));
}

// ТВОИ ЛИЧНЫЕ РАБОЧИЕ КЛЮЧИ EMAILJS
const EMAILJS_SERVICE_ID = "service_j9uyo3g";  
const EMAILJS_TEMPLATE_ID = "template_zcw57ql"; 
const EMAILJS_PUBLIC_KEY = "aEOYJY9gCW0UtmEsW";   

let generatedCode = ""; 
let tempRegistrationData = null; 

function initDateSelectors() {
    const daySelect = document.getElementById("reg-day");
    const monthSelect = document.getElementById("reg-month");
    const yearSelect = document.getElementById("reg-year");
    
    if (!daySelect || !monthSelect || !yearSelect) return;

    for(let i = 1; i <= 31; i++) daySelect.options.add(new Option(i, i.toString().padStart(2, '0')));
    const months = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
    months.forEach((m, idx) => monthSelect.options.add(new Option(m, (idx + 1).toString().padStart(2, '0'))));
    const currentYear = new Date().getFullYear();
    for(let i = currentYear; i >= 1930; i--) yearSelect.options.add(new Option(i, i.toString()));
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(screenId).style.display = 'flex';
}

// НАПРЯМУЮ ЧЕРЕЗ ЧИСТЫЙ И НЕЗАВИСИМЫЙ API-FETCH ЗАПРОС К СЕРВЕРУ
async function sendRealEmail(targetEmail, code) {
    document.getElementById("verify-info-text").innerText = `Отправляем секретный код на почту ${targetEmail}...`;
    
    try {
        const response = await fetch("https://emailjs.com", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                template_params: {
                    email: targetEmail,
                    code: code          
                }
            })
        });

        if (response.ok) {
            document.getElementById("verify-info-text").innerHTML = `Письмо успешно улетело! Проверь личный ящик на почте:<br><b style="color:#1db954;">${targetEmail}</b>`;
        } else {
            const errText = await response.text();
            document.getElementById("verify-info-text").innerText = "Ответ сервера шлюза: " + errText;
            console.error(errText);
        }
    } catch (e) {
        document.getElementById("verify-info-text").innerText = "Ошибка блокировки запроса браузером. Повтори!";
        console.error(e);
    }
}

function processRegistration() {
    const email = document.getElementById("reg-email").value.trim();
    const name = document.getElementById("reg-name").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const day = document.getElementById("reg-day").value;
    const month = document.getElementById("reg-month").value;
    const year = document.getElementById("reg-year").value;
    const pass = document.getElementById("reg-pass").value;
    const confirm = document.getElementById("reg-confirm").value;

    if (!email || !name || !username || !day || !month || !year || !pass || !confirm) {
        alert("Заполни все поля, бро!"); return;
    }
    if (pass !== confirm) {
        alert("Пароли не совпадают!"); return;
    }
    if (localStorage.getItem("lorify_user_" + username)) {
        alert("Этот юзернейм уже занят!"); return;
    }

    tempRegistrationData = {
        email: email, name: name, username: username, birthday: `${day}.${month}.${year}`, pass: pass
    };

    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(100 + Math.random() * 900);
    generatedCode = `${part1}-${part2}`;

    showScreen('verify-screen');
    sendRealEmail(email, generatedCode);
}

function checkVerificationCode() {
    const inputCode = document.getElementById("verify-code").value.trim();
    if (inputCode === generatedCode) {
        localStorage.setItem("lorify_user_" + tempRegistrationData.username, JSON.stringify(tempRegistrationData));
        document.getElementById("welcome-user-title").innerText = `Добро пожаловать, ${tempRegistrationData.username}`;
        showScreen('success-screen');
        document.getElementById("verify-code").value = "";
    } else {
        alert("Неверный код! Посмотри внимательнее новое письмо в своём почтовом ящике.");
    }
}

function processLogin() {
    const username = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-pass").value;
    if (!username || !pass) { alert("Заполни логин и пароль!"); return; }

    const savedUserStr = localStorage.getItem("lorify_user_" + username);
    if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.pass === pass) {
            document.getElementById("login-username").value = "";
            document.getElementById("login-pass").value = "";
            showScreen('soon-screen');
        } else { alert("Неверный пароль!"); }
    } else { alert("Пользователь не найден!"); }
}

function logoutBoba() { showScreen('welcome-screen'); }

document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
});
