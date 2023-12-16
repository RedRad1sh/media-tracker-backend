const express = require('express');
let books = null;

const router = new express.Router();

function injectService(service) {
  books = service;
}


/**
 * Получение списка книг
 */
router.get('/', async (req, res, next) => {
  const options = {
  };

  try {
    const result = await books.getBooks(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

/**
 * Получение информации о книге по ID
 */
router.get('/:id', async (req, res, next) => {
  const options = {
    id: req.params['id']
  };

  try {
    const result = await books.getBooksById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = {router, injectService};
