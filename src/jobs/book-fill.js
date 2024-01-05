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
            await fillContentDB('book', savePopularBooks);
        },
        start: config.fillSettings.books.isJobStart
    });
}

async function savePopularBooks(pageNum) {
    const limitItemsForPage = config.fillSettings.books.limitItemsForPage;
    const currentIndex = pageNum;
    const fields = 'key,title,author_name,editions,editions.key,editions.title,editions.ebook_access,editions.language,editions.id_google,ratings_average'
    const openLibraryUrl = config.apiparams.books.openLibUrl;

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
    const docs = response.data.docs.map(doc => ({
        title: doc.editions.docs[0].title,
        rating: doc.ratings_average
    }))
    log.debug(`Будут загружены следующие книги: \n ${docs.map(doc => doc.title)}`)
    for (const doc of docs) {
        await saveBook(doc, 1, 0);
    }
}

async function saveBook(doc, limitItemsForPage, currentIndex) {
    const response = await axios.get(config.apiparams.books.url, {
        params: {
            q: doc.title,
            langRestrict: 'ru',
            maxResults: limitItemsForPage,
            startIndex: currentIndex,
            printType: 'books',
            orderBy: 'newest'
        },
    });
    const responseData = response.data;
    if (responseData.items != null) {
        for (const item of responseData.items) {
            if (responseData.items && item.id) {
                console.log(doc.rating)
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
                    openlib_rating: doc.rating || null
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
        'Young Adult Fiction': 'Художественная литература',
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