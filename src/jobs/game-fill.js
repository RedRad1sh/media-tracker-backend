const CronJob = require('cron').CronJob;
const Game = require("../model/Game");
const axios = require('axios');
const cheerio = require('cheerio');
const fillContentDB = require('./utils').fillContentDB;

const logger = require('../lib/logger');
const config = require('../lib/config');
const log = logger(config.logger);

const API_URL_GAMES = {
    url_id: 'https://steamcharts.com/top/p.',
    url_data: 'https://store.steampowered.com/api/appdetails'
};

module.exports.initGamesCronJob = async () => {
    CronJob.from({
        cronTime: config.fillSettings.games.cron,
        onTick: async function () {
            await fillContentDB('game', saveNextGameInfo);
        },
        start: config.fillSettings.games.isJobStart
    });
}

async function getGameId(page) { // на 1 странице 25 игр
    try {
        const gamesData = [];
        const steamChartsUrl = `${API_URL_GAMES.url_id}${page}`;
        const response = await axios.get(steamChartsUrl);
        const $ = cheerio.load(response.data);

        $('.game-name').each((index, element) => {
            const gameId = $(element).find('a').attr('href').split('/').pop();;
            gamesData.push(gameId);
        });

        return gamesData;

    } catch (error) {
        log.error('Произошла ошибка при получении информации об играх:', error.message);
    }
}


async function saveNextGameInfo(pageNum) {
    const games_id_arr = await getGameId(pageNum);
    log.debug(`Игры со следующими appId будут проиндексированы: ${games_id_arr}`);

    for (let i = 0; i < games_id_arr.length; i++) {
        try {
            const appInfoUrl = `${API_URL_GAMES.url_data}?appids=${games_id_arr[i]}&l=russian`;

            log.debug(`Индексируется игра по ссылке: ${appInfoUrl}`);

            const appInfoResponse = await axios.get(appInfoUrl);
            const gameInfo = appInfoResponse.data[games_id_arr[i]].data;

            if (appInfoResponse.data && appInfoResponse.data[games_id_arr[i]] && gameInfo && gameInfo.type == 'game') {
                let game = new Game({
                    steam_app_id: games_id_arr[i],
                    title: gameInfo.name,
                    description: gameInfo.detailed_description,
                    img_url: gameInfo.header_image,
                    metcrt_rating: 'metacritic' in gameInfo ? gameInfo.metacritic.score : null,
                    developers: gameInfo.developers.join(','),
                    release_date: Date.parse(gameInfo.release_date.date) || null,
                    genres: gameInfo.genres.map(genre => genre.description).join(','),
                    screenshot_url: gameInfo.header_image,
                    pc_req_min: 'minimum' in gameInfo.pc_requirements ? gameInfo.pc_requirements.minimum : null,
                    pc_req_rec: 'recommended' in gameInfo.pc_requirements ? gameInfo.pc_requirements.recommended : null,
                    video: gameInfo.movies?.[0]?.webm?.max ?? null,
                    user_rating: null
                })
                await game.save()

            } else {
                log.warn(`Не удалось получить информацию для игры с ID ${games_id_arr[i]}`);
            }
        } catch (error) {
            log.error('Произошла ошибка:', error.message);
        }

    }
    log.info('Все запросы завершены');
}