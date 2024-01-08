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
 * @param {Number} rating
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
    next(err);
  }
});

/**
 * Получение всех отзывов
 *
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
 * Получение всех отзывов по user_id
 */
router.get('/user/:user_id', async (req, res, next) => {
  const options = {
    user_id: req.params['user_id']
  };

  console.log(options);

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

module.exports = { router, injectService };