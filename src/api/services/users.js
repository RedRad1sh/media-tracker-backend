const User = require("../../model/user/User");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);
const md5 = require('md5');
const jwt = require('jsonwebtoken');

/**
 * Получение пользователя по id
 *
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
 * Создание пользователя (регистрация)
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

    user = await user.save();
    const token = generateToken(user._id);

    return {
      status: 200,
      data: {
        user: {
          id: user._id,
          login: user.login,
          email: user.email,
          img_url: user.img_url
        },
        token: "JWT" + token
      }
    };
  } catch (err) {
    log.error(err)
    throw err
  }
};

/**
 * Авторизация пользователя
 *
 * @param options
 * @returns {Promise<void>}
 */
module.exports.auth = async (options) => {
  try {
    log.debug(`Авторизация пользователя: ${options.requestBody.login}`);

    const login = options.requestBody.login;
    const password = options.requestBody.password;

    const user = await User.findOne({login: login});

    if (!user) {
      return {
        status: 200,
        data: {
          errorMessage: "Такого пользователя не существует"
        }
      }
    }

    if (md5(password) !== user.password) {
      return {
        status: 200,
        data: {
          errorMessage: "Пароль не верный"
        }
      }
    }

    const token = generateToken(user._id);

    return {
      status: 200,
      data: {
        user: {
          id: user._id,
          login: user.login,
          email: user.email,
          img_url: user.img_url
        },
        token: "JWT" + token
      }
    };
  } catch (err) {
    log.error(err)
    throw err
  }
}

function generateToken(user_id) {
  return jwt.sign(
      { id: user_id },
      config.secret.key,
      {expiresIn: "24h"});
}
