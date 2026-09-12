// Фиксация Drop4ik
if (!localStorage.getItem("lorify_user_Drop4ik")) {
    const testAcc = {
        name: "Разработчик", 
        username: "Drop4ik", 
        birthday: "01.01.2000", 
        pass: "123",
        regTime: "Вшит в ядро системы" // Вечный статус создателя
    };
    localStorage.setItem("lorify_user_Drop4ik", JSON.stringify(testAcc));
}

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

function showScreen(screenId, currentUsername = "") {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    
    const mainApp = document.getElementById('main-app-screen');
    if (mainApp) mainApp.style.display = 'none';

    const target = document.getElementById(screenId);
    if (target) {
        target.style.display = 'flex';
        
        // КЛЮЧЕВАЯ ЛОГИКА: Если вошёл Drop4ik — принудительно выкатываем кнопку админки!
        const adminBtn = document.getElementById('admin-sidebar-btn');
        if (adminBtn) {
            if (screenId === 'main-app-screen' && currentUsername === 'Drop4ik') {
                adminBtn.style.display = 'flex';
            } else if (screenId === 'welcome-screen') {
                adminBtn.style.display = 'none'; // Гасим при логауте
            }
        }
    }
}

// РЕГИСТРАЦИЯ С ФИКСАЦИЕЙ ВРЕМЕНИ
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

    // Считываем точное время с iPad
    const now = new Date();
    const monthsArr = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const formattedTime = `${now.getDate()} ${monthsArr[now.getMonth()]} ${now.getFullYear()} г., ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userData = {
        name: name,
        username: username,
        birthday: `${day}.${month}.${year}`,
        pass: pass,
        regTime: formattedTime // Сохраняем дату в базу
    };

    localStorage.setItem("lorify_user_" + username, JSON.stringify(userData));

    document.getElementById("welcome-user-title").innerText = `Добро пожаловать, ${username}`;
    
    // Передаем никнейм в навигатор, чтобы проверить на права админа
    showScreen('success-screen', username);

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
            
            // Передаем никнейм во внутренний шлюз
            showScreen('main-app-screen', username);
        } else { alert("Неверный пароль!"); }
    } else { alert("Пользователь не найден!"); }
}

// ⚙️ СИСТЕМНЫЕ СКРИПТЫ АДМИН-ПАНЕЛИ (КЛАСТЕР ДАННЫХ)
function openAdminModal() {
    document.getElementById('admin-modal').style.display = 'flex';
}

function closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
}

// СКАНИРОВАНИЕ БАЗЫ ДАННЫХ ПО КЛИКУ НА КНОПКУ ПАНЕЛИ
function loadRegisteredUsers() {
    const logContainer = document.getElementById('users-log-list');
    logContainer.innerHTML = ""; // Сбрасываем старый текст

    let foundUsers = [];

    // Бежим по всей памяти iPad и вытаскиваем ключи пользователей
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("lorify_user_")) {
            const userObj = JSON.parse(localStorage.getItem(key));
            foundUsers.push(userObj);
        }
    }

    // Если никого нет кроме Drop4ik (хотя Drop4ik там будет всегда)
    if (foundUsers.length === 0) {
        logContainer.innerHTML = `<div style="color: #ff3b30; text-align: center;">Пользователи не обнаружены.</div>`;
        return;
    }

    // Выводим данные в ТЗ формате: {user} зарегистрирован с {дата, время, год}
    foundUsers.forEach(user => {
        const logItem = document.createElement('div');
        logItem.className = 'user-log-item';
        logItem.innerHTML = `<b>${user.username}</b> зарегистрирован с ${user.regTime}`;
        logContainer.appendChild(logItem);
    });
}

function logoutBoba() { 
    showScreen('welcome-screen'); 
}

document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
});
