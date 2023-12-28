const Movie = require("../../model/Movie");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getMovies = async (options) => {
  try {
    log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`);
  
    const limit = options.size ? + options.size : 3;
    const offset = options.page ? options.page * limit : 0;
    const searchString = options.searchString;

    return {
      status: 200,
      data: await Movie.paginate({title: {$regex: new RegExp(searchString.toLowerCase(), "i")}}, { offset, limit })
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * @param {Object} options
 * @param {Number} options.id ID фильма
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getMovieById = async (options) => {
  try {
    let movieId = options.id;
    return {
      status: 200,
      data: await Movie.findOne({ const_content_id: movieId })
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
module.exports.getMoviesGenres = async () => {
  try {
    const genres = await Movie.find().distinct("genres");
    const result = genres.map(genre => {
      return genre.split(",").map(g => {
        let capitalizedGenre = g.trim();
        capitalizedGenre = capitalizedGenre[0].toUpperCase() + capitalizedGenre.slice(1);
        return capitalizedGenre;
      });
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