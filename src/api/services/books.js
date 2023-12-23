const Book = require("../../model/Book");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getBooks = async (options) => {
    try {
        log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`)

        const limit = options.size ? + options.size : 3;
        const offset = options.page ? options.page * limit : 0;

        return {
            status: 200,
            data: await Book.paginate({}, { offset, limit })
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
module.exports.getBookById = async (options) => {
    try {
        let bookId = options.id;
        return {
          status: 200,
          data: await Book.findOne({ _id: bookId })
        };
      } catch (err) {
        log.error(err)
        throw err
      }
};

