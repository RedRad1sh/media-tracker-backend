const User = require("../../model/user/User");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);
const md5 = require('md5');

/**
 * @param {Object} options.id
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getUserById = async (options) => {
  try {
    log.debug(`Получение пользователя по id: ${options.id}`);

    return {
      status: 200,
      data: await User.findById(options.id)
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * TODO: реализовать
 * 
 * @param {Object} options.requestBody тело запроса
 * @throws {Error}
 * @return {Promise}
 */
module.exports.createUser = async (options) => {
  try {
    log.debug(`Создание пользователя, параметры: ${options.requestBody}`);
    let userRequest = options.requestBody;
    let user = new User({
        login: userRequest.login,
        password: md5(userRequest.password),
        email: userRequest.email,
        img_url: userRequest.imgUrl,
        registration_date: new Date()
    })
    return {
      status: 200,
      data: await user.save()
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

