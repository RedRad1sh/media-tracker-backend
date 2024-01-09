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
 * @param {String} password
 * @param {String} email
 * @param {String} imgUrl
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

/**
 * Авторизация пользователя
 *
 * Тело:
 *
 * @param {String} id
 * @param {String} login
 * @param {String} password
 */
router.post('/auth', async (req, res, next) => {
  const options = {
    requestBody: req.body
  };

  try {
    const result = await users.auth(options);
    res.status(result.status || 200).send(result.data);
  } catch (err) {
    next(err);
  }
});

module.exports = { router, injectService };
