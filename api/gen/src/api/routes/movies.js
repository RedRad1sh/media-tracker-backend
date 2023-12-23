const express = require('express');
let movies = null;

const router = new express.Router();

function injectService(service) {
  movies = service;
}


/**
 * Получение списка фильмов
 */
router.get('/', async (req, res, next) => {
  const options = {
    page: req.query['page'],
    size: req.query['size']
  };

  try {
    const result = await movies.getMovies(options);
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
 * Получение информации о фильме по ID
 */
router.get('/:id', async (req, res, next) => {
  const options = {
    id: req.params['id']
  };

  try {
    const result = await movies.getMovieById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = {router, injectService};
