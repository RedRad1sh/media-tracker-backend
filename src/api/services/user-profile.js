const User = require("../../model/user/User");
const UserProfile = require("../../model/user/User");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);
const Movie = require("../../model/Movie");
const Game = require("../../model/Game");
const Book = require("../../model/Book");
const schemas = { Movie: Movie, Game: Game, Book: Book }



module.exports.updateProfileImg = async (options) => {
    try {
        log.debug(`Обновление изображения профиля пользователя: ${options.requestBody.user_id}`);
        let requestBody = options.requestBody;
        let userProfile = await UserProfile.findOneAndUpdate(
            { _id: requestBody.user_id}, 
            { img_url: requestBody.new_img_url }, 
            { new: true }
        )
        return {
            status: 200,
            data: userProfile             
        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getStats = async (options) => {
    try {
        log.debug(`Сбор статистики по контенту для пользователя: ${options.userId}`);
        let userId = options.userId;
        let user = await User.findById(userId);
        let userLists = await Promise.all((await user.populate('userLists')).userLists
            .map(async item => fillContentJson(item.content_type, item)));
        
        
        let allContentStats = { contentType: ['Фильмы', 'Книги', 'Игры'], count: [0, 0, 0] };
        let allEndContent =  userLists.filter (item => item.action === 'Просмотрено' || item.action === 'Пройдено' || item.action === 'Прочитано')

        for (let cnt of allEndContent){
            let index = (cnt.content_type === 'Movie') ? 0 :
                        (cnt.content_type === 'Book')  ? 1 :
                        (cnt.content_type === 'Game')  ? 2 : null
            
            allContentStats.count[index]++;
        }

        if (allContentStats.count.every(value => value === 0)) {
            allContentStats.count = [];
        }
        
        let movieStats = getStatsForObject(userLists, 'Movie', ['Запланировано', 'Смотрю', 'Просмотрено', 'Брошено'], ', ');
        let gameStats = getStatsForObject(userLists, 'Game', ['Запланировано', 'Играю', 'Пройдено', 'Брошено'], ',');
        let bookStats = getStatsForObject(userLists, 'Book', ['Запланировано', 'Читаю', 'Прочитано', 'Брошено'], null);
        
        log.debug(`Статистика для пользователя  ${options.userId} собрана`);
        return {
            status: 200,
            data: { allContentStats: allContentStats,
                    movieStats: movieStats,
                    gameStats: gameStats,
                    bookStats: bookStats,     
            }             
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

function getStatsForObject (userLists, contentType, actions, delimiter) {

    let objectList = userLists.filter(item => item.content_type === contentType)

    let objectStats = [
       { planningGenres: { actions: actions[0], genres: [], count: [] } },
       { watchingGenres: { actions: actions[1], genres: [], count: [] } },
       { watchedGenres:  { actions: actions[2], genres: [], count: [] } }
    ];

    for (let obj of objectList) {
        let action = obj.action;
        let genres;
        
        if (contentType !== 'Book'){
            genres = obj.content_id.genres.split(delimiter);
        }
        else{
            genres = [obj.content_id.categories_ru];
        }
           
        let actionGenres = (action === actions[0]) ? objectStats[0].planningGenres :
                           (action === actions[1]) ? objectStats[1].watchingGenres :
                           (action === actions[2]) ? objectStats[2].watchedGenres : null;
          
        if (actionGenres) {
            for (let genre of genres) {
               
            let index = actionGenres.genres.indexOf(genre);
          
              if (index !== -1) {
                actionGenres.count[index]++;
              } 
              else {   
                actionGenres.genres.push(genre);
                actionGenres.count.push(1);
              }
            }
        }
    }

    return objectStats;
}