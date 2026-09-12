// Фиксация вечного Drop4ik
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

let activeSessionUser = ""; 
let liveSyncCheck = null; 

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
    document.querySelectorAll('.inner-screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'flex';
    
    // Сбрасываем ошибку юзернейма при переходах между экранами
    const errorMsg = document.getElementById("username-error-msg");
    const submitBtn = document.getElementById("reg-submit-btn");
    if (errorMsg && submitBtn) {
        errorMsg.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

// --- 🔍 ТВОЙ ЛИЧНЫЙ ЖИВОЙ ДЕТЕКТОР ЗАНЯТЫХ НИКНЕЙМОВ ---
function checkUsernameLive() {
    let inputUsername = document.getElementById("reg-username").value.trim();
    const errorMsg = document.getElementById("username-error-msg");
    const submitBtn = document.getElementById("reg-submit-btn");

    if (!errorMsg || !submitBtn) return;

    // Хак: Если юзер вводит имя со знаком @ на конце или начале (например @lolka) — стираем @ для правильной проверки базы
    if (inputUsername.startsWith("@")) {
        inputUsername = inputUsername.substring(1);
    }

    if (inputUsername === "") {
        errorMsg.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        return;
    }

    // Проверяем наличие ключа в localStorage устройства
    const isUserTaken = localStorage.getItem("lorify_user_" + inputUsername);

    if (isUserTaken) {
        // Если имя совпало — выкатываем красивый красный текст под инпутом
        errorMsg.style.display = "block";
        submitBtn.disabled = true; // Блокируем клик наглухо
        submitBtn.style.opacity = "0.4"; // Делаем кнопку тусклой
    } else {
        // Если имя свободно — полностью тушим предупреждение
        errorMsg.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

function enterMainApp() {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('main-app-screen').style.display = 'flex';

    const adminBtn = document.getElementById('admin-sidebar-btn');
    if (adminBtn) {
        adminBtn.style.display = (activeSessionUser === 'Drop4ik') ? 'flex' : 'none';
    }

    if (activeSessionUser !== 'Drop4ik') {
        clearInterval(liveSyncCheck);
        liveSyncCheck = setInterval(() => {
            if (activeSessionUser && !localStorage.getItem("lorify_user_" + activeSessionUser)) {
                clearInterval(liveSyncCheck);
                triggerBanScreen();
            }
        }, 500);
    }
}

function triggerBanScreen() {
    activeSessionUser = "";
    document.getElementById('main-app-screen').style.display = 'none';
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('ban-screen').style.display = 'flex';
}

function resetAfterBan() {
    document.getElementById('ban-screen').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
    showScreen('welcome-screen');
}

// РЕГИСТРАЦИЯ
function processRegistration() {
    const name = document.getElementById("reg-name").value.trim();
    let username = document.getElementById("reg-username").value.trim();
    const day = document.getElementById("reg-day").value;
    const month = document.getElementById("reg-month").value;
    const year = document.getElementById("reg-year").value;
    const pass = document.getElementById("reg-pass").value;
    const confirm = document.getElementById("reg-confirm").value;

    if (username.startsWith("@")) {
        username = username.substring(1); // Сохраняем имя без знака @ для чистоты логов
    }

    if (!name || !username || !day || !month || !year || !pass || !confirm) {
        alert("Заполни все поля, бро!"); return;
    }
    if (pass !== confirm) {
        alert("Пароли не совпадают!"); return;
    }
    if (localStorage.getItem("lorify_user_" + username)) {
        return; // Двойная защита на случай если кнопка взломана
    }

    const now = new Date();
    const monthsArr = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const formattedTime = `${now.getDate()} ${monthsArr[now.getMonth()]} ${now.getFullYear()} г., ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userData = {
        name: name, username: username, birthday: `${day}.${month}.${year}`, pass: pass, regTime: formattedTime
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
    let username = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-pass").value;

    if (username.startsWith("@")) {
        username = username.substring(1); // Даем возможность входить и с собачкой @ и без неё
    }

    if (!username || !pass) { alert("Заполни логин и пароль!"); return; }

    const savedUserStr = localStorage.getItem("lorify_user_" + username);
    if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.pass === pass) {
            document.getElementById("login-username").value = "";
            document.getElementById("login-pass").value = "";
            
            activeSessionUser = username;
            enterMainApp();
        } else { alert("Неверный пароль!"); }
    } else { alert("Пользователь не найден!"); }
}

function logoutBoba() { 
    clearInterval(liveSyncCheck);
    activeSessionUser = "";
    document.getElementById('main-app-screen').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
    showScreen('welcome-screen'); 
}

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
        
        let contentHTML = `<span><b>${user.username}</b> зарегистрирован с ${user.regTime}</span>`;
        if (user.username !== 'Drop4ik') {
            contentHTML += `<button class="delete-user-btn" onclick="deleteUserCard('${user.username}')">Удалить аккаунт</button>`;
        }
        
        logItem.innerHTML = contentHTML;
        logContainer.appendChild(logItem);
    });
}

function deleteUserCard(targetUsername) {
    if (confirm(`Удалить аккаунт пацана ${targetUsername} насовсем?`)) {
        localStorage.removeItem("lorify_user_" + targetUsername);
        loadRegisteredUsers();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
});
