const Game = require("../../model/Game");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const UserLists = require("../../model/user/UserList");
const log = logger(config.logger);

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getGames = async (options) => {
  try {
    log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`)

    const userId = options.userId;
    const limit = options.size ? + options.size : 3;
    const offset = options.page ? options.page * limit : 0;
    const searchString = options.searchString;
    const genres = options.genres.join("|");
    const rate = options.rate;
    const yearFrom = options.yearFrom;
    const yearTo = options.yearTo;
    const selectedLists = options.selectedLists;

    let query = {title: {$regex: new RegExp(searchString.toLowerCase(), "i")}};
    if (genres.length) {
      query.genres = {$regex: new RegExp(genres.toLowerCase(), "i")};
    }
    if (rate) {
      query.user_rating = {$gte: Number(rate), $lt: Number(rate) + 1};
    }
    if (yearFrom && yearTo) {
      query.release_date = {$gte: new Date(options.yearFrom, 0, 1), $lte: new Date(options.yearTo, 0, 1)};
    } else {
      if (yearFrom) {
        query.release_date = {$gte: new Date(options.yearFrom, 0, 1)};
      }
      if (yearTo) {
        query.release_date = {$lte: new Date(options.yearTo, 0, 1)};
      }
    }

    if (selectedLists !== undefined && selectedLists.length > 0 && userId) {
      const listsQuery = {user_id: userId, content_type: "Game", action: {$in: selectedLists}};
      const contentIds = await UserLists.find(listsQuery).select({content_id: 1, _id: 0});
      const gameIds = contentIds.map(el => el.content_id);
      query.const_content_id = {$in: gameIds};
    }

    return {
      status: 200,
      data: await Game.paginate(query, { offset, limit })
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * @param {Object} options
 * @param {Number} options.id ID игры
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getGameById = async (options) => {
  try {
    let gameId = options.id;
    return {
      status: 200,
      data: await Game.findOne({ const_content_id: gameId })
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * @throws {Error}
 * @returns {Promise}
 */
module.exports.getGamesGenres = async () => {
  try {
    const genres = await Game.find().distinct("genres");
    const result = genres.map(genre => {
      return genre.split(",");
    }).flat()

    return {
      status: 200,
      data: Array.from(new Set(result))
    };
  } catch (err) {
    log.error(err)
    throw err
  }
}


