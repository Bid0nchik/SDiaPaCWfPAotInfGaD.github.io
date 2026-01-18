module.exports = function validateArticleData(articleData, isUpdate = false) {
    const errors = [];

    if (!isUpdate || articleData.title !== undefined) {
        const title = articleData.title?.trim();
        if (!title) {
            errors.push('Заголовок обязателен');
        } else if (title.length > 200) {
            errors.push('Заголовок не должен превышать 200 символов');
        }
    }

    if (!isUpdate || articleData.content !== undefined) {
        const content = articleData.content?.trim();
        if (!content) {
            errors.push('Содержание обязательно');
        } else if (content.length > 10000) {
            errors.push('Содержание не должно превышать 10000 символов');
        }
    }

    if (articleData.image !== undefined && articleData.image !== null) {
        if (!articleData.image.startsWith('data:image/')) {
            errors.push('Неверный формат изображения');
        } else if (articleData.image.length > 5 * 1024 * 1024) {
            errors.push('Размер изображения слишком большой');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
