const express = require('express');
let usersReview = null;

const router = new express.Router();

function injectService(service) {
    usersReview = service;
}

/**
 * Создание отзыва
 *
 * Тело:
 *
 * @param {Schema.Types.ObjectId} user_id
 * @param {String} content_type (movies, games, books)
 * @param {String} content_id
 * @param {String} review_message
 */
router.post('/', async (req, res, next) => {
    const options = {
        requestBody: req.body
    };

    try {
        const result = await usersReview.createReview(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        return res.status(500).send({
            status: 500,
            error: 'Server Error'
        });
    }
});

/**
 * Обновление оценки отзыва
 *
 * Тело:
 *
 * @param {Schema.Types.ObjectId} user_id
 * @param {String} content_type (movies, games, books)
 * @param {String} content_id
 * @param {Number} rating
 */
router.post('/rating', async (req, res, next) => {
    const options = {
        requestBody: req.body
    };

    try {
        const result = await usersReview.updateRating(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        return res.status(500).send({
            status: 500,
            error: 'Server Error'
        });
    }
});

/**
 * Получение списка отзывов для контента
 *w
 * Тело:
 *
 * @param {String} content_id
 * @param {String} content_type
 */
router.get('/', async (req, res, next) => {
    try {
        const result = await usersReview.getReviews(req.query);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        next(err);
    }
});

/**
 * Получение всех отзывов по для пользователя
 */
router.get('/user/:user_id', async (req, res, next) => {
    const options = {
        user_id: req.params['user_id']
    };

    try {
        const result = await usersReview.getUserReviews(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        return res.status(500).send({
            status: 500,
            error: 'Server Error'
        });
    }
});

// Для будущих реализаций
/**
 * Получение отзыва по ID
 */
router.get('/:id', async (req, res, next) => {
    const options = {
        id: req.params['id']
    };

    try {
        const result = await reviews.getReviewsById(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        next(err);
    }
});

/**
 * Удаление отзыва по ID
 */
router.delete('/:id', async (req, res, next) => {
    const options = {
        id: req.params['id']
    };

    try {
        const result = await reviews.deleteReviewsById(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        return res.status(500).send({
            status: 500,
            error: 'Server Error'
        });
    }
});

module.exports = {router, injectService};