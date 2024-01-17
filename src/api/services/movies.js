const Movie = require("../../model/Movie");
const UserLists = require("../../model/user/UserList");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);
const User = require("../../model/user/User");
const Game = require("../../model/Game");
const Book = require("../../model/Book");
const schemas = { Movie: Movie, Game: Game, Book: Book }

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getMovies = async (options) => {
  try {
    log.debug(`Параметры пагинации, page: ${options.page} и size: ${options.size}`);
  
    const userId = options.userId;
    const limit = options.size ? + options.size : 3;
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
            durationQueries.push({movie_length: {$lte : 90}});
            break;
          case "MEDIUM":
            durationQueries.push({movie_length: {$gte: 90, $lte : 120}});
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

    return {
      status: 200,
      data: await Movie.paginate(query, { offset, limit })
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

    let contenInfo = await Movie.findOne({ const_content_id: movieId});
    let userLists = await UserLists.find({ user_id: userId, content_type: 'Movie', content_id: contenInfo.const_content_id});
    
    let contenInfoUser = { ...contenInfo.toObject() };

    if(userLists){
      contenInfoUser.userListsInfo = userLists.filter(item => item.content_id === contenInfo.const_content_id);
    }
    return {
      status: 200,
      data: contenInfoUser
    };

  } catch (err) {
    log.error(err)
    throw err
  }
};


async function fillContentJson(content_type, userList) {
  const id = (await schemas[content_type]
      .findOne({ 'const_content_id': userList.content_id }))._id;
  userList.content_id = id;
  return await userList.populate('content_id', null, content_type);
}

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