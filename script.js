// Пароль администратора
const ADMIN_PASSWORD = '1234';

// URL JSON Server
const API_URL = 'https://sdiapacwfpaotinfgad-github-io.onrender.com';

// Глобальные переменные
let articles = [];
let currentImage = null;
let currentMode = null; // 'admin' или 'guest'

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    // Принудительно показываем выбор режима при каждом входе
    showModeSelection();
    
    // Обработчик загрузки изображения
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
});

// Показать выбор режима
function showModeSelection() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('articlesList').classList.add('hidden');
}

// Вход как администратор (показать поле пароля)
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

// Проверка пароля администратора
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const errorMessage = document.getElementById('errorMessage');
    const password = passwordInput.value.trim();

    if (password === ADMIN_PASSWORD) {
        // Успешная аутентификация
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
    
    // ПОКАЗЫВАЕМ статьи и рендерим их!
    document.getElementById('articlesList').classList.remove('hidden');
    
    // Показать уведомление о режиме админа
    showAdminNotice();
    renderArticles();
}

// Показать функции гостя
function showGuestFeatures() {
    document.getElementById('homeBtn').classList.remove('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('userStatus').classList.remove('hidden');
    document.getElementById('userStatus').textContent = 'Гость';
    document.getElementById('userStatus').className = 'user-status guest';
    
    // ПОКАЗЫВАЕМ статьи и рендерим их!
    document.getElementById('articlesList').classList.remove('hidden');
    
    // Показать уведомление о гостевом режиме
    showGuestNotice();
    renderArticles();
}

// Показать уведомление для гостя
function showGuestNotice() {
    const articlesContainer = document.getElementById('articlesContainer');
    // Удаляем старое уведомление если есть
    const oldNotice = document.querySelector('.guest-notice');
    if (oldNotice) oldNotice.remove();
    
    if (articlesContainer && articles.length > 0) {
        const notice = document.createElement('div');
        notice.className = 'guest-notice';
        notice.innerHTML = `
            <strong>👋 Вы вошли как гость</strong>
            <p>Вы можете читать статьи, но для создания и удаления нужны права администратора</p>
        `;
        articlesContainer.parentNode.insertBefore(notice, articlesContainer);
    }
}

// Показать уведомление для администратора
function showAdminNotice() {
    const articlesContainer = document.getElementById('articlesContainer');
    // Удаляем старое уведомление если есть
    const oldNotice = document.querySelector('.guest-notice');
    if (oldNotice) oldNotice.remove();
    
    if (articlesContainer && articles.length > 0) {
        const notice = document.createElement('div');
        notice.className = 'guest-notice';
        notice.style.background = '#d4edda';
        notice.style.borderColor = '#c3e6cb';
        notice.style.color = '#155724';
        notice.innerHTML = `
            <strong>👑 Вы вошли как администратор</strong>
            <p>У вас есть полный доступ к созданию и удалению статей</p>
        `;
        articlesContainer.parentNode.insertBefore(notice, articlesContainer);
    }
}

// Переход на главную страницу
function goToHome() {
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    document.getElementById('articlesList').classList.remove('hidden');
    renderArticles();
}

// Выход из системы
function logout() {
    // Полностью сбрасываем состояние
    currentMode = null;
    document.getElementById('homeBtn').classList.add('hidden');
    document.getElementById('newArticleBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('userStatus').classList.add('hidden');
    document.getElementById('articlesList').classList.add('hidden');
    document.getElementById('articleEditor').classList.add('hidden');
    document.getElementById('articleView').classList.add('hidden');
    
    // Показываем выбор режима заново
    showModeSelection();
}

// Загрузка статей из localStorage
function loadArticles() {
    const savedArticles = localStorage.getItem('blog_articles');
    articles = savedArticles ? JSON.parse(savedArticles) : [];
    console.log('Загружено статей:', articles.length);
}

// Сохранение статей в localStorage
function saveArticles() {
    localStorage.setItem('blog_articles', JSON.stringify(articles));
    console.log('Сохранено статей:', articles.length);
}

// Отображение списка статей
function renderArticles() {
    const container = document.getElementById('articlesContainer');
    console.log('Рендерим статьи. Режим:', currentMode, 'Количество:', articles.length);
    
    if (!container) {
        console.error('Контейнер статей не найден!');
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
                <p class="article-card-date">📅 ${formatDate(article.date)}</p>
                <div class="article-card-actions">
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); viewArticle('${article.id}')">
                        👁️ Читать
                    </button>
                    ${currentMode === 'admin' ? `
                        <button class="btn btn-danger" onclick="event.stopPropagation(); deleteArticle('${article.id}')">
                            🗑️ Удалить
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Получение превью текста
function getPreview(text, maxLength = 150) {
    if (!text) return 'Нет содержания';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
    
    // Фокус на заголовок
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
function saveArticle() {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен! Требуются права администратора.');
        return;
    }

    const title = document.getElementById('articleTitle').value.trim();
    const content = document.getElementById('articleContent').value.trim();

    // Валидация
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

    // Создаем новую статью
    const newArticle = {
        id: generateId(),
        title: title,
        content: content,
        image: currentImage,
        date: new Date().toISOString()
    };

    articles.push(newArticle);
    saveArticles();
    renderArticles();
    hideEditor();
    goToHome();
    
    alert('✅ Статья успешно опубликована!');
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
            ${currentMode === 'guest' ? '<span class="read-only-badge">👤 Режим чтения</span>' : ''}
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
        ` : currentMode === 'guest' ? `
            <div class="article-actions-guest">
                <p style="color: #7f8c8d; font-style: italic;">
                    🔒 Для редактирования и удаления статей войдите как администратор
                </p>
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
function deleteArticle(articleId) {
    if (currentMode !== 'admin') {
        alert('❌ Доступ запрещен! Требуются права администратора.');
        return;
    }

    if (confirm('Вы уверены, что хотите удалить эту статью?')) {
        articles = articles.filter(a => a.id !== articleId);
        saveArticles();
        renderArticles();
        hideArticleView();
        alert('✅ Статья успешно удалена!');
    }
}