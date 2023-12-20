const logger = require('../lib/logger');
const config = require('../lib/config');
const log = logger(config.logger);
const FillJobScheme = require('../model/FillJob')

/**
 * 
 * @param {string} type - тип контента: 'movies', 'games' или 'books'
 * @param {function} fillFunction - функция совершающая запросы и заполняющая бд. В параметрах должен быть параметр int page
 */
module.exports.fillContentDB = async (type, fillFunction) => {
    let fillJobResult = await FillJobScheme.findOne({ type: type });

    log.debug(fillJobResult);

    if (fillJobResult != null) {
        const lastUpdatedPage = fillJobResult.lastUpdatedPage + 1;

        fillFunction(lastUpdatedPage);

        await FillJobScheme.updateOne(
            { type: type },
            { updateTime: new Date(), updatedPagesNum: config.fillSettings.games.updatedPagesNum, lastUpdatedPage: lastUpdatedPage },
            { upsert: true }
        );

    } else {
        fillFunction(1);
        fillJobResult = new FillJobScheme({
            type: type,
            updateTime: new Date(),
            updatedPagesNum: config.fillSettings.games.updatedPagesNum,
            lastUpdatedPage: 1
        });
        await fillJobResult.save();
    }
}