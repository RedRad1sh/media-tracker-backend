// КОД ЭТОГО ФАЙЛА НЕОБХОДИМО СКОПИРОВАТЬ В src/api/services
const ServerError = require('../../lib/error');
/**
 * @param {Object} options
 * @param {Object} options.requestBody Тело запроса для отзыва
 * @throws {Error}
 * @return {Promise}
 */
module.exports.postReviews = async (options) => {
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
    data: 'postReviews ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.id ID отзыва
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getReviewsById = async (options) => {
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
    data: 'getReviewsById ok!'
  };
};

/**
 * @param {Object} options
 * @param {Integer} options.id ID отзыва
 * @throws {Error}
 * @return {Promise}
 */
module.exports.deleteReviewsById = async (options) => {
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
    data: 'deleteReviewsById ok!'
  };
};

