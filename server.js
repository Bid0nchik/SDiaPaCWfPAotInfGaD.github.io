const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Firebase Admin инициализация
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// GET /articles - получить все статьи
app.get('/articles', async (req, res) => {
  try {
    const snapshot = await db.collection('articles')
      .orderBy('date', 'desc')
      .get();
    
    const articles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// POST /articles - создать статью
app.post('/articles', async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const articleData = {
      title: title.trim(),
      content: content.trim(),
      image: image || null,
      date: new Date().toISOString()
    };

    const docRef = await db.collection('articles').add(articleData);
    
    const responseArticle = {
      id: docRef.id,
      ...articleData
    };

    console.log('✅ Article created in Firestore:', docRef.id);
    res.status(201).json(responseArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PATCH /articles/:id - обновить статью
app.patch('/articles/:id', async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (image !== undefined) updateData.image = image;

    await db.collection('articles').doc(req.params.id).update(updateData);
    
    // Получаем обновленную статью
    const doc = await db.collection('articles').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updatedArticle = {
      id: doc.id,
      ...doc.data()
    };

    console.log('✅ Article updated in Firestore:', req.params.id);
    res.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /articles/:id - удалить статью
app.delete('/articles/:id', async (req, res) => {
  try {
    await db.collection('articles').doc(req.params.id).delete();
    console.log('✅ Article deleted from Firestore:', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const snapshot = await db.collection('articles').count().get();
    const articleCount = snapshot.data().count;
    
    res.json({ 
      status: 'OK', 
      database: 'Firebase Firestore',
      articlesCount: articleCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
  console.log('🚀 ==================================');
  console.log('✅ Blog API with Firebase Firestore');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🗄️  Database: Firebase`);
  console.log('🔧 Articles stored permanently!');
  console.log('🚀 ==================================');
});
