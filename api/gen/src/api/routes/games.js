const express = require('express');
let games = null;

const router = new express.Router();

function injectService(service) {
  games = service;
}


/**
 * Получение списка игр
 */
router.get('/', async (req, res, next) => {
  const options = {
  };

  try {
    const result = await games.getGames(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

/**
 * Получение информации о игре по ID
 */
router.get('/:id', async (req, res, next) => {
  const options = {
    id: req.params['id']
  };

  try {
    const result = await games.getGamesById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = {router, injectService};
