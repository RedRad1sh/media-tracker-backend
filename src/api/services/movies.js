const Movie = require("../../model/Movie");
const UserLists = require("../../model/user/UserList");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const UserReviews = require("../../model/user/UserReview");
const UserReviewService = require("../../api/services/user-reviews");
const log = logger(config.logger);

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getMovies = async (options) => {
    try {
        log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`);

        const userId = options.userId;
        const limit = options.size ? +options.size : 3;
        const offset = options.page ? options.page * limit : 0;
        const searchString = options.searchString;
        const genres = options.genres.join("|");
        const rate = options.rate;
        const yearFrom = options.yearFrom;
        const yearTo = options.yearTo;
        const durations = options.durations;
        const selectedLists = options.selectedLists;

        let query = {title: {$regex: new RegExp(searchString.toLowerCase(), "i")}};
        if (genres.length) {
            query.genres = {$regex: new RegExp(genres.toLowerCase(), "i")};
        }
        if (rate) {
            query.user_rating = {$gte: Number(rate), $lt: Number(rate) + 1};
        }
        if (yearFrom && yearTo) {
            query.creation_year = {$gte: Number(yearFrom), $lte: Number(yearTo)};
        } else {
            if (yearFrom) {
                query.creation_year = {$gte: Number(yearFrom)};
            }
            if (yearTo) {
                query.creation_year = {$lte: Number(yearTo)};
            }
        }

        if (durations !== undefined && durations.length > 0) {
            let durationQueries = [];
            for (let duration of durations) {
                switch (duration) {
                    case "SHORT":
                        durationQueries.push({movie_length: {$lte: 90}});
                        break;
                    case "MEDIUM":
                        durationQueries.push({movie_length: {$gte: 90, $lte: 120}});
                        break;
                    case "LONG":
                        durationQueries.push({movie_length: {$gte: 120}});
                        break;
                    default:
                        break;
                }
            }

            query.$or = durationQueries;
        }

        if (selectedLists !== undefined && selectedLists.length > 0 && userId) {
            const listsQuery = {user_id: userId, content_type: "Movie", action: {$in: selectedLists}};
            const contentIds = await UserLists.find(listsQuery).select({content_id: 1, _id: 0});
            const moviesIds = contentIds.map(el => el.content_id);
            query.const_content_id = {$in: moviesIds};
        }

     let movies = await Movie.paginate(query, { offset, limit })
     let userLists = await UserLists.find({ user_id: userId, content_type: 'Movie'});
     let userReviews= await UserReviews.find({user_id: userId, content_type: 'Movie'});

     let moviesExtendInfo = movies.docs.map(movie => {
       let userListsItem = userLists.find(item => item.content_id === movie.const_content_id);
       let userListAction = userListsItem ? userListsItem.action : '-';

       let userReview = userReviews.find(item => item.content_id === movie.const_content_id);
       let userMark = userReview && userReview.rating !== null ? userReview.rating : '-';
    
      return {
        ...movie.toObject(),
        userListAction: userListAction,
        userMark: userMark,
      };
    });

    return {
      status: 200,
      data_extend: moviesExtendInfo,
      data: movies
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
        let userId = options.userId;

        await UserReviewService.calculateRating(movieId, 'Movie');

        let movie = await Movie.findOne({const_content_id: movieId});
        let userLists = userId !== "undefined" ? await UserLists.find({
            user_id: userId,
            content_type: 'Movie',
            content_id: movie.const_content_id
        }) : [];
        let contenInfoUser = userLists.filter(item => item.content_id === movie.const_content_id)[0];

        if (!contenInfoUser) {
            contenInfoUser = {content_id: movie.const_content_id, action: '-'};
        }

        let userRating = userId !== "undefined" ? await UserReviews.findOne({
            user_id: userId,
            content_type: 'Movie',
            content_id: movie.const_content_id
        }) : undefined;

        let rating = '-';

        if (userRating && userRating.rating != null) {
            rating = userRating.rating;
        }

        return {
            status: 200,
            data: {movie: movie, rating: rating, userList: contenInfoUser}
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