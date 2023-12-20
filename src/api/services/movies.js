const ServerError = require('../../lib/error');
const Movie = require("../../model/Movie");

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

    return {
      status: 200,
      data: await Movie.paginate({}, { offset, limit })
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * @param {Object} options
 * @param {Integer} options.id ID фильма
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getMoviesById = async (options) => {
  let moviesId = options.id;
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'getMoviesById ok!'
  };
};

