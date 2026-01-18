const express = require('express'); 
const router = express.Router(); 
const admin = require('firebase-admin');
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
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    process.exit(1);
}
const db = admin.firestore();

router.delete('/articles/:section/:id', async (req, res) => {
    try {
        const section = req.params.section;
        const articleId = req.params.id;
        if (!['Prog', 'OSINT', 'Trol'].includes(section)) {
            return res.status(400).json({ 
                error: 'Неверный раздел. Допустимые значения: Prog, OSINT, Trol'
            });
        }
        const doc = await db.collection(section).doc(articleId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }
        await db.collection(section).doc(articleId).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось удалить статью',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
