// Глобальные переменные
let articles = [];
let currentImage = null;
let currentMode = null;
let currentEditingArticleId = null;
let currentTheme = 'dark';

// Временный пароль для тестирования
const ADMIN_PASSWORD = 'admin123';

const API_URL = 'https://sdiapacwfpaotinfgad-github-io-1.onrender.com';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');
    loadTheme();
    loadArticlesFromServer();
    showModeSelection();
    
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
});

// Функция проверки пароля
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');
    const password = passwordInput.value.trim();

    if (password === ADMIN_PASSWORD) {
        currentMode = 'admin';
        hideAuthModal();
        showAdminFeatures();
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'Неверный пароль! Попробуйте снова.';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Вход как гость
function enterAsGuest() {
    currentMode = 'guest';
    hideAuthModal();
    showGuestFeatures();
}

// Скрыть модальное окно аутентификации
function hideAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

// Показать функции администратора
function showAdminFeatures() {
    document.getElementById('themeToggle').classList.remove('hidden');
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('newArticleBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Администратор';
    document.getElementById('userStatus').className = 'user-status admin';
    
    document.getElementById('articlesList').classList.remove('hidden');
}

// Показать функции гостя
function showGuestFeatures() {
    document.getElementById('themeToggle').classList.remove('hidden');
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Гость';
    document.getElementById('userStatus').className = 'user-status guest';
    
    document.getElementById('articlesList').classList.remove('hidden');
}

// Переход на главную страницу
function goToHome() {
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
}

// Выход из системы
function logout() {
    currentMode = null;
    document.getElementById('themeToggle').classList.add('hidden');
    document.getElementById('homeBtn').classList.add('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('userStatus').classList.add('hidden');
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    
    showModeSelection();
}

// Показать выбор режима
function showModeSelection() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('articlesList').classList.add('hidden');
}

// Загрузка статей с сервера
async function loadArticlesFromServer() {
    try {
        console.log('Загружаем статьи с сервера...');
        const response = await fetch(`${API_URL}/articles`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        articles = await response.json();
        console.log('Статьи загружены:', articles.length);
        renderArticles();
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showError('Не удалось загрузить статьи. Проверьте подключение к серверу.');
        renderArticles();
    }
}

// Отображение списка статей
function renderArticles() {
    const container = document.getElementById('articlesContainer');
    
    if (!container) {
        console.error('Контейнер статей не найден!');
        return;
    }
    
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="no-articles">
                <h3>Статей пока нет</h3>
                <p>${currentMode === 'admin' ? 'Нажмите "Новая статья" чтобы создать первую!' : 'Статьи появятся скоро!'}</p>
            </div>
        `;
        return;
    }

    const sortedArticles = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedArticles.map(article => `
        <div class="article-card" onclick="viewArticle('${article.id}')">
            ${article.image ? `
                <img src="${article.image}" alt="${article.title}" class="article-card-image">
            ` : `
                <div class="article-card-placeholder">Статья</div>
            `}
            <div class="article-card-content">
                <h3 class="article-card-title">${article.title}</h3>
                <p class="article-card-preview">${getPreview(article.content)}</p>
                <p class="article-card-date">${formatDate(article.date)}</p>
            </div>
        </div>
    `).join('');
}

// Получение превью текста
function getPreview(text, maxLength = 150) {
    if (!text) return 'Нет содержания';
    const cleanText = text.replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
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
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            preview.innerHTML = `<img src="${currentImage}" alt="Предпросмотр">`;
            removeBtn.classList.remove('hidden');
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
    
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articleEditor').classList.remove('hidden');
    
    document.getElementById('articleTitle').value = '';
    document.getElementById('articleContent').value = '';
    document.getElementById('articleImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('removeImageBtn').classList.add('hidden');
    currentImage = null;
    
    document.getElementById('editorTitle').textContent = 'Новая статья';
    document.getElementById('saveButton').textContent = 'Опубликовать';
    
    document.getElementById('articleTitle').focus();
}

// Функция редактирования статьи
function editArticle(articleId) {
    if (currentMode !== 'admin') {
        alert('Доступ запрещен! Требуются права администратора.');
        return;
    }

    const article = articles.find(a => a.id === articleId);
    if (!article) {
        alert('Статья не найдена!');
        return;
    }

    currentEditingArticleId = articleId;

    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articleEditor').classList.remove('hidden');

    document.getElementById('articleTitle').value = article.title;
    document.getElementById('articleContent').value = article.content;
    
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

    document.getElementById('articleTitle').focus();
}

// Отмена редактирования
function cancelEditing() {
    const message = currentEditingArticleId ? 
        'Вы уверены, что хотите отменить редактирование? Все несохраненные изменения будут потеряны.' :
        'Вы уверены, что хотите отменить создание статьи? Все несохраненные данные будут потеряны.';
    
    if (confirm(message)) {
        hideEditor();
        goToHome();
    }
}

// Скрыть редактор
function hideEditor() {
    document.getElementById('articleEditor').classList.add('hidden');
    currentEditingArticleId = null;
}

// Сохранение статьи
async function saveArticle() {
    const title = document.getElementById('articleTitle').value.trim();
    const content = document.getElementById('articleContent').value.trim();

    if (!title) {
        alert('Пожалуйста, введите заголовок статьи');
        document.getElementById('articleTitle').focus();
        return;
    }
    if (!content) {
        alert('Пожалуйста, введите содержание статьи');
        document.getElementById('articleContent').focus();
        return;
    }

    try {
        if (currentEditingArticleId) {
            const articleData = {
                title: title,
                content: content,
                image: currentImage,
                date: new Date().toISOString()
            };

            await updateArticleOnServer(currentEditingArticleId, articleData);
            console.log('Статья обновлена');
        } else {
            const newArticle = {
                id: generateId(),
                title: title,
                content: content,
                image: currentImage,
                date: new Date().toISOString()
            };

            await saveArticleToServer(newArticle);
            console.log('Статья создана');
        }

        await loadArticlesFromServer();
        hideEditor();
        goToHome();
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось сохранить статью. Проверьте подключение к серверу.');
    }
}

// Сохранение статьи на сервер
async function saveArticleToServer(article) {
    const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(article)
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
}

// Обновление статьи на сервере
async function updateArticleOnServer(articleId, articleData) {
    const response = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
}

// Удаление статьи с сервера
async function deleteArticleFromServer(articleId) {
    const response = await fetch(`${API_URL}/articles/${articleId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
}

// Генерация ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Просмотр статьи
function viewArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) {
        alert('Статья не найдена!');
        return;
    }
    
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.remove('hidden');

    const container = document.getElementById('articleContentContainer');
    
    let articleHTML = `
        <div class="article-meta">
            <p>Опубликовано: ${formatDate(article.date)}</p>
        </div>
        <h1>${article.title}</h1>
        ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ''}
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

// Скрыть просмотр статьи
function hideArticleView() {
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
}

// Удаление статьи
async function deleteArticle(articleId) {
    if (confirm('Вы уверены, что хотите удалить эту статью?')) {
        try {
            await deleteArticleFromServer(articleId);
            await loadArticlesFromServer();
            hideArticleView();
        } catch (error) {
            alert('Не удалось удалить статью. Проверьте подключение к серверу.');
        }
    }
}

// Функции для темы
function loadTheme() {
    const savedTheme = localStorage.getItem('blog_theme');
    if (savedTheme) {
        currentTheme = savedTheme;
    }
    applyTheme();
    updateThemeButton();
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('blog_theme', currentTheme);
    updateThemeButton();
}

function updateThemeButton() {
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        themeButton.textContent = currentTheme === 'light' ? 'Темная тема' : 'Светлая тема';
    }
}

// Показать ошибку
function showError(message) {
    const container = document.getElementById('articlesContainer');
    if (container) {
        container.innerHTML = `
            <div class="no-articles">
                <h3>Ошибка загрузки</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="loadArticlesFromServer()">
                    Повторить попытку
                </button>
            </div>
        `;
    }
}
// Добавь в самый конец script.js - после всех функций

// Инициализация обработчиков событий после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Обработчики для кнопок входа
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', enterAsGuest);
    }
    
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', checkPassword);
    }
    
    // Остальная инициализация...
    console.log('Инициализация приложения...');
    loadTheme();
    loadArticlesFromServer();
    showModeSelection();
    
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
});
