const Book = require("../../model/Book");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const UserLists = require("../../model/user/UserList");
const UserReviews = require("../../model/user/UserReview");
const UserReviewService = require("../../api/services/user-reviews");
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
                        durationQueries.push({page_count: {$lte: 120}});
                        break;
                    case "MEDIUM":
                        durationQueries.push({page_count: {$gte: 120, $lte: 500}});
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


        let books = await Book.paginate(query, { offset: offset, limit: limit, sort: { openlib_rating : "desc"}});
        let userLists = await UserLists.find({ user_id: userId, content_type: 'Book'});
        let userReviews = await UserReviews.find({user_id: userId, content_type: 'Book'});

        let booksExtendInfo = books.docs.map(book => {
          let userListsItem = userLists.find(item => item.content_id === book.const_content_id);

          let userListAction = userListsItem ? userListsItem.action : '-';

          let userReview = userReviews.find(item => item.content_id === book.const_content_id);
          let userMark = userReview && userReview.rating !== null ? userReview.rating : '-';

         return {
           ...book.toObject(),
           userListAction: userListAction,
           userMark: userMark,
         };
       });

        return {
            status: 200,
            data: books,
            data_extend: booksExtendInfo,
        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

/**
 * @param {Object} options
 * @param {Number} options.id ID книги
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getBookById = async (options) => {
    try {
        let bookId = options.id;
        let userId = options.userId;

        await UserReviewService.calculateRating(bookId, 'Book');

        let book = await Book.findOne({const_content_id: bookId});
        let userLists = await UserLists.find({
            user_id: userId,
            content_type: 'Book',
            content_id: book.const_content_id
        });
        let contenInfoUser = userLists.filter(item => item.content_id === book.const_content_id)[0];

        if (!contenInfoUser) {
            contenInfoUser = {content_id: book.const_content_id, action: '-'};
        }

        let userRating = await UserReviews.findOne({
            user_id: userId,
            content_type: 'Book',
            content_id: book.const_content_id
        });

        let rating = '-';

        if (userRating && userRating.rating != null) {
            rating = userRating.rating;
        }

        return {
            status: 200,
            data: {book: book, rating: rating,  userList: contenInfoUser}
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
