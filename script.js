// Пароль администратора
const ADMIN_PASSWORD = '6-XNRgA6b6nFP4!)k%UDgpnqF*$~xi';

// URL JSON Server - ЗАМЕНИТЕ на ваш URL с Render
const API_URL = 'https://sdiapacwfpaotinfgad-github-io-1.onrender.com';

// Глобальные переменные
let articles = [];
let currentImage = null;
let currentMode = null; // 'admin' или 'guest'

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadArticlesFromServer();
    showModeSelection();
    
    // Обработчик загрузки изображения
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
});

// Показать выбор режима
function showModeSelection() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('articlesList').classList.add('hidden');
}

// Проверка пароля администратора
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
        errorMessage.textContent = '❌ Неверный пароль! Попробуйте снова.';
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
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('newArticleBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Администратор';
    document.getElementById('userStatus').className = 'user-status admin';
    
    document.getElementById('articlesList').classList.remove('hidden');
    showAdminNotice();
}

// Показать функции гостя
function showGuestFeatures() {
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Гость';
    document.getElementById('userStatus').className = 'user-status guest';
    
    document.getElementById('articlesList').classList.remove('hidden');
    showGuestNotice();
}

// Показать уведомление для гостя
function showGuestNotice() {
    const articlesContainer = document.getElementById('articlesContainer');
    const oldNotice = document.querySelector('.guest-notice');
    if (oldNotice) oldNotice.remove();
    
    if (articlesContainer) {
        const notice = document.createElement('div');
        notice.className = 'guest-notice';
        notice.innerHTML = `
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 12px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
                👋 Вы вошли как гость. Для создания статей войдите как администратор.
            </div>
        `;
        articlesContainer.parentNode.insertBefore(notice, articlesContainer);
    }
}

// Показать уведомление для администратора
function showAdminNotice() {
    const articlesContainer = document.getElementById('articlesContainer');
    const oldNotice = document.querySelector('.guest-notice');
    if (oldNotice) oldNotice.remove();
    
    if (articlesContainer) {
        const notice = document.createElement('div');
        notice.className = 'guest-notice';
        notice.innerHTML = `
            <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 12px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
                ⚡ Вы вошли как администратор. Теперь вы можете создавать и удалять статьи.
            </div>
        `;
        articlesContainer.parentNode.insertBefore(notice, articlesContainer);
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
    document.getElementById('homeBtn').classList.add('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('userStatus').classList.add('hidden');
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    
    showModeSelection();
}

// Загрузка статей с сервера
async function loadArticlesFromServer() {
    try {
        console.log('🔄 Загружаем статьи с сервера...');
        const response = await fetch(`${API_URL}/articles`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        articles = await response.json();
        console.log('✅ Статьи загружены:', articles.length);
        renderArticles();
    } catch (error) {
        console.error('❌ Ошибка загрузки статей с сервера:', error);
        // Если сервер недоступен, пробуем загрузить из localStorage
        loadArticlesFromLocalStorage();
    }
}

// Фолбэк: загрузка из localStorage
function loadArticlesFromLocalStorage() {
    const savedArticles = localStorage.getItem('blog_articles');
    articles = savedArticles ? JSON.parse(savedArticles) : [];
    console.log('📁 Загружено из localStorage:', articles.length);
    renderArticles();
}

// Сохранение статьи на сервер
async function saveArticleToServer(article) {
    try {
        const response = await fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(article)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedArticle = await response.json();
        console.log('✅ Статья сохранена на сервере:', savedArticle.id);
        return savedArticle;
    } catch (error) {
        console.error('❌ Ошибка сохранения на сервер:', error);
        // Если сервер недоступен, сохраняем в localStorage
        saveArticleToLocalStorage(article);
        throw error;
    }
}

// Фолбэк: сохранение в localStorage
function saveArticleToLocalStorage(article) {
    articles.push(article);
    localStorage.setItem('blog_articles', JSON.stringify(articles));
    console.log('📁 Статья сохранена в localStorage');
}

// Удаление статьи с сервера
async function deleteArticleFromServer(articleId) {
    try {
        const response = await fetch(`${API_URL}/articles/${articleId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ Статья удалена с сервера:', articleId);
    } catch (error) {
        console.error('❌ Ошибка удаления с сервера:', error);
        throw error;
    }
}

// Отображение списка статей
function renderArticles() {
    const container = document.getElementById('articlesContainer');
    
    if (!container) {
        console.error('❌ Контейнер статей не найден!');
        return;
    }
    
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="no-articles">
                <h3>📝 Статей пока нет</h3>
                <p>${currentMode === 'admin' ? 'Нажмите "Новая статья" чтобы создать первую!' : 'Войдите как администратор чтобы создать статью!'}</p>
            </div>
        `;
        return;
    }

    // Сортируем статьи по дате (новые сначала)
    const sortedArticles = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedArticles.map(article => `
        <div class="article-card" onclick="viewArticle('${article.id}')">
            ${article.image ? `
                <img src="${article.image}" alt="${article.title}" class="article-card-image">
            ` : `
                <div class="article-card-placeholder">📄 Статья</div>
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

// Показать редактор
function showEditor() {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен! Требуются права администратора.');
        return;
    }
    
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articleEditor').classList.remove('hidden');
    
    // Очистка формы
    document.getElementById('articleTitle').value = '';
    document.getElementById('articleContent').value = '';
    document.getElementById('articleImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('removeImageBtn').classList.add('hidden');
    currentImage = null;
    
    document.getElementById('articleTitle').focus();
}

// Отмена редактирования
function cancelEditing() {
    if (confirm('Вы уверены, что хотите отменить создание статьи? Все несохраненные данные будут потеряны.')) {
        hideEditor();
        goToHome();
    }
}

// Скрыть редактор
function hideEditor() {
    document.getElementById('articleEditor').classList.add('hidden');
}

// Сохранение статьи
async function saveArticle() {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен! Требуются права администратора.');
        return;
    }

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

    const newArticle = {
        id: generateId(),
        title: title,
        content: content,
        image: currentImage,
        date: new Date().toISOString()
    };

    try {
        await saveArticleToServer(newArticle);
        // Обновляем локальный массив статей
        articles.push(newArticle);
        renderArticles();
        hideEditor();
        goToHome();
        alert('✅ Статья успешно опубликована!');
    } catch (error) {
        alert('❌ Ошибка при сохранении статьи. Данные сохранены локально.');
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
    container.innerHTML = `
        <div class="article-meta">
            <p>📅 Опубликовано: ${formatDate(article.date)}</p>
        </div>
        <h1>${article.title}</h1>
        ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ''}
        <div class="article-text">${article.content.replace(/\n/g, '<br>')}</div>
        ${currentMode === 'admin' ? `
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                    🗑️ Удалить статью
                </button>
            </div>
        ` : ''}
    `;
}

// Скрыть просмотр статьи
function hideArticleView() {
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
}

// Удаление статьи
async function deleteArticle(articleId) {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен! Требуются права администратора.');
        return;
    }

    if (confirm('Вы уверены, что хотите удалить эту статью?')) {
        try {
            await deleteArticleFromServer(articleId);
            // Обновляем локальный массив
            articles = articles.filter(a => a.id !== articleId);
            // Также удаляем из localStorage для синхронизации
            localStorage.setItem('blog_articles', JSON.stringify(articles));
            renderArticles();
            hideArticleView();
            alert('✅ Статья удалена!');
        } catch (error) {
            // Если сервер недоступен, удаляем только локально
            articles = articles.filter(a => a.id !== articleId);
            localStorage.setItem('blog_articles', JSON.stringify(articles));
            renderArticles();
            hideArticleView();
            alert('✅ Статья удалена (локально)!');
        }
    }
}
