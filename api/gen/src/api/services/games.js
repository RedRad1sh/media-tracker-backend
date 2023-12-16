// КОД ЭТОГО ФАЙЛА НЕОБХОДИМО СКОПИРОВАТЬ В src/api/services
const ServerError = require('../../lib/error');
/**
 * @param {Object} options
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getGames = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'getGames ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.id ID игры
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getGamesById = async (options) => {
  // Implement your business logic here...
  //
  // This function should return as follows:
  //
  // return {
  //   status: 200, // Or another success code.
  //   data: [] // Optional. You can put whatever you want here.
  // };
  //
  // If an error happens during your business logic implementation,
  // you should throw an error as follows:
  //
  // throw new ServerError({
  //   status: 500, // Or another error code.
  //   error: 'Server Error' // Or another error message.
  // });

  return {
    status: 200,
    data: 'getGamesById ok!'
  };
};

