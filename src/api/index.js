const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const config = require('../lib/config');
const logger = require('../lib/logger');
const moviesRoute = require('../../api/gen/src/api/routes/movies')
const gamesRoute = require('../../api/gen/src/api/routes/games')
const booksRoute = require('../../api/gen/src/api/routes/books')
const userListsRoute = require('../../api/gen/src/api/routes/user-lists')
const usersRoute = require('../../api/gen/src/api/routes/users')
const userProfileRoute = require('../../api/gen/src/api/routes/user-profile')

const log = logger(config.logger);
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
/*
 * Routes
 */

// В сервисе вся бизнес логика - обращение к БД и т.п.
moviesRoute.injectService(require('./services/movies'));
app.use('/movies', moviesRoute.router);
gamesRoute.injectService(require('./services/games'));
app.use('/games', gamesRoute.router);

booksRoute.injectService(require('./services/books'));
app.use('/books', booksRoute.router);

usersRoute.injectService(require('./services/users'));
app.use('/users', usersRoute.router);

userListsRoute.injectService(require('./services/user-lists'));
app.use('/lists', userListsRoute.router);

userProfileRoute.injectService(require('./services/user-profile'));
app.use('/profile', userProfileRoute.router);

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