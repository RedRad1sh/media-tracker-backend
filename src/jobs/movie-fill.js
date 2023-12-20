const CronJob = require('cron').CronJob;
const Movie = require("../model/Movie");
const axios = require('axios');
const fillContentDB = require('./utils').fillContentDB;

const logger = require('../lib/logger');
const config = require('../lib/config');
const log = logger(config.logger);

const API_URL_FILMS = {
    url: 'https://api.kinopoisk.dev/v1.3/movie',
    key: '1FDYTQ7-NEV45FZ-QGFP4QT-8056F80'
};;

module.exports.initMoviesCronJob = async () => {
    CronJob.from({
        cronTime: config.fillSettings.movies.cron,
        onTick: async function () {
            log.info('You will see this message every minute');
            await fillContentDB('movie', saveNextFilmInfo);
        },
        start: config.fillSettings.movies.isJobStart
    });
}

async function saveNextFilmInfo(pageNum) {
    const limit = config.fillSettings.movies.limitItemsForPage;
    try {
        const options = {
            method: 'get',
            url: `${API_URL_FILMS.url}?limit=${limit}&page=${pageNum}&selectFields=id&selectFields=name&selectFields=description&selectFields=year&selectFields=rating&selectFields=movieLength&selectFields=countries&selectFields=persons&&selectFields=poster&&selectFields=genres&&selectFields=videos`,
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': API_URL_FILMS.key,
            },
        };

        const response = await axios(options);
        const responseData = response.data;

        for (const item of responseData.docs) {
            if (responseData && item.id) {
             let film = new Movie({
                kinopoisk_app_id: item.id,
                title: item.name,
                description: item.description,
                img_url: item.poster.url,
                kp_rating: item.rating.kp,
                imb_rating: item.rating.imdb,
                creation_year: item.year,
                genres: item.genres.map(genre => genre.name).join(', '),
                movie_length: item.movieLength,
                countries: item.countries.map(countries => countries.name).join(', '),
                directors: item.persons.filter(person => person.profession == 'режиссеры').map(director => director.name).join(', ') || null,
                actors: item.persons.filter(person => person.profession == 'актеры').map(actor => actor.name).join(', ') || null,
                video: 'videos' in item ? item.videos.trailers.filter(trailer => trailer.type === 'TRAILER' && trailer.site === 'youtube').map(url => url.url).find(() => true) || null : null,
                user_rating: null
             });
  
             await film.save();

            } else {
                log.warn(`Не удалось получить информацию для фильма`);
            }
        }
  
    } 
    catch (error) {
        log.error('Произошла ошибка:', error.message);
    } 
  }