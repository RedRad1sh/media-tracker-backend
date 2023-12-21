const Game = require("../../model/Game");

const ServerError = require('../../lib/error');
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getGames = async (options) => {
  try {
    log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`)

    const limit = options.size ? + options.size : 3;
    const offset = options.page ? options.page * limit : 0;

    return {
      status: 200,
      data: await Game.paginate({}, { offset, limit })
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * @param {Object} options
 * @param {Integer} options.id ID игры
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getGamesById = async (options) => {
  try {
    let gameId = options.id;
    
    return {
      status: 200,
      data: await Game.findOne({ _id: gameId })
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

