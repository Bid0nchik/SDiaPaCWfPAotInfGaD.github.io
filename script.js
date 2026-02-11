const API_URL = 'https://sdiapacwfpaotinfgad-github-io-1.onrender.com';
let articles = [];
let currentImage = null;
let currentMode = null;
let currentEditingArticleId = null;
let currentTheme = 'dark';
let currentSection = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    // Обработчики событий
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
    document.getElementById('adminLoginBtn').addEventListener('click', enterReg);
    document.getElementById('guestLoginBtn').addEventListener('click', enterAsGuest);
    document.getElementById("RegisterBtn").addEventListener("click", sendSMSCodeFront);
    //document.getElementById("SendBtn").addEventListener("click", verifySMS);
    document.getElementById('passwordInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkPassword(); // если событие нажатия клавиши e происходит и оно enter то...
    });
    document.addEventListener('DOMContentLoaded', (event) => {
    const firstTabButton = document.querySelector('.tab-button');
    if (firstTabButton) {
        firstTabButton.click();
    }
});
    // Обработчики клавиш
    document.addEventListener('keydown', handleKeyPress);
});

// Обработка нажатия клавиш
function handleKeyPress(event) {
    if (event.key === 'Escape') {
        if (!document.getElementById('authModal').classList.contains('hidden')) {
            return;
        }
        if (!document.getElementById('articleEditor').classList.contains('hidden')) {
            cancelEditing();
        } else if (!document.getElementById('articleView').classList.contains('hidden')) {
            hideArticleView();
        }
    }
}

// Меняем цвет текста в select
const select = document.getElementById('form-select');
    if (select.value == 'empty'){
        select.style.color = '#8d8d8d';
    }
select.addEventListener("change", function(e){
    select.style.color = '#ffffffff';
});

function enterReg(){
    document.getElementById('authModal').classList.add('hidden')
    document.getElementById('EnterRegWin').classList.remove('hidden')
}

// Функция для открытия определенной вкладки (Login или Register)
function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    // Скрыть все элементы с классом .tab-content
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Удалить класс "active" у всех кнопок вкладок
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Показать текущую вкладку и добавить класс "active" к кнопке, которая ее открыла
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

async function sendSMSCodeFront() {
    const username = document.getElementById('usernameInput').value.trim();
    const login = document.getElementById('regLoginInput').value.trim();
    const password = document.getElementById('regPasswordInput').value.trim();
    const repeat_password = document.getElementById('regPasswordConfirmInput').value.trim();
    const errorMes = document.getElementById("errorMessage");
    
    // Проверки
    if (!username) return errorMes.textContent = "Введите username";
    if (!login) return errorMes.textContent = "Введите логин";
    if (!password) return errorMes.textContent = "Введите пароль";
    if (!repeat_password) return errorMes.textContent = 'Введите повтор пароля';
    if (password !== repeat_password) return errorMes.textContent = "Пароли не совпадают";
    if (login.length < 5) return errorMes.textContent = 'Минимальная длина логина - 6 символов';
    if (password.length < 5) return errorMes.textContent = 'Минимальная длина пароля - 6 символов';
    
    errorMes.textContent = "Отправка...";
    errorMes.style.color = 'gray';
    
    try {
        const response = await fetch(`${API_URL}/auth/sms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username: username,
                login: login,      // 👉 сохраняем на будущее
                password: password  // 👉 сохраняем на будущее
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            // 👇 ПОКАЗЫВАЕМ ОШИБКУ, а не throw
            errorMes.textContent = data.error || 'Ошибка сервера';
            errorMes.style.color = 'red';
            return;
        }
        
        if (data.success === true) {
            // 👇 СОХРАНЯЕМ данные для следующего шага
            localStorage.setItem('pendingUsername', username);
            localStorage.setItem('pendingLogin', login);
            localStorage.setItem('pendingPassword', password);
            
            // 👇 ПОКАЗЫВАЕМ понятное сообщение
            errorMes.textContent = '✅ Код отправлен в Telegram! Проверьте @' + username;
            errorMes.style.color = 'green';
            
            // 👇 ПОКАЗЫВАЕМ поле для ввода кода
            document.getElementById('SMS').classList.remove('hidden');
            document.getElementById('RegisterBtn').disabled = true;
        } else {
            errorMes.textContent = data.error || 'Не удалось отправить код';
            errorMes.style.color = 'red';
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        errorMes.textContent = 'Ошибка соединения с сервером';
        errorMes.style.color = 'red';
    }
}
// ✅ НОВАЯ ФУНКЦИЯ
async function verifySMS() {
    const code = document.getElementById('CodeSMS').value.trim();
    const username = localStorage.getItem('pendingUsername');
    const login = localStorage.getItem('pendingLogin');
    const password = localStorage.getItem('pendingPassword');
    const errorMes = document.getElementById("errorMessage");
    
    if (!code) {
        errorMes.textContent = 'Введите код из Telegram';
        return;
    }
    
    errorMes.textContent = 'Проверка...';
    errorMes.style.color = 'gray';
    
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                code: code
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 👇 УСПЕХ! Регистрируем пользователя
            errorMes.textContent = '✅ Успешная регистрация!';
            errorMes.style.color = 'green';
            
            // Очищаем сохраненные данные
            localStorage.removeItem('pendingUsername');
            localStorage.removeItem('pendingLogin');
            localStorage.removeItem('pendingPassword');
            
            // Автоматический вход
            currentMode = 'guest';
            showAllFunctions();
            hideWindowАuthorization();
            showGuestFunctions();
            
            // Скрываем окно регистрации
            document.getElementById('EnterRegWin').classList.add('hidden');
            document.getElementById('SMS').classList.add('hidden');
            
        } else {
            errorMes.textContent = data.error || 'Неверный код';
            errorMes.style.color = 'red';
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        errorMes.textContent = 'Ошибка соединения с сервером';
        errorMes.style.color = 'red';
    }
}

// 👇 НЕ ЗАБУДЬ ПРИВЯЗАТЬ К КНОПКЕ!
document.getElementById("SendBtn").addEventListener("click", verifySMS);
// ФУНКЦИЯ ПРОВЕРКИ ПАРОЛЯ ЧЕРЕЗ СЕРВЕР
/*async function checkLogPasEnter() {
    const login = document.getElementById('loginInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (!login) return errorMessage.textContent = "Введите логин"
    if (!password) return errorMessage.textContent = 'Введите пароль';

    const response = await fetch(`https://sdiapacwfpaotinfgad-github-io-1.onrender.com/auth/check-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login:login, password: password })
    });
    
    const data = await response.json();
    
    if (data.admin === 'yes') {
        currentMode = 'admin';
        showAllFunctions();
        hideWindowАuthorization();
        showAdminFunctions();
        errorMessage.textContent = '';
        passwordInput.value = '';
    }

    if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }
}*/
// Вход как гость
function enterAsGuest() {
    currentMode = 'guest';
    showAllFunctions();
    hideWindowАuthorization();
    showGuestFunctions();
}


// ON/OFF ИНТЕРФЕЙС
// Скрываем окно аутентификации
function hideWindowАuthorization() {
    document.getElementById('authModal').classList.add('hidden');
}
// Функции всех 
function showAllFunctions(){
    window.scrollTo(0,0);
    document.getElementById('themeToggle').classList.remove('hidden');
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('selectionMenu').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('hero-image').classList.remove('hidden');
}
// Показать функции администратора
function showAdminFunctions() {
    document.getElementById('newArticleBtn').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Администратор';
    document.getElementById('userStatus').className = 'user-status admin';
}
// Показать функции гостя
function showGuestFunctions() {
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('userStatus').textContent = 'Гость';
    document.getElementById('userStatus').className = 'user-status guest';
}
// Показать выбор режима
function showModeSelection() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('hero-image').classList.add('hidden');
}

// Переход на главную страницу
function goToHome() {
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('hero-image').classList.remove('hidden');
    document.getElementById("selectionMenu").classList.remove('hidden');
    document.getElementById("articlesContainer").classList.add('hidden');
    currentEditingArticleId = null;
    currentSection = null;
}
function goToStat(){
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById("articlesContainer").classList.remove('hidden');
}

// Выход из системы
function logout() {
    currentMode = null;
    currentEditingArticleId = null;
    currentImage = null;
    
    document.getElementById('themeToggle').classList.add('hidden');
    document.getElementById('homeBtn').classList.add('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('userStatus').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('selectionMenu').classList.add('hidden');
    document.getElementById('articlesContainer').classList.add('hidden');
    document.getElementById('EnterRegWin').classList.add('hidden');
    showModeSelection();
}

// Загрузка статей с сервера
async function loadArticlesFromServer() {
    try {
        showLoading(true); // ON/OFF значка загрузки и текста загрузки
        const response = await fetch(`${API_URL}/articles/${currentSection}`);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} - ${response.statusText}`); // Создание и выброс ошибки с инфой об http статусе
        }
        articles = await response.json(); // записываем массив статей в массив парся json
        renderArticles();  
    } catch (error) { 
        showError('Не удалось загрузить статьи. Проверьте подключение к серверу.');
    } finally {
        showLoading(false);
    }
}

// Отображение списка статей
function renderArticles() {
    const container = document.getElementById('articlesContainer');
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="no-articles">
                <h4>Статей пока нет</h3>
            </div>`;
        return;
    }
    container.innerHTML = `
        <div class="section-articles">
            ${[...articles].map(article => `
                <div class="article-card" onclick="viewArticle('${article.id}')">
                    ${article.image ? `
                        <img src="${article.image}" alt="${article.title}" 
                             class="article-card-image" loading="lazy">
                    `:''}
                    <div class="article-card-content">
                        <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
                        <p class="article-card-preview">${getPreview(article.content)}</p>
                        <p class="article-card-date">${formatDate(article.date)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    // добавляем в контейнер массив и определяем содержание каждого элемента массива (статьи)
}

// Показать/скрыть загрузку
function showLoading(show) {
    if (show) {
        document.getElementById('articlesContainer').innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загрузка статей...</p>
            </div>
        `;
    }
}
// Показать ошибку
function showError(message) {
    const container = document.getElementById('articlesContainer');
    if (container) {
        container.innerHTML = `
            <div class="no-articles error">
                <h3>Ошибка загрузки</h3>
                <p>${escapeHtml(message)}</p>
                <button class="btn btn-primary" onclick="loadArticlesFromServer()">
                    Повторить попытку
                </button>
            </div>
        `;
    }
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Получение превью текста
function getPreview(text, maxLength = 150) {
    if (!text) return 'Нет содержания';
    const cleanText = text.replace(/<br>/g, ' ').replace(/<[^>]*>/g, ''); // убираем все тэги и меняем их на пробелы и ''
    const escapedText = escapeHtml(cleanText);                             // очистка текста от ненужного, делаем его просто чистым
    if (escapedText.length <= maxLength) return escapedText;    // если текст меньше по длинне чем наше ограничение, то в превью он будет полностью отображатся
    return escapedText.substring(0, maxLength) + '...'; // если больше maxlength то обрезаем и + ... 
}

// Форматирование даты
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Дата неизвестна';
    }
}

// Обработка загрузки изображения
function handleImageUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');
    
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения');
            event.target.value = '';
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Размер изображения не должен превышать 5MB');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            preview.innerHTML = `<img src="${currentImage}" alt="Предпросмотр">`;
            removeBtn.classList.remove('hidden');
        };
        reader.onerror = function() {
            alert('Ошибка при загрузке изображения');
            event.target.value = '';
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
        removeBtn.classList.add('hidden');
        currentImage = null;
    }
}

// Удаление выбранной картинки
function removeImage() {
    const preview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('articleImage');
    const removeBtn = document.getElementById('removeImageBtn');
    
    preview.innerHTML = '';
    fileInput.value = '';
    removeBtn.classList.add('hidden');
    currentImage = null;
}

// Показать редактор для новой статьи
function showEditor() {
    if (currentMode !== 'admin') {
        alert('Доступ запрещен! Требуются права администратора.');
        return;
    }
    currentEditingArticleId = null;
    document.getElementById('selectionMenu').classList.add('hidden');
    document.getElementById('articlesContainer').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articleEditor').classList.remove('hidden');
    document.getElementById('hero-image').classList.add('hidden');
    
    document.getElementById('articleTitle').value = '';
    document.getElementById('articleContent').value = '';
    document.getElementById('articleImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('removeImageBtn').classList.add('hidden');
    currentImage = null;
    
    document.getElementById('editorTitle').textContent = 'Новая статья';
    document.getElementById('saveButton').textContent = 'Опубликовать';
    document.getElementById('saveButton').disabled = false;
    
    document.getElementById('articleTitle').focus();
}

// Сохранение статьи
async function saveArticle() {
    const title = document.getElementById('articleTitle').value.trim();
    const select = document.getElementById('form-select').value;
    const content = document.getElementById('articleContent').value.trim();
    const saveButton = document.getElementById('saveButton');
    if (select == "empty"){
        alert('Пожалуйста, выберите раздел');
        return;
    }if (!title) {
        alert('Пожалуйста, введите заголовок статьи');
        titleInput.focus();
        return;
    }if (!content) {
        alert('Пожалуйста, введите содержание статьи');
        contentInput.focus();
        return;
    }
    saveButton.disabled = true;
    saveButton.textContent = 'Сохранение...';

    try {
        const articleData = {
            title: title,
            content: content,
            image: currentImage,
            date: new Date().toISOString(),
        };
            if (currentEditingArticleId && currentSection === select) {
                await updateArticleOnServer(currentEditingArticleId, articleData);

            }else if(currentEditingArticleId && currentSection !== select) {
                await saveArticleToServer(select, articleData);
                await deleteArticleFromServer(currentEditingArticleId);

            } else {
                await saveArticleToServer(select, articleData);
            }
        await loadArticlesFromServer();
        goToHome();
    } catch (error) {
        alert(`Не удалось сохранить статью: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = currentEditingArticleId ? 'Сохранить изменения' : 'Опубликовать';
    }
}

// Сохранение статьи на сервер
async function saveArticleToServer(section, articleData) {
    const response = await fetch(`${API_URL}/articles/${section}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }
    return await response.json();
}

// Обновление статьи на сервере
async function updateArticleOnServer(articleId, articleData) {
    const response = await fetch(`${API_URL}/articles/${currentSection}/${articleId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }
    return await response.json();
}

// Удаление статьи
async function deleteArticle(articleId) {
    if (!confirm('Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.')) {
        return;
    }
    try {
        await deleteArticleFromServer(articleId);
        await loadArticlesFromServer();
        goToHome();
    } catch (error) {
        alert(`Не удалось удалить статью: ${error.message}`);
    }
}

// Удаление статьи с сервера
async function deleteArticleFromServer(articleId) {
    const section = currentSection;
    const response = await fetch(`${API_URL}/articles/${section}/${articleId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }
}

// Просмотр статьи
function viewArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        alert('Статья не найдена!');
        return;
    }
   document.getElementById("articlesContainer").classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('hero-image').classList.add('hidden');
    document.getElementById('articleView').classList.remove('hidden');

    const container = document.getElementById('articleContentContainer');
    
    let articleHTML = `
        <div class="article-meta">
            <p>Опубликовано: ${formatDate(article.date)}</p>
        </div>
        <h1>${escapeHtml(article.title)}</h1>
        ${article.image ? `<img src="${article.image}" alt="${escapeHtml(article.title)}" class="article-image" loading="lazy">` : ''}
        <div class="article-text">${article.content.replace(/\n/g, '<br>')}</div>
    `;
    
    if (currentMode === 'admin') {
        articleHTML += `
            <div class="article-admin-actions">
                <button class="btn btn-primary" onclick="editArticle('${article.id}')">
                    Редактировать статью
                </button>
                <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                    Удалить статью
                </button>
            </div>
        `;
    }
    container.innerHTML = articleHTML;
}

// Функция редактирования статьи
function editArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        alert('Статья не найдена!');
        return;
    }
    currentEditingArticleId = articleId;
// открываем окно изменения
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articleEditor').classList.remove('hidden');
    document.getElementById('hero-image').classList.add('hidden');
// записываем значение заголовка, мэйн текста и тд в поля
    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleContent').value = article.content;
    document.getElementById('form-select').value = currentSection;

    const preview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeImageBtn');

    if (article.image) {
        currentImage = article.image;
        preview.innerHTML = `<img src="${article.image}" alt="Предпросмотр">`;
        removeBtn.classList.remove('hidden');
    } else {
        preview.innerHTML = '';
        removeBtn.classList.add('hidden');
        currentImage = null;
    }

    document.getElementById('editorTitle').textContent = 'Редактирование статьи';
    document.getElementById('saveButton').textContent = 'Сохранить изменения';
    document.getElementById('saveButton').disabled = false;
}

// Функции для темы
function loadTheme() {
    const savedTheme = localStorage.getItem('blog_theme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('blog_theme', currentTheme);
}

function LoadSectionProgramm(){
    RemoveSelections();
    currentSection = 'Prog';
    loadArticlesFromServer();
}
function LoadSectionOsint(){
    RemoveSelections();
    currentSection = 'OSINT';
    loadArticlesFromServer();
}
function LoadSectionTroll(){
    RemoveSelections();
    currentSection = 'Trol';
    loadArticlesFromServer();
}

function RemoveSelections(){
    document.getElementById("hero-image").classList.add('hidden');
    document.getElementById("selectionMenu").classList.add('hidden');
    document.getElementById("articlesContainer").classList.remove('hidden');
}