const express = require('express');
const passport = require("passport");
let reviews = null;

const router = new express.Router();

function injectService(service) {
  reviews = service;
}


/**
 * Создание нового отзыва
 */
router.post('/', async (req, res, next) => {
  const options = {
    requestBody: req.body
  };

  try {
    const result = await reviews.postReviews(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

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

/**
 * Получение списка отзывов для контента
 */
router.get('/content/:contentType/:contentId', async (req, res, next) => {
  const options = {
    contentType: req.params['contentType'],
    contentId: req.params['contentId']
  };

  try {
    const result = await reviews.getByContentId(options);
    res.status(result.status || 200).send({
      data: result.data.docs,
      totalItems: result.data.totalDocs,
      currentPage: result.data.page - 1,
      totalPages: result.data.totalPages
    });
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

/**
 * Получение списка отзывов для пользователя
 */
router.get('/user/:userId', async (req, res, next) => {
  const options = {
    userId: req.params['userId']
  };

  try {
    const result = await reviews.getByUserId(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = { router, injectService };
