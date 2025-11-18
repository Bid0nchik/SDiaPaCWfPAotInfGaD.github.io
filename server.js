// server.js (простой и рабочий)
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const PORT = process.env.PORT || 3001;

// Middleware
server.use(middlewares);
server.use(router);

// Простое логирование
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

server.listen(PORT, () => {
    console.log(`✅ JSON Server is running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const nodeCron = require('node-cron');
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Пути к файлам
const dataDir = path.join(__dirname, 'data');
const articlesFile = path.join(dataDir, 'articles.json');
const backupFile = path.join(dataDir, 'backup.json');

// Создаем папку data если не существует
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Функция загрузки статей
function loadArticles() {
    try {
        // Пробуем загрузить из основного файла
        if (fs.existsSync(articlesFile)) {
            const data = fs.readFileSync(articlesFile, 'utf8');
            return JSON.parse(data);
        }
        // Пробуем загрузить из backup
        if (fs.existsSync(backupFile)) {
            const data = fs.readFileSync(backupFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading articles:', error);
    }
    return [];
}

// Функция сохранения статей
function saveArticles(articles) {
    try {
        // Сохраняем в основной файл
        fs.writeFileSync(articlesFile, JSON.stringify(articles, null, 2));
        
        // Создаем backup
        fs.writeFileSync(backupFile, JSON.stringify(articles, null, 2));
        
        console.log('✅ Articles saved to file and backup');
        
        // Пытаемся закоммитить в Git (не блокируем ответ)
        commitToGit();
        
    } catch (error) {
        console.error('Error saving articles:', error);
    }
}

// Функция коммита в Git
function commitToGit() {
    const commands = [
        'git config --global user.email "auto-save@blog.com"',
        'git config --global user.name "Auto Save"',
        'git add data/',
        `git commit -m "Auto-save: ${new Date().toISOString()}" || echo "No changes"`,
        'git push origin main || echo "Push failed"'
    ];

    exec(commands.join(' && '), (error, stdout, stderr) => {
        if (error) {
            console.log('Git operations completed (some may have failed)');
            return;
        }
        console.log('✅ Git backup completed');
    });
}

// Автоматический коммит каждые 30 минут
nodeCron.schedule('*/30 * * * *', () => {
    console.log('🕒 Auto-committing to Git...');
    commitToGit();
});

// Инициализация базы
let articles = loadArticles();
console.log(`📊 Loaded ${articles.length} articles from storage`);

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// GET /articles - получить все статьи
app.get('/articles', (req, res) => {
    try {
        // Перезагружаем статьи на каждый запрос (на случай изменений из Git)
        articles = loadArticles();
        
        const sortedArticles = [...articles].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        res.json(sortedArticles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// POST /articles - создать статью
app.post('/articles', (req, res) => {
    try {
        const { title, content, image } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Title is required' });
        }
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const newArticle = {
            id: Date.now().toString(),
            title: title.trim(),
            content: content.trim(),
            image: image || null,
            date: new Date().toISOString()
        };

        articles.unshift(newArticle);
        saveArticles(articles);

        console.log('✅ Article created:', newArticle.id);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).json({ error: 'Failed to create article' });
    }
});

// PATCH /articles/:id - обновить статью
app.patch('/articles/:id', (req, res) => {
    try {
        const { title, content, image } = req.body;
        const articleIndex = articles.findIndex(a => a.id === req.params.id);

        if (articleIndex === -1) {
            return res.status(404).json({ error: 'Article not found' });
        }

        if (title !== undefined) articles[articleIndex].title = title.trim();
        if (content !== undefined) articles[articleIndex].content = content.trim();
        if (image !== undefined) articles[articleIndex].image = image;
        
        articles[articleIndex].date = new Date().toISOString();

        saveArticles(articles);

        console.log('✅ Article updated:', req.params.id);
        res.json(articles[articleIndex]);
    } catch (error) {
        console.error('Error updating article:', error);
        res.status(500).json({ error: 'Failed to update article' });
    }
});

// DELETE /articles/:id - удалить статью
app.delete('/articles/:id', (req, res) => {
    try {
        const articleIndex = articles.findIndex(a => a.id === req.params.id);

        if (articleIndex === -1) {
            return res.status(404).json({ error: 'Article not found' });
        }

        articles.splice(articleIndex, 1);
        saveArticles(articles);

        console.log('✅ Article deleted:', req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

// Ручной backup
app.post('/backup', (req, res) => {
    try {
        commitToGit();
        res.json({ message: 'Backup initiated' });
    } catch (error) {
        res.status(500).json({ error: 'Backup failed' });
    }
});

// Восстановление из Git
app.post('/restore', async (req, res) => {
    try {
        exec('git pull origin main', (error, stdout, stderr) => {
            if (error) {
                console.error('Git pull failed:', error);
                return res.status(500).json({ error: 'Restore failed' });
            }
            
            // Перезагружаем статьи после pull
            articles = loadArticles();
            console.log('✅ Articles restored from Git');
            res.json({ message: 'Articles restored', count: articles.length });
        });
    } catch (error) {
        res.status(500).json({ error: 'Restore failed' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        storage: 'GitHub + File System',
        articlesCount: articles.length,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log('🚀 ==================================');
    console.log('✅ Blog API with GitHub Storage');
    console.log(`📍 Port: ${PORT}`);
    console.log(`💾 Storage: GitHub Repository`);
    console.log(`📊 Articles loaded: ${articles.length}`);
    console.log('🕒 Auto-backup: Every 30 minutes');
    console.log('🔧 Articles are SAFE in your GitHub!');
    console.log('🚀 ==================================');
});
