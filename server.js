const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Используем порт из Render или 3001

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Пути к файлам
const dataDir = path.join(__dirname, 'data');
const articlesFile = path.join(dataDir, 'articles.json');

// Создаем папку data если не существует
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Функция загрузки статей
function loadArticles() {
    try {
        if (fs.existsSync(articlesFile)) {
            const data = fs.readFileSync(articlesFile, 'utf8');
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
        fs.writeFileSync(articlesFile, JSON.stringify(articles, null, 2));
        console.log('✅ Articles saved to file');
    } catch (error) {
        console.error('Error saving articles:', error);
    }
}

let articles = loadArticles();
console.log(`📊 Loaded ${articles.length} articles`);

// Middleware для логирования
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// GET /articles
app.get('/articles', (req, res) => {
    try {
        const sortedArticles = [...articles].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        res.json(sortedArticles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// POST /articles
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

// PATCH /articles/:id
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

// DELETE /articles/:id
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

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        articlesCount: articles.length,
        timestamp: new Date().toISOString()
    });
});

// Запуск сервера на правильном порту
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 ==================================');
    console.log('✅ Blog API Server Started');
    console.log(`📍 Port: ${PORT}`);
    console.log(`📊 Articles loaded: ${articles.length}`);
    console.log('🚀 ==================================');
});
