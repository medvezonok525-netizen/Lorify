// Фиксация Drop4ik
if (!localStorage.getItem("lorify_user_Drop4ik")) {
    const testAcc = {
        name: "Разработчик", 
        username: "Drop4ik", 
        birthday: "01.01.2000", 
        pass: "123",
        regTime: "Вшит в ядро системы"
    };
    localStorage.setItem("lorify_user_Drop4ik", JSON.stringify(testAcc));
}

let activeSessionUser = ""; // Буфер текущего вошедшего юзера

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

// ПЛАВНОЕ И НАДЁЖНОЕ ПЕРЕКЛЮЧЕНИЕ КАРТОЧЕК ВХОДА
function showScreen(screenId) {
    document.querySelectorAll('.inner-screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'flex';
}

// ВХОД В ПОЛНОЭКРАННОЕ ПРИЛОЖЕНИЕ (С АВТО-ПРОВЕРКОЙ НА АДМИНА)
function enterMainApp() {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('main-app-screen').style.display = 'flex';

    const adminBtn = document.getElementById('admin-sidebar-btn');
    if (adminBtn) {
        if (activeSessionUser === 'Drop4ik') {
            adminBtn.style.display = 'flex';
        } else {
            adminBtn.style.display = 'none';
        }
    }
}

// РЕГИСТРАЦИЯ
function processRegistration() {
    const name = document.getElementById("reg-name").value.trim();
    const username = document.getElementById("reg-username").value.trim();
    const day = document.getElementById("reg-day").value;
    const month = document.getElementById("reg-month").value;
    const year = document.getElementById("reg-year").value;
    const pass = document.getElementById("reg-pass").value;
    const confirm = document.getElementById("reg-confirm").value;

    if (!name || !username || !day || !month || !year || !pass || !confirm) {
        alert("Заполни все поля, бро!"); return;
    }
    if (pass !== confirm) {
        alert("Пароли не совпадают!"); return;
    }
    if (localStorage.getItem("lorify_user_" + username)) {
        alert("Этот юзернейм уже занят!"); return;
    }

    const now = new Date();
    const monthsArr = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const formattedTime = `${now.getDate()} ${monthsArr[now.getMonth()]} ${now.getFullYear()} г., ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userData = {
        name: name,
        username: username,
        birthday: `${day}.${month}.${year}`,
        pass: pass,
        regTime: formattedTime
    };

    localStorage.setItem("lorify_user_" + username, JSON.stringify(userData));
    activeSessionUser = username;

    document.getElementById("welcome-user-title").innerText = `Добро пожаловать, ${username}`;
    showScreen('success-screen');

    document.getElementById("reg-name").value = "";
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-pass").value = "";
    document.getElementById("reg-confirm").value = "";
}

// ВХОД
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
            
            activeSessionUser = username; // Фиксируем сессию
            enterMainApp(); // Залетаем в плеер
        } else { alert("Неверный пароль!"); }
    } else { alert("Пользователь не найден!"); }
}

// ЖЕЛЕЗОБЕТОННЫЙ ВЫХОД: ПУСТОЙ ЭКРАН ТЕПЕРЬ ПОЛНОСТЬЮ ИСКЛЮЧЕН
function logoutBoba() { 
    activeSessionUser = "";
    document.getElementById('main-app-screen').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
    showScreen('welcome-screen'); 
}

// АДМИНКА
function openAdminModal() { document.getElementById('admin-modal').style.display = 'flex'; }
function closeAdminModal() { document.getElementById('admin-modal').style.display = 'none'; }

function loadRegisteredUsers() {
    const logContainer = document.getElementById('users-log-list');
    logContainer.innerHTML = "";
    let foundUsers = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("lorify_user_")) {
            foundUsers.push(JSON.parse(localStorage.getItem(key)));
        }
    }

    foundUsers.forEach(user => {
        const logItem = document.createElement('div');
        logItem.className = 'user-log-item';
        logItem.innerHTML = `<b>${user.username}</b> зарегистрирован с ${user.regTime}`;
        logContainer.appendChild(logItem);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
});
