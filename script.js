// Конфигурация приложения
const CONFIG = {
    API_URL: 'https://sdiapacwfpaotinfgad-github-io-1.onrender.com'
};

let articles = [];
let currentImage = null;
let currentMode = null;
let currentEditingArticleId = null;
let currentTheme = 'dark';
let filteredArticles = []; 

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    showModeSelection();
    
    // Обработчики событий
    document.getElementById('articleImage').addEventListener('change', handleImageUpload);
    document.getElementById('adminLoginBtn').addEventListener('click', checkPassword);
    document.getElementById('guestLoginBtn').addEventListener('click', enterAsGuest);
    document.getElementById('passwordInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') checkPassword(); // если событие нажатия клавиши e происходит и оно enter то...
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


// ФУНКЦИЯ ПРОВЕРКИ ПАРОЛЯ ЧЕРЕЗ СЕРВЕР
async function checkPassword() {
    const password = document.getElementById('passwordInput').value.trim();
    const errorMessage = document.getElementById('errorMessage');
    if (!password) {
        errorMessage.textContent = 'Введите пароль';
        return;
    }else{//тут убрать else
        currentMode = 'admin';
            showAllFunctions();
            hideWindowАuthorization();
            showAdminFunctions();
            errorMessage.textContent = '';
            passwordInput.value = '';
    }
    /* Обработка ошибок с сервером
    try {
        const response = await fetch(`${CONFIG.API_URL}/auth/check-password`, { // Спрашиваем сервер t/f
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: password })
        });
        
        const data = await response.json(); // записываем ответ сервера в data преобразовывая из json
        
        if (data.success) {
            currentMode = 'admin';
            showAllFunctions();
            hideWindowАuthorization();
            showAdminFunctions();
            errorMessage.textContent = '';
            passwordInput.value = '';
        } else {
            errorMessage.textContent = data.error || 'Неверный пароль! Попробуйте снова.';
            passwordInput.focus();
        }
    } catch (error) {
        errorMessage.textContent = 'Ошибка соединения с сервером, попробуйте позже';
        passwordInput.focus();
    }*/
}
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
    showModeSelection();
}

// Загрузка статей с сервера
async function loadArticlesFromServer(select1 = null) {
    try {
        showLoading(true); // ON/OFF значка загрузки и текста загрузки

        let url = `${CONFIG.API_URL}/articles`;
        if (select1) {
            url += `?select=${select1}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status} - ${response.statusText}`); // Создание и выброс ошибки с инфой об http статусе
        }
        articles = await response.json(); // записываем массив статей в массив парся json
       if (section) {
            filteredArticles = articles.filter(article => article.select === select1);
        } else {
            filteredArticles = [...articles];
        }
        renderArticles();  
    } catch (error) {
        showError('Не удалось загрузить статьи. Проверьте подключение к серверу.');
    } finally {
        showLoading(false);
    }
}

// Отображение списка статей
function renderArticles() {
    const container = document.getElementById('arcticlesProg');
    if (articles.length === 0) {
        container.innerHTML = `
            <div class="no-articles">
                <h4>Статей пока нет</h3>
            </div>`;
        return;
    }


    const sortedArticles = [...articles].sort((a, b) => 
        new Date(b.date) - new Date(a.date)); // сортировка статей от новых к старым
    container.innerHTML = `
        <div class="section-articles">
            ${sortedArticles.map(article => `
                <div class="article-card" onclick="viewArticle('${article.id}')">
                    ${article.image ? `
                        <img src="${article.image}" alt="${article.title}" 
                             class="article-card-image" loading="lazy">
                    ` : `
                        <div class="article-card-placeholder">
                            ${getSectionIcon(article.select)}
                        </div>`}
                    <div class="article-card-content">
                        <div class="article-section-badge">
                            ${getSectionName(article.select)}
                        </div>
                        <h3 class="article-card-title">${escapeHtml(article.title)}</h3>
                        <p class="article-card-preview">${getPreview(article.content)}</p>
                        <p class="article-card-date">${formatDate(article.date)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
         // добавляем в контейнер сортированный массив и определяем содержание каждого элемента массива (статьи)
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
    const select = document.getElementById('form-select').value.trim();
    const content = document.getElementById('articleContent').value.trim();
    const saveButton = document.getElementById('saveButton');
    if (select == "empty"){
        alert('Пожалуйста, выберите раздел');
        contentInput.focus();
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
        let savedArticle;
        if (currentEditingArticleId){
            const articleData = {
                select: select,
                title: title,
                content: content,
                image: currentImage,
                date: new Date().toISOString()
            };
            savedArticle = await updateArticleOnServer(currentEditingArticleId, articleData);
        } else {
            const newArticle = {
                select: select,
                title: title,
                content: content,
                image: currentImage,
                date: new Date().toISOString()
            };
            savedArticle = await saveArticleToServer(newArticle);
        }
        await loadArticlesFromServer(select);
        hideEditor();
        goToHome();
    } catch (error) {
        alert(`Не удалось сохранить статью: ${error.message}`);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = currentEditingArticleId ? 'Сохранить изменения' : 'Опубликовать';
    }
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
    document.getElementById('hero-image').classList.add('hidden');

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
}

// Отмена редактирования
function cancelEditing() {
    const message = currentEditingArticleId ? // если он есть(он появляется ток когда редактируем) то пишем 1 сооб иначе 2
        'Вы уверены, что хотите отменить редактирование? Все несохраненные изменения будут потеряны.' :
        'Вы уверены, что хотите отменить создание статьи? Все несохраненные данные будут потеряны.';
    
    if (confirm(message)) { // confirm это чтоб был выбор в отличии от alert
        document.getElementById('articleEditor').classList.add('hidden');
        currentEditingArticleId = null;
        goToHome();
    }
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
    document.getElementById('arcticlesProg').classList.remove('hidden')
    document.getElementById('arcticlesOSINT').classList.add('hidden')
    document.getElementById('arcticlesTrol').classList.add('hidden')

    loadArticlesFromServer(Prog);
}
function LoadSectionOsint(){
    RemoveSelections();
    document.getElementById('arcticlesProg').classList.add('hidden')
    document.getElementById('arcticlesOSINT').classList.remove('hidden')
    document.getElementById('arcticlesTrol').classList.add('hidden')

    loadArticlesFromServer(OSINt);
}
function LoadSectionTroll(){
    RemoveSelections();
    document.getElementById('arcticlesProg').classList.add('hidden')
    document.getElementById('arcticlesOSINT').classList.add('hidden')
    document.getElementById('arcticlesTrol').classList.remove('hidden')

    loadArticlesFromServer(Trol);
}

function RemoveSelections(){
    document.getElementById("hero-image").classList.add('hidden');
    document.getElementById("selectionMenu").classList.add('hidden');
    document.getElementById("articlesContainer").classList.remove('hidden');
}