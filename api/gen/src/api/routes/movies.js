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
    userId: req.query['user_id'],
    page: req.query['page'],
    size: req.query['size'],
    searchString: req.query['search'] ?? "",
    genres: req.query['genres'] ?? [],
    rate: req.query['rate'] ?? undefined,
    yearFrom: req.query['yearFrom'] ?? undefined,
    yearTo: req.query['yearTo'] ?? undefined,
    durations: req.query['durations'] ?? undefined,
    selectedLists: req.query['selectedLists'] ?? undefined
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
router.get('/movie/:id', async (req, res, next) => {
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

/**
 * Получение списка жанров фильмов
 */
router.get('/genres', async (req, res, next) => {
  try {
    const result = await movies.getMoviesGenres();
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

module.exports = {router, injectService};
