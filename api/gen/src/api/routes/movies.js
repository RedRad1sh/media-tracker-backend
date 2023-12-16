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
  };

  try {
    const result = await movies.getMovies(options);
    res.status(result.status || 200).send(result.data);
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
    const result = await movies.getMoviesById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = {router, injectService};
