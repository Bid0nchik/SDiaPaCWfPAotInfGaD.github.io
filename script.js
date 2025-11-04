// Пароль администратора
const ADMIN_PASSWORD = '6-XNRgA6b6nFP4!)k%UDgpnqF*$~xi';

// URL JSON Server
const API_URL = 'https://sdiapacwfpaotinfgad.onrender.com';

// Глобальные переменные
let articles = [];
let currentImage = null;
let currentMode = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    showModeSelection();
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
});

// Загрузка статей с сервера
async function loadArticles() {
    try {
        console.log('Загружаем статьи с сервера...');
        const response = await fetch(`${API_URL}/articles`);
        
        if (!response.ok) {
            throw new Error('Сервер не отвечает');
        }
        
        articles = await response.json();
        console.log('Статьи загружены:', articles.length);
        renderArticles();
    } catch (error) {
        console.error('Ошибка загрузки статей:', error);
        alert('❌ Не удалось загрузить статьи. Проверьте, запущен ли сервер на localhost:3001');
        articles = [];
        renderArticles();
    }
}

// Сохранение статьи на сервер
async function saveArticleToServer(article) {
    try {
        const response = await fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сохранения');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка сохранения статьи:', error);
        throw error;
    }
}

// Удаление статьи с сервера
async function deleteArticleFromServer(articleId) {
    try {
        const response = await fetch(`${API_URL}/articles/${articleId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Ошибка удаления');
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка удаления статьи:', error);
        throw error;
    }
}

// Обновление счетчика просмотров
async function updateArticleViews(articleId, views) {
    try {
        await fetch(`${API_URL}/articles/${articleId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ views: views })
        });
    } catch (error) {
        console.error('Ошибка обновления просмотров:', error);
    }
}

// Показать выбор режима
function showModeSelection() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('articlesList').classList.add('hidden');
}

// Вход как администратор
function enterAsAdmin() {
    document.getElementById('adminAuth').classList.remove('hidden');
    document.getElementById('passwordInput').focus();
}

// Вход как гость
function enterAsGuest() {
    currentMode = 'guest';
    hideAuthModal();
    showGuestFeatures();
}

// Проверка пароля
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
        errorMessage.textContent = '❌ Неверный пароль!';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function hideAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

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

function showGuestFeatures() {
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Гость';
    document.getElementById('userStatus').className = 'user-status guest';
    document.getElementById('articlesList').classList.remove('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    showGuestNotice();
}

function showGuestNotice() {
    const articlesContainer = document.getElementById('articlesContainer');
    const oldNotice = document.querySelector('.guest-notice');
    if (oldNotice) oldNotice.remove();
    
    if (articlesContainer && articles.length > 0) {
        const notice = document.createElement('div');
        notice.className = 'guest-notice';
        notice.innerHTML = `
            <strong>Вы вошли как гость</strong>
            <p>Вы можете читать статьи, но для создания и удаления нужны права администратора</p>
        `;
        articlesContainer.parentNode.insertBefore(notice, articlesContainer);
    }
}

function showAdminNotice() {
    const articlesContainer = document.getElementById('articlesContainer');
    const oldNotice = document.querySelector('.guest-notice');
    if (oldNotice) oldNotice.remove();
    
    if (articlesContainer && articles.length > 0) {
        const notice = document.createElement('div');
        notice.className = 'guest-notice';
        notice.style.background = '#d4edda';
        notice.style.borderColor = '#c3e6cb';
        notice.style.color = '#155724';
        notice.innerHTML = `
            <strong>Вы вошли как администратор</strong>
            <p>У вас есть полный доступ к созданию и удалению статей</p>
        `;
        articlesContainer.parentNode.insertBefore(notice, articlesContainer);
    }
}

function goToHome() {
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
}

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

// Отображение статей
function renderArticles() {
    const container = document.getElementById('articlesContainer');
    
    if (!container) return;
    
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="no-articles">
                <h3>Статей пока нет</h3>
                <p>${currentMode === 'admin' ? 'Нажмите "Новая статья" чтобы создать первую!' : 'Войдите как администратор чтобы создать статью!'}</p>
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
                <div class="article-card-meta">
                    <p class="article-card-date">${formatDate(article.date)}</p>
                    <p class="article-card-views">👁️ ${article.views || 0} просмотров</p>
                </div>
                <div class="article-card-actions">
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); viewArticle('${article.id}')">
                        Читать
                    </button>
                    ${currentMode === 'admin' ? `
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteArticle('${article.id}')">
                            Удалить
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function getPreview(text, maxLength = 150) {
    if (!text) return 'Нет содержания';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
}

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

function removeImage() {
    const preview = document.getElementById('imagePreview');
    const fileInput = document.getElementById('articleImage');
    const removeBtn = document.getElementById('removeImageBtn');
    
    preview.innerHTML = '';
    fileInput.value = '';
    removeBtn.classList.add('hidden');
    currentImage = null;
}

function showEditor() {
    if (currentMode !== 'admin') {
        alert('Доступ запрещен!');
        return;
    }
    
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articleEditor').classList.remove('hidden');
    
    document.getElementById('articleTitle').value = '';
    document.getElementById('articleContent').value = '';
    document.getElementById('articleImage').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('removeImageBtn').classList.add('hidden');
    currentImage = null;
    
    document.getElementById('articleTitle').focus();
}

function cancelEditing() {
    if (confirm('Отменить создание статьи?')) {
        hideEditor();
        goToHome();
    }
}

function hideEditor() {
    document.getElementById('articleEditor').classList.add('hidden');
}

// Сохранение статьи
async function saveArticle() {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен!');
        return;
    }

    const title = document.getElementById('articleTitle').value.trim();
    const content = document.getElementById('articleContent').value.trim();

    if (!title) {
        alert('Введите заголовок статьи');
        return;
    }
    if (!content) {
        alert('Введите содержание статьи');
        return;
    }

    const newArticle = {
        id: generateId(),
        title: title,
        content: content,
        image: currentImage,
        date: new Date().toISOString(),
        views: 0
    };

    try {
        // Сохраняем на сервер
        const savedArticle = await saveArticleToServer(newArticle);
        articles.push(savedArticle);
        
        // Перезагружаем список статей
        await loadArticles();
        
        hideEditor();
        goToHome();
        alert('✅ Статья опубликована!');
    } catch (error) {
        alert('❌ Ошибка публикации статьи!');
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Просмотр статьи
async function viewArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // Увеличиваем счетчик просмотров
    const updatedViews = (article.views || 0) + 1;
    
    try {
        await updateArticleViews(articleId, updatedViews);
        article.views = updatedViews;
    } catch (error) {
        console.error('Ошибка обновления просмотров');
    }

    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.remove('hidden');

    const container = document.getElementById('articleContentContainer');
    container.innerHTML = `
        <div class="article-meta">
            <p>📅 Опубликовано: ${formatDate(article.date)}</p>
            <p>👁️ Просмотров: ${updatedViews}</p>
            ${currentMode === 'guest' ? '<span class="read-only-badge">👤 Режим чтения</span>' : ''}
        </div>
        <h1>${article.title}</h1>
        ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-image">` : ''}
        <div class="article-text">${article.content.replace(/\n/g, '<br>')}</div>
        ${currentMode === 'admin' ? `
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-danger" onclick="deleteArticle('${article.id}')">
                    Удалить статью
                </button>
            </div>
        ` : ''}
    `;
}

function hideArticleView() {
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
}

// Удаление статьи
async function deleteArticle(articleId) {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен!');
        return;
    }

    if (confirm('Удалить статью?')) {
        try {
            await deleteArticleFromServer(articleId);
            articles = articles.filter(a => a.id !== articleId);
            await loadArticles();
            hideArticleView();
            alert('✅ Статья удалена!');
        } catch (error) {
            alert('❌ Ошибка удаления статьи!');
        }
    }

}
