const express = require('express');
let userProfile = null;

const router = new express.Router();

function injectService(service) {
    userProfile= service;
}

/**
 * Получение статистики по контенту пользователя
 */
router.get('/stats/:userId', async (req, res, next) => {
    const options = {
        userId: req.params['userId']
    };

    try {
        const result = await userProfile.getStats(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        next(err);
    }
});

/**
 * Изменение изображения профиля пользователя
 * 
 * Тело:
 * 
 * @param {String} user_id - ObjectId
 * @param {String} new_img_url - Ссылка на изображение
 * 
 */
router.put('/update-img', async (req, res, next) => {
    const options = {
        requestBody: req.body
    };

    try {
        const result = await userProfile.updateProfileImg(options);
        res.status(result.status || 200).send(result.data);
    } catch (err) {
        return res.status(500).send({
            status: 500,
            error: 'Server Error'
        });
    }
});

module.exports = { router, injectService };
