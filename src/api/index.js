const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('../lib/config');
const logger = require('../lib/logger');

const log = logger(config.logger);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
 * Routes
 */

// Пример подключения сгенерированного рута и инжекта сервиса в рут
let moviesController = require('../../api/gen/src/api/routes/movies')
// В сервисе вся бизнес логика - обращение к БД и т.п.
moviesController.injectService(require('./services/movies'));
app.use('/movies', moviesController.router);
// Пример подключения сгенерированного рута и инжекта сервиса в рут
let gamesController = require('../../api/gen/src/api/routes/games')
// В сервисе вся бизнес логика - обращение к БД и т.п.
gamesController.injectService(require('./services/games'));
app.use('/games', gamesController.router);
// Пример подключения сгенерированного рута и инжекта сервиса в рут

// catch 404
app.use((req, res, next) => {
  log.error(`Error 404 on ${req.url}.`);
  res.status(404).send({ status: 404, error: 'Not found' });
});

// catch errors
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const msg = err.error || err.message;
  log.error(`Error ${status} (${msg}) on ${req.method} ${req.url} with payload ${req.body}.`);
  res.status(status).send({ status, error: msg });
});

module.exports = app;