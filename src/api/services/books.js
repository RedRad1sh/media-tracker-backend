const Book = require("../../model/Book");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const UserLists = require("../../model/user/UserList");
const log = logger(config.logger);

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getBooks = async (options) => {
    try {
        log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`)

        const userId = options.userId;
        const limit = options.size ? + options.size : 3;
        const offset = options.page ? options.page * limit : 0;
        const searchString = options.searchString != null ? `.*${options.searchString}.*` : '.*';
        const genres = options.genres.join("|");
        const rate = options.rate;
        const yearFrom = options.yearFrom;
        const yearTo = options.yearTo;
        const durations = options.durations;
        const selectedLists = options.selectedLists;

        let query = {title: {$regex: new RegExp(searchString.toLowerCase(), "i")}};
        if (genres.length) {
            query.categories_ru = {$regex: new RegExp(genres.toLowerCase(), "i")};
        }
        if (rate) {
            query.user_rating = {$gte: Number(rate), $lt: Number(rate) + 1};
        }
        if (yearFrom && yearTo) {
            query.published_date = {$gte: new Date(options.yearFrom, 0, 1), $lte: new Date(options.yearTo, 0, 1)};
        } else {
            if (yearFrom) {
                query.published_date = {$gte: new Date(options.yearFrom, 0, 1)};
            }
            if (yearTo) {
                query.published_date = {$lte: new Date(options.yearTo, 0, 1)};
            }
        }

        if (durations !== undefined && durations.length > 0) {
            let durationQueries = [];
            for (let duration of durations) {
                switch (duration) {
                    case "SHORT":
                        durationQueries.push({page_count: {$lte : 120}});
                        break;
                    case "MEDIUM":
                        durationQueries.push({page_count: {$gte: 120, $lte : 500}});
                        break;
                    case "LONG":
                        durationQueries.push({page_count: {$gte: 500}});
                        break;
                    default:
                        break;
                }
            }

            query.$or = durationQueries;
        }

        if (selectedLists !== undefined && selectedLists.length > 0 && userId) {
            const listsQuery = {user_id: userId, content_type: "Book", action: {$in: selectedLists}};
            const contentIds = await UserLists.find(listsQuery).select({content_id: 1, _id: 0});
            const bookIds = contentIds.map(el => el.content_id);
            query.const_content_id = {$in: bookIds};
        }

        return {
            status: 200,
            data: await Book.paginate(query, { offset: offset, limit: limit, sort: { openlib_rating : "desc"}})
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
          data: await Book.findOne({ const_content_id: bookId })
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
module.exports.getBooksGenres = async () => {
    try {
        const genres = await Book.find().distinct("categories_ru");
        return {
            status: 200,
            data: Array.from(new Set(genres))
        };
    } catch (err) {
        log.error(err)
        throw err
    }
}
