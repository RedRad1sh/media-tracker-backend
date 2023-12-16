const express = require('express');
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
    requestBody: req.body['requestBody']
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

module.exports = {router, injectService};
