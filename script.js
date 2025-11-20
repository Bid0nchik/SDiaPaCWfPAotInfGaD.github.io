// Конфигурация приложения
const CONFIG = {
    API_URL: 'https://sdiapacwfpaotinfgad-github-io-1.onrender.com'
};

let articles = [];
let currentImage = null;
let currentMode = null;
let currentEditingArticleId = null;
let currentTheme = 'dark';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация приложения...');
    loadTheme();
    loadArticlesFromServer();
    showModeSelection();
    
    // Обработчики событий
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
    document.getElementById('adminLoginBtn').addEventListener('click', checkPassword);
    document.getElementById('guestLoginBtn').addEventListener('click', enterAsGuest);
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkPassword();
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

// Функция проверки пароля
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');
    const password = passwordInput.value.trim();
    
    if (!password) {
        errorMessage.textContent = 'Введите пароль';
        return;
    }
    
    if (password === CONFIG.ADMIN_PASSWORD) {
        currentMode = 'admin';
        hideAuthModal();
        showAdminFeatures();
        errorMessage.textContent = '';
        passwordInput.value = '';
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

// Показать выбор режима
function showModeSelection() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
}

// Загрузка статей с сервера
async function loadArticlesFromServer() {
    try {
        console.log('Загружаем статьи с сервера...');
        showLoading(true);
        
        const response = await fetch(`${CONFIG.API_URL}/articles`);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        articles = await response.json();
        console.log('Статьи загружены:', articles.length);
        renderArticles();
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showError('Не удалось загрузить статьи. Проверьте подключение к серверу.');
    } finally {
        showLoading(false);
    }
}

// Показать/скрыть загрузку
function showLoading(show) {
    const container = document.getElementById('articlesContainer');
    if (show) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Загрузка статей...</p>
            </div>
        `;
    }
}

// Сохранение статьи на сервер
async function saveArticleToServer(article) {
    const response = await fetch(`${CONFIG.API_URL}/articles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(article)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }

    return await response.json();
}

// Обновление статьи на сервере
async function updateArticleOnServer(articleId, articleData) {
    const response = await fetch(`${CONFIG.API_URL}/articles/${articleId}`, {
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

// Удаление статьи с сервера
async function deleteArticleFromServer(articleId) {
    const response = await fetch(`${CONFIG.API_URL}/articles/${articleId}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка HTTP: ${response.status}`);
    }
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
    currentEditingArticleId = null;
    currentImage = null;
    
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
                <img src="${article.image}" alt="${article.title}" class="article-card-image" loading="lazy">
            ` : `
                <div class="article-card-placeholder">📝</div>
            `}
            <div class="article-card-content">
                <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
                <p class="article-card-preview">${getPreview(article.content)}</p>
                <p class="article-card-date">${formatDate(article.date)}</p>
            </div>
        </div>
    `).join('');
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
    const cleanText = text.replace(/<br>/g, ' ').replace(/<[^>]*>/g, '');
    const escapedText = escapeHtml(cleanText);
    if (escapedText.length <= maxLength) return escapedText;
    return escapedText.substring(0, maxLength) + '...';
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
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите файл изображения');
            event.target.value = '';
            return;
        }
        
        // Проверка размера файла (макс 5MB)
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
    document.getElementById('saveButton').disabled = false;
    
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
    document.getElementById('saveButton').disabled = false;

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
    const titleInput = document.getElementById('articleTitle');
    const contentInput = document.getElementById('articleContent');
    const saveButton = document.getElementById('saveButton');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title) {
        alert('Пожалуйста, введите заголовок статьи');
        titleInput.focus();
        return;
    }
    if (!content) {
        alert('Пожалуйста, введите содержание статьи');
        contentInput.focus();
        return;
    }

    // Блокируем кнопку на время сохранения
    saveButton.disabled = true;
    saveButton.textContent = 'Сохранение...';

    try {
        let savedArticle;
        
        if (currentEditingArticleId) {
            const articleData = {
                title: title,
                content: content,
                image: currentImage,
                date: new Date().toISOString()
            };

            savedArticle = await updateArticleOnServer(currentEditingArticleId, articleData);
            console.log('Статья обновлена:', savedArticle.id);
        } else {
            const newArticle = {
                title: title,
                content: content,
                image: currentImage,
                date: new Date().toISOString()
            };

            savedArticle = await saveArticleToServer(newArticle);
            console.log('Статья создана:', savedArticle.id);
        }

        await loadArticlesFromServer();
        hideEditor();
        goToHome();
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert(`Не удалось сохранить статью: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = currentEditingArticleId ? 'Сохранить изменения' : 'Опубликовать';
    }
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
        <h1>${escapeHtml(article.title)}</h1>
        ${article.image ? `<img src="${article.image}" alt="${escapeHtml(article.title)}" class="article-image" loading="lazy">` : ''}
        <div class="article-text">${article.content.replace(/\n/g, '<br>')}</div>
    `;
    
    if (currentMode === 'admin') {
        articleHTML += `
            <div class="article-admin-actions">
                <button class="btn btn-primary" onclick="editArticle('${article.id}')">
                    ✏️ Редактировать статью
                </button>
                <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                    🗑️ Удалить статью
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
    if (!confirm('Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить.')) {
        return;
    }

    try {
        await deleteArticleFromServer(articleId);
        await loadArticlesFromServer();
        hideArticleView();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert(`Не удалось удалить статью: ${error.message}`);
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
        themeButton.textContent = currentTheme === 'light' ? '🌙 Темная тема' : '☀️ Светлая тема';
        themeButton.title = currentTheme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему';
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
                    🔄 Повторить попытку
                </button>
            </div>
        `;
    }
}



