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

    // Очищаем старые опции, чтобы не дублировались
    daySelect.innerHTML = '<option value="">День</option>';
    monthSelect.innerHTML = '<option value="">Месяц</option>';
    yearSelect.innerHTML = '<option value="">Год</option>';

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
    
    const errorMsg = document.getElementById("username-error-msg");
    const submitBtn = document.getElementById("reg-submit-btn");
    if (errorMsg && submitBtn) {
        errorMsg.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

// ЖИВАЯ ПРОВЕРКА ЮЗЕРНЕЙМА
function checkUsernameLive() {
    const usernameInput = document.getElementById("reg-username");
    const errorMsg = document.getElementById("username-error-msg");
    const submitBtn = document.getElementById("reg-submit-btn");

    if (!usernameInput || !errorMsg || !submitBtn) return;

    let inputUsername = usernameInput.value.trim();

    if (inputUsername.startsWith("@")) inputUsername = inputUsername.substring(1);
    if (inputUsername.endsWith("@")) inputUsername = inputUsername.slice(0, -1);

    if (inputUsername === "") {
        errorMsg.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        return;
    }

    let isTaken = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.toLowerCase() === ("lorify_user_" + inputUsername).toLowerCase()) {
            isTaken = true;
            break;
        }
    }

    if (isTaken) {
        errorMsg.style.display = "block";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.4";
    } else {
        errorMsg.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

function changeContentArea(blockName) {
    document.querySelectorAll('.content-block').forEach(b => b.style.display = 'none');
    const targetBlock = document.getElementById('content-' + blockName);
    if (targetBlock) targetBlock.style.display = 'block';
}

function enterMainApp() {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('main-app-screen').style.display = 'flex';
    changeContentArea('welcome');

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
    localStorage.removeItem("lorify_active_session");
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

    if (username.startsWith("@")) username = username.substring(1);
    if (username.endsWith("@")) username = username.slice(0, -1);

    if (!name || !username || !day || !month || !year || !pass || !confirm) {
        alert("Заполни все поля, бро!"); return;
    }
    if (pass !== confirm) {
        alert("Пароли не совпадают!"); return;
    }

    const now = new Date();
    const monthsArr = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
    const formattedTime = `${now.getDate()} ${monthsArr[now.getMonth()]} ${now.getFullYear()} г., ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const userData = {
        name: name, username: username, birthday: `${day}.${month}.${year}`, pass: pass, regTime: formattedTime
    };

    localStorage.setItem("lorify_user_" + username, JSON.stringify(userData));
    localStorage.setItem("lorify_active_session", username);
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

    if (username.startsWith("@")) username = username.substring(1);
    if (username.endsWith("@")) username = username.slice(0, -1);

    if (!username || !pass) { alert("Заполни логин и пароль!"); return; }

    const savedUserStr = localStorage.getItem("lorify_user_" + username);
    if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser.pass === pass) {
            document.getElementById("login-username").value = "";
            document.getElementById("login-pass").value = "";
            
            localStorage.setItem("lorify_active_session", username);
            activeSessionUser = username;
            enterMainApp();
        } else { alert("Неверный пароль!"); }
    } else { alert("Пользователь не найден!"); }
}

// ВЫХОД
function logoutBoba() { 
    clearInterval(liveSyncCheck);
    localStorage.removeItem("lorify_active_session");
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

// БЕЗОПАСНЫЙ СИНХРОНИЗАТОР СЕССИИ (ИСПРАВЛЕННЫЙ, БЕЗ СБОЕВ ПРИ ПЕРВОМ ЗАПУСКЕ)
function checkSavedSessionLive() {
    const savedSession = localStorage.getItem("lorify_active_session");
    if (savedSession) {
        const checkUserExists = localStorage.getItem("lorify_user_" + savedSession);
        if (checkUserExists) {
            activeSessionUser = savedSession;
            enterMainApp();
        } else {
            localStorage.removeItem("lorify_active_session");
        }
    }
}

// Строгий порядок запуска
document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
    checkSavedSessionLive();
});
