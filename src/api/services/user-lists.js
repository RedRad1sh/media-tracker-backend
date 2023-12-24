const User = require("../../model/user/User");
const UserList = require("../../model/user/UserList");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);

/**
 * @param {Object} options
 * @param {Object} options.requestBody тело запроса
 * @throws {Error}
 * @return {Promise}
 */
module.exports.addContent = async (options) => {
    try {
        log.debug(`Обновление списков пользователя: ${options.requestBody.user_id}`);
        let requestBody = options.requestBody;
        let userList = await UserList.findOneAndUpdate({
            user_id: requestBody.user_id,
            content_id: requestBody.content_id,
            content_type: requestBody.content_type
        }, requestBody, { upsert: true, new: true })
        await userList.populate('content_id', null, userList.content_type)
        if (userList.content_id === null) {
            log.error(`Не существует записи в ${requestBody.content_type} с id ${requestBody.content_id}`)
            await userList.deleteOne()
            throw new Error()
        }
        await User.findByIdAndUpdate(requestBody.user_id,
            { '$addToSet': { userLists: userList } })
        return {
            status: 200,
            data: userList
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
module.exports.getByUserId = async (options) => {
    try {
        log.debug(`Получение списков пользователя: ${options.userId}`);
        let userId = options.userId;
        let user = await User.findById(userId);
        let userLists = await Promise.all((await user.populate('userLists')).userLists
            .map(async item => item.populate('content_id', null, item.content_type)))
        
        log.debug(`Найдены списки ${userLists}`)

        let movieList = userLists
            .filter(item => item.content_type === 'Movie')
        let gameList = userLists
            .filter(item => item.content_type === 'Game')
        let bookList = userLists
            .filter(item => item.content_type === 'Book')

        return {
            status: 200,
            data: {
                movieList: movieList,
                gameList: gameList,
                bookList: bookList
            }

        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

