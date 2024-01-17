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
    userId: req.query['user_id'],
    page: req.query['page'],
    size: req.query['size'],
    searchString: req.query['search']  ?? "",
    genres: req.query['genres'] ?? [],
    rate: req.query['rate'] ?? undefined,
    yearFrom: req.query['yearFrom'] ?? undefined,
    yearTo: req.query['yearTo'] ?? undefined,
    durations: req.query['durations'] ?? undefined,
    selectedLists: req.query['selectedLists'] ?? undefined
  };

  try {
    const result = await books.getBooks(options);
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
 * Получение информации о книге по ID
 */
router.get('/book/:id/:userId', async (req, res, next) => {
  const options = {
    id: req.params['id'],
    userId: req.params['userId'],
  };

  try {
    const result = await books.getBookById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

/**
 * Получение списка жанров книг
 */
router.get('/genres', async (req, res, next) => {
  try {
    const result = await books.getBooksGenres();
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

module.exports = {router, injectService};
