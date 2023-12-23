const CronJob = require('cron').CronJob;
const fillContentDB = require("./utils").fillContentDB;
const Book = require("../model/Book");
const axios = require('axios');

const logger = require("../lib/logger");
const config = require('../lib/config');
const log = logger(config.logger);

module.exports.initBooksCronJob = async () => {
    CronJob.from({
        cronTime: config.fillSettings.books.cron,
        onTick: async function () {
            await fillContentDB('book', saveNextBookInfo);
        },
        start: config.fillSettings.books.isJobStart
    });
}

async function saveNextBookInfo(pageNum) {
    try {
        const categories = ['Fiction', 'Science', 'History', 'Religion', 'Cooking', 'Travel', 'Biography', 'Poetry'];

        const limitItemsForPage = config.fillSettings.books.limitItemsForPage;
        const currentIndex = pageNum === 1 ? 0 : (pageNum - 1) * limitItemsForPage - 1;

        for (const category of categories) {
            const response = await axios.get(config.apiparams.books.url, {
                params: {
                    q: `subject:${category}`,
                    langRestrict: 'ru',
                    maxResults: limitItemsForPage,
                    startIndex: currentIndex,
                    printType: 'books',
                    orderBy: 'newest'
                },
            })
            const responseData = response.data;

            for (const item of responseData.items) {
                if (responseData.items && item.id) {
                    let book = new Book({
                        google_id: item.id,
                        title: item.volumeInfo.title,
                        description: item.volumeInfo.description,
                        img_url: item.volumeInfo.imageLinks && (item.volumeInfo.imageLinks.medium
                            || item.volumeInfo.imageLinks.large || item.volumeInfo.imageLinks.small
                            || item.volumeInfo.imageLinks.thumbnail || null),
                        authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(',') : null,
                        publisher: item.volumeInfo.publisher,
                        published_date: item.volumeInfo.publishedDate,
                        page_count: item.volumeInfo.pageCount,
                        categories: item.volumeInfo.categories ? item.volumeInfo.categories.join(',') : null,
                        categories_ru: mapCategoriesBook(category),
                        user_rating: null,
                    })

                    try {
                        await book.save()
                    } catch (e) {
                        log.warn(`Не удалось получить информацию для книги: ${book.title}`);
                    }
                } else {
                    log.info(`Не удалось получить информацию для книги`);
                }
            }
        }
    } catch (error) {
        log.error('Произошла ошибка:', error);
    }
    log.info('Все запросы завершены');
}

function mapCategoriesBook(categories) {
    const categoryMappings = {
        'Fiction': 'Художественная литература',
        'Science': 'Наука',
        'History': 'История',
        'Religion': 'Религия',
        'Cooking': 'Кулинария',
        'Travel': 'Путешествия',
        'Biography': 'Биография',
        'Poetry': 'Поэзия',
        'Fantasy': 'Фантастика'
    };

    const mappedCategory = categoryMappings[categories];
    return mappedCategory || categories;
}