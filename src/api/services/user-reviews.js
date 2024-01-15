const UserReview = require("../../model/user/UserReview");
const User = require("../../model/user/User");
const Book = require("../../model/Book");
const Game = require("../../model/Game");
const Movie = require("../../model/Movie");
const logger = require('../../lib/logger');
const config = require('../../lib/config');
const log = logger(config.logger);

/**
 *
 * @param {Object} options.requestBody тело запроса
 * @throws {Error}
 * @return {Promise}
 */

/*
* Слева бд - Справа значение, которое должно быть
* */
module.exports.createReview = async (options) => {
    try {
        log.debug(`Создание рецензии пользователя: ${options.requestBody.user_id}`);
        let userRequest = options.requestBody;

        let userReview = await UserReview.findOne({
            user_id: userRequest.user_id,
            content_type: userRequest.content_type,
            content_id: userRequest.content_id
        })

        if (userReview) {
            userReview.review_message = userRequest.review_message;
        } else {
            userReview = new UserReview({
                user_id: userRequest.user_id,
                content_type: userRequest.content_type,
                content_id: userRequest.content_id,
                rating: null,
                review_message: userRequest.review_message
            });
        }

        return {
            status: 200,
            data: await userReview.save()
        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

/**
 * Получаем все отзывы контента по content_id и content_type
 *
 * @param {String} options.content_id
 * @param {String} options.content_type
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getReviews = async (options) => {
    try {
        const reviews = await UserReview.find({
            content_id: options.content_id,
            content_type: options.content_type
        });

        const reviewsDto = await Promise.all(reviews.map(mapReview));

        return {
            status: 200,
            data: reviewsDto
        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

/**
 * Получаем все отзывы пользователя
 *
 * @param {Schema.Types.ObjectId} options.user_id
 * @throws {Error}
 * @return {Promise}
 */
module.exports.getUserReviews = async (options) => {
    try {
        const reviews = await UserReview.find({
            user_id: options.user_id
        });

        const reviewsDto = await Promise.all(reviews.map(mapReview));

        return {
            status: 200,
            data: reviewsDto
        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

/**
 *
 * @param {Object} options.requestBody тело запроса
 * @throws {Error}
 * @return {Promise}
 */

/*
* Слева бд - Справа значение, которое должно быть
* */
module.exports.updateRating = async (options) => {
    try {
        log.debug(`Обновление оценки контента (пользователь, тип контента, идентификатор контента):
         ${options.requestBody.user_id} ${options.requestBody.content_type} ${options.requestBody.content_id}`);

        let userRequest = options.requestBody;

        let userReview = await UserReview.findOne({
            user_id: userRequest.user_id,
            content_type: userRequest.content_type,
            content_id: userRequest.content_id
        })

        if (userReview) {
            userReview.rating = userRequest.rating
        } else {
            userReview = new UserReview({
                user_id: userRequest.user_id,
                content_type: userRequest.content_type,
                content_id: userRequest.content_id,
                rating: userRequest.rating,
                review_message: null
            });
        }

        return {
            status: 200,
            data: await userReview.save()
        };
    } catch (err) {
        log.error(err)
        throw err
    }
};

async function mapReview(review) {
    const user = await User.findOne({_id: review.user_id});

    let content;
    switch (review.content_type) {
        case "Book":
            content = await Book.findOne({const_content_id: review.content_id});
            break;
        case "Movie":
            content = await Movie.findOne({const_content_id: review.content_id});
            break;
        case "Game":
            content = await Game.findOne({const_content_id: review.content_id});
            break;
    }

    return {
        contentPicture: content.img_url,
        contentTitle: content.title,
        userImage: user.img_url,
        username: user.login,
        rating: review.rating,
        review_message: review.review_message
    };
}