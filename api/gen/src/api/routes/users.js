const express = require('express');
let users = null;

const router = new express.Router();

function injectService(service) {
  users = service;
}

/**
 * Получение пользователя по Id
 */
router.get('/:id', async (req, res, next) => {
  const options = {
    id: req.params['id']
  };

  try {
    const result = await users.getUserById(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    return res.status(500).send({
      status: 500,
      error: 'Server Error'
    });
  }
});

/**
 * Создание пользователя
 * 
 * Тело:
 * 
 * @param {String} login
 * @param {String} password (movies, games, books)
 * @param {String} email
 * @param {String} imgUrl (строка Запланировано, Просмотрено и т.п.)
 */
router.post('/', async (req, res, next) => {
  const options = {
    requestBody: req.body
  };

  try {
    const result = await users.createUser(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = { router, injectService };
