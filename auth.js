// Полное и автоматическое обнуление старой базы данных при первом запуске фикса
(function() {
    if (!localStorage.getItem("lorify_database_clear_v6")) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith("lorify_user_")) {
                localStorage.removeItem(key);
            }
        }
        localStorage.setItem("lorify_database_clear_v6", "true");
    }
})();

// Железобетонный вечный тестовый аккаунт Drop4ik
if (!localStorage.getItem("lorify_user_Drop4ik")) {
    const testAcc = {
        name: "Разработчик", 
        username: "Drop4ik", 
        birthday: "01.01.2000", 
        pass: "123"
    };
    localStorage.setItem("lorify_user_Drop4ik", JSON.stringify(testAcc));
}

// Генерация выпадающих списков для красивой даты рождения
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

// Плавное переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(screenId);
    if (target) target.style.display = 'flex';
}

// ЧИСТАЯ МОМЕНТАЛЬНАЯ РЕГИСТРАЦИЯ (КНОПКА ТЕПЕРЬ СРАБАТЫВАЕТ МГНОВЕННО)
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

    const userData = {
        name: name,
        username: username,
        birthday: `${day}.${month}.${year}`,
        pass: pass
    };

    // Записываем профиль в базу данных
    localStorage.setItem("lorify_user_" + username, JSON.stringify(userData));

    // Выводим имя на экран успеха и переключаем
    document.getElementById("welcome-user-title").innerText = `Добро пожаловать, ${username}`;
    showScreen('success-screen');

    // Очищаем инпуты
    document.getElementById("reg-name").value = "";
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-pass").value = "";
    document.getElementById("reg-confirm").value = "";
}

// СИСТЕМА ВХОДА (ЛОГИН)
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

// ИСПРАВЛЕННЫЙ ВЫХОД ИЗ СИСТЕМЫ (ВОЗВРАЩАЕТ НА ПРИВЕТСТВЕННЫЙ ЭКРАН)
function logoutBoba() { 
    showScreen('welcome-screen'); 
}

// Запуск при старте
document.addEventListener("DOMContentLoaded", () => {
    initDateSelectors();
});
