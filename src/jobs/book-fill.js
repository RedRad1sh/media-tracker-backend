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
            await fillContentDB('book', parseBookSites);
        },
        start: config.fillSettings.books.isJobStart
    });
}

async function parseBookSites(pageNum) {
    savePopularBooks(pageNum)
    // saveNextBookInfo(pageNum)
}

async function savePopularBooks(pageNum) {
    const limitItemsForPage = config.fillSettings.books.limitItemsForPage;
    const currentIndex = pageNum;
    const fields = 'key,title,author_name,editions,editions.key,editions.title,editions.ebook_access,editions.language,editions.id_google'
    const openLibraryUrl = 'https://openlibrary.org/search.json';

    const response = await axios.get(openLibraryUrl, {
        params: {
            q: `language:rus`,
            lang: 'ru',
            limit: limitItemsForPage,
            page: currentIndex,
            fields: fields,
            sort: 'rating'
        },
    })
    console.log(response)
    const titles = response.data.docs.map(doc => doc.editions.docs[0].title)
    console.log(titles)
    for (const title of titles) {
        await saveBook(title, 1, 0);
    }
}

/**
 * DEPRECATED - отдает рандом, не вижу смысла подключать обратно
 */
async function saveNextBookInfo(pageNum) {
    try {
        const categories = ['Fiction', 'Science', 'History', 'Religion', 'Cooking', 'Travel', 'Biography', 'Poetry'];

        const limitItemsForPage = config.fillSettings.books.limitItemsForPage;
        const currentIndex = pageNum === 1 ? 0 : (pageNum - 1) * limitItemsForPage - 1;

        for (const category of categories) {
            await saveBook(`subject:${category}`, limitItemsForPage, currentIndex);
        }
    } catch (error) {
        log.error('Произошла ошибка:', error);
    }
    log.info('Все запросы завершены');
}

async function saveBook(search, limitItemsForPage, currentIndex) {
    const response = await axios.get(config.apiparams.books.url, {
        params: {
            q: search,
            langRestrict: 'ru',
            maxResults: limitItemsForPage,
            startIndex: currentIndex,
            printType: 'books',
            orderBy: 'newest'
        },
    });
    console.log(response.data)
    const responseData = response.data;
    if (responseData.items != null) {
        for (const item of responseData.items) {
            if (responseData.items && item.id) {
                let book = new Book({
                    google_id: item.id,
                    const_content_id: item.id,
                    title: item.volumeInfo.title,
                    description: item.volumeInfo.description,
                    img_url: item.volumeInfo.imageLinks && (item.volumeInfo.imageLinks.medium
                        || item.volumeInfo.imageLinks.large || item.volumeInfo.imageLinks.small
                        || item.volumeInfo.imageLinks.thumbnail || null) || 'https://books.google.nl/googlebooks/images/no_cover_thumb.gif',
                    authors: item.volumeInfo.authors ? item.volumeInfo.authors.join(',') : null,
                    publisher: item.volumeInfo.publisher,
                    published_date: item.volumeInfo.publishedDate,
                    page_count: item.volumeInfo.pageCount,
                    categories: item.volumeInfo.categories ? item.volumeInfo.categories.join(',') : null,
                    categories_ru: mapCategoriesBook((item.volumeInfo.categories || [''])[0]),
                    user_rating: null,
                });

                try {
                    await book.save();
                } catch (e) {
                    log.error(e)
                    log.warn(`Не удалось получить информацию для книги: ${book.title}`);
                }
            } else {
                log.info(`Не удалось получить информацию для книги`);
            }
        }
    }
}

function mapCategoriesBook(categories) {
    const categoryMappings = {
        'Fiction': 'Художественная литература',
        'English fiction': 'Художественная литература',
        'Science': 'Наука',
        'Social Science': 'Наука',
        'Political Science': 'Наука',
        'Computers': 'Наука',
        'History': 'История',
        'Religion': 'Религия',
        'Cooking': 'Кулинария',
        'Travel': 'Путешествия',
        'Biography': 'Биография',
        'Biography & Autobiography': 'Биография',
        'Poetry': 'Поэзия',
        'Fantasy': 'Фантастика',
        'Psychology': 'Психология',
        'Juvenile Fiction': 'Детская литература',
        "Children's stories": 'Детская литература',
        'Juvenile Nonfiction': 'Детская литература',
        'Drama': 'Драма',
        'Philosophy': 'Философия',
        'Education': 'Образование',
        'Study Aids': 'Образование',
        'Foreign Language Study': 'Образование',
        'Comics & Graphic Novels': 'Комиксы и графические новеллы',
        'Body, Mind & Spirit': 'Здоровье и разум',
        'Business & Economics': 'Экономика',
        'Self-Help': 'Психология',
        'Medical': 'Медицина',
        'Architecture': 'Архитектура',
        'Art': 'Искусство'
    };

    const mappedCategory = categoryMappings[categories];
    return mappedCategory || categories;
}