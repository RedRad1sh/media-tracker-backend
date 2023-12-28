const express = require('express');
let userLists = null;

const router = new express.Router();

function injectService(service) {
    userLists = service;
}

/**
 * Добавление ИЛИ изменение статуса контента в списке пользователя
 * 
 * Тело:
 * 
 * @param {String} user_id - ObjectId
 * @param {String} content_type - String (Movie, Game, Book)
 * @param {String} content_id - ObjectId
 * @param {String} action - String (строка Запланировано, Просмотрено и т.п.)
 * 
 */
router.put('/', async (req, res, next) => {
    const options = {
        requestBody: req.body
    };

    try {
        const result = await userLists.addContent(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        return res.status(500).send({
            status: 500,
            error: 'Server Error'
        });
    }
});

/**
 * Получение списков контента пользователя
 */
router.get('/user/:userId', async (req, res, next) => {
    const options = {
        userId: req.params['userId']
    };

    try {
        const result = await userLists.getByUserId(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        next(err);
    }
});

module.exports = { router, injectService };
