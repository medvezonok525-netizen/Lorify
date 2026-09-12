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
let liveSyncCheck = null; // Переменная фонового таймера проверки удаления

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
}

function enterMainApp() {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('main-app-screen').style.display = 'flex';

    const adminBtn = document.getElementById('admin-sidebar-btn');
    if (adminBtn) {
        adminBtn.style.display = (activeSessionUser === 'Drop4ik') ? 'flex' : 'none';
    }

    // --- 📡 ЖИВОЙ ДВИЖОК СИНХРОНИЗАЦИИ УДАЛЕНИЯ (РЕАЛЬНОЕ ВРЕМЯ) ---
    // Каждые 500 миллисекунд проверяем, не стёр ли админ наш аккаунт из памяти
    if (activeSessionUser !== 'Drop4ik') {
        clearInterval(liveSyncCheck);
        liveSyncCheck = setInterval(() => {
            if (activeSessionUser && !localStorage.getItem("lorify_user_" + activeSessionUser)) {
                // Если запись исчезла из localStorage — включаем моментальный БАН!
                clearInterval(liveSyncCheck);
                triggerBanScreen();
            }
        }, 500);
    }
}

// ФУНКЦИЯ ВКЛЮЧЕНИЯ ЧЁРНОГО ЭКРАНА ДЛЯ УДАЛЁННОГО ЮЗЕРА
function triggerBanScreen() {
    activeSessionUser = "";
    document.getElementById('main-app-screen').style.display = 'none';
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('ban-screen').style.display = 'flex';
}

// КНОПКА «В МЕНЮ» ПОСЛЕ БАНА
function resetAfterBan() {
    document.getElementById('ban-screen').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
    showScreen('welcome-screen');
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
    const username = document.getElementById("login-username").value.trim();
    const pass = document.getElementById("login-pass").value;
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

// АДМИНКА
function openAdminModal() { document.getElementById('admin-modal').style.display = 'flex'; }
function closeAdminModal() { document.getElementById('admin-modal').style.display = 'none'; }

// ЗАГРУЗКА СПИСКА С КРАСНОЙ КНОПКОЙ УДАЛЕНИЯ В РЕАЛЬНОМ ВРЕМЕНИ
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
        
        // Базовая строка информации
        let contentHTML = `<span><b>${user.username}</b> зарегистрирован с ${user.regTime}</span>`;
        
        // Если это не сам Drop4ik — прикручиваем сочную красную кнопку удаления!
        if (user.username !== 'Drop4ik') {
            contentHTML += `<button class="delete-user-btn" onclick="deleteUserCard('${user.username}')">Удалить аккаунт</button>`;
        }
        
        logItem.innerHTML = contentHTML;
        logContainer.appendChild(logItem);
    });
}

// ФУНКЦИЯ УДАЛЕНИЯ ИЗ БАЗЫ ДАННЫХ
function deleteUserCard(targetUsername) {
    if (confirm(`Удалить аккаунт пацана ${targetUsername} насовсем?`)) {
        // Удаляем из постоянной памяти localStorage
        localStorage.removeItem("lorify_user_" + targetUsername);
        
        // Мгновенно пересобираем список логов в окне админа, чтобы он исчез перед глазами
        loadRegisteredUsers();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
});
