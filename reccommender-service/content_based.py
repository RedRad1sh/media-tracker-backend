# импорт библиотек
import pandas as pd
import numpy as np
<<<<<<< HEAD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from db_cache_update import load_df
from multi_rake import Rake


from functools import reduce
import json

# df_1 = pd.read_csv("movies.csv")
# дублирование полей помогает увеличить их важность при построении матрицы соответствия контента
features = {
    'Movie': ['actors','genres','genres','directors'],
    'Game': ['developers', 'genres', 'genres'],
    'Book': ['title','categories_ru','authors']
}

content_type_to_plural = {
=======
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from db_cache_update import load_df

from multi_rake import Rake

# df_1 = pd.read_csv("movies.csv")
movies_features = ['actors','genres','directors']
games_features = ['title', 'genres']
books_features = ['title','categories','authors']

content_type_to_mongo_collection = {
>>>>>>> b95a42b (Реализованы простые рекомендации на основе разницы в указанных полях бд (фильм - фильм, игра - игра, книга - книга))
    "Movie": "movies",
    "Game": "games",
    "Book": "books"
}

<<<<<<< HEAD
def recommend_content(recommend_object):
    prepare_df_func = {
        "Movie": prepare_movies_df,
        "Game": prepare_games_df,
        "Book": prepre_books_df
    }
    
    reccommend_content_type = recommend_object['recommend_content_type']
    df_1 = load_df(reccommend_content_type)
    prepare_df_func[reccommend_content_type](df_1)
    content_types_for_recommend = recommend_object['using_content_types']
    concatenated_user_lists = reduce(lambda x, y: recommend_object[x] + recommend_object[y], content_types_for_recommend) if len(content_types_for_recommend) > 1 else recommend_object[content_types_for_recommend[0]]
    user_lists_df = pd.read_json(json.dumps(concatenated_user_lists))
    print(recommend_object)
    if (len(content_types_for_recommend) == 1):
        prepare_df_func[content_types_for_recommend[0]](user_lists_df)
    else:
        concatenated_features = reduce(lambda x, y: features[x] + features[y], content_types_for_recommend) if len(content_types_for_recommend) > 1 else features[content_types_for_recommend[0]]
        prepare_combined_features(user_lists_df, concatenated_features)
    
    print(user_lists_df['combined_features'][0]) 
    
    recommend_result = create_recommend_list_cross(df_1, user_lists_df)
        
    sorted_similar = recommend_result[0]
    indexes_to_remove = recommend_result[1]
    return get_reccomendation_ids_list(df_1, sorted_similar, indexes_to_remove)

def create_recommend_list_cross(df_1, df_2):
    cv = TfidfVectorizer()
    count_matrix_1 = cv.fit_transform(df_2['combined_features']) # важен порядок, первый список - для которого генерируются рекомендации
    count_matrix_2 = cv.transform(df_1['combined_features']) # второй список - откуда будут браться рекомендации
    
    cosine_sim = cosine_similarity(count_matrix_1, count_matrix_2)
    
    user_lists = df_2['const_content_id'].values
    similar = list()
    # indexes_to_remove = list(map(lambda item: get_index_from_const_content_id(df_1, item)[0], user_lists))
    indexes_to_remove = []
    
    for content in user_lists:
        index = get_index_from_const_content_id(df_2, content)
        content_index = index[0] if len(index) < 0 else 0
        similar = similar + list(enumerate(cosine_sim[content_index]))
    
    sorted_similar = sorted(set(similar),key=lambda x:x[1],reverse=True)[1:]
    return [sorted_similar, indexes_to_remove]

def create_recommend_list(df_1, recommend_object):
    cv = TfidfVectorizer()
    count_matrix = cv.fit_transform(df_1['combined_features'])
    cosine_sim = cosine_similarity(count_matrix)

    user_lists = recommend_object['content_ids']
    similar = list()
    indexes_to_remove = list(map(lambda item: get_index_from_const_content_id(df_1, item)[0], user_lists))

    for content in user_lists:
        content_index = get_index_from_const_content_id(df_1, content)[0]
        similar = similar + list(enumerate(cosine_sim[content_index]))

    sorted_similar = sorted(similar,key=lambda x:x[1],reverse=True)[1:]
    return [sorted_similar, indexes_to_remove]


# Методы подготовки датасетов

def prepare_combined_features(df, features_to_combine):
    for feature in features_to_combine:
        df[feature] = df[feature].fillna('') #filling all NaNs with blank string
    df['combined_features'] = df.apply(combine_features,args=(features_to_combine,'description',),axis=1, )


def prepare_movies_df(df_1):
    df_1['kp_rating'] = df_1['kp_rating'].fillna(df_1['kp_rating'].mean()) 
    prepare_combined_features(df_1, features['Movie'])

def prepare_games_df(df_1):
    df_1['metcrt_rating'] = df_1['metcrt_rating'].fillna(df_1['metcrt_rating'].mean()) 
    prepare_combined_features(df_1, features['Game'])

def prepre_books_df(df_1):
    df_1['user_rating'] = df_1['user_rating'].fillna(df_1['user_rating'].mean()) 
    prepare_combined_features(df_1, features['Book'])

def combine_features(row, features, desc_field = 'short_description'):
    result = ""
    for feature in features:
        result += row[feature] + ' '
    result += get_keywords(row[desc_field])
    return result

# Прочие утилитные методы

def get_keywords(text):
    rake = Rake(max_words=4, min_freq=1,)
    printable_str = ''.join(x for x in text if x.isprintable())
    keywords = rake.apply(printable_str)
    keyword_str = ' '.join(map(lambda x: x[0],keywords[:5]))
    return keyword_str

=======
def load_df(content_type):
    # Кеш фрейма, чтобы все время в бд не ходить
    # Обновление кеша нужно перенести в асинхронную джобу
    collection = content_type_to_mongo_collection[content_type]
    file_path = f"./{collection}.pkl"
    try:
        create_time = os.path.getmtime(file_path)
        current_time = time.time()
        print(f'Время жизни кеша: {current_time - create_time}')
        # 60 * 1 - по умолчанию обновляется раз в час
        if current_time - create_time < 60 * 60:
            df_1 = pd.read_pickle(f'{collection}.pkl')
            return df_1
    except:
        print('Ошибка при загрузке кеша - будет создан новый')

    df_1 = read_mongo(collection)
    df_1.to_pickle(f'{collection}.pkl')
    return df_1;


def combine_features(row, features):
    result = ""
    for feature in features:
        result += row[feature] + ' '
    return result

>>>>>>> b95a42b (Реализованы простые рекомендации на основе разницы в указанных полях бд (фильм - фильм, игра - игра, книга - книга))
def get_const_content_id_from_index(df_1, index):
    return df_1['const_content_id'][index]

def get_index_from_const_content_id(df_1, const_content_id):
    return df_1[df_1['const_content_id'] == str(const_content_id)].index

def get_title_from_index(df_1, index):
    return df_1['title'][int(index)]

<<<<<<< HEAD
def get_reccomendation_ids_list(df_1, sorted_similar, indexes_to_remove):
    i=0
=======
def recommend_content(recommend_object):
    prepare_df_func = {
        "Movie": prepare_movies_df,
        "Game": prepare_games_df,
        "Book": prepre_books_df
    }
    
    reccommend_content_type = recommend_object['reccommend_content_type']
    df_1 = load_df(reccommend_content_type)
    prepare_df_func[reccommend_content_type](df_1)
    content_types_for_recommend = recommend_object['content_types_for_recommend']
    concatenated_user_lists = reduce(lambda x, y: recommend_object[x] + recommend_object[y], content_types_for_recommend) if len(content_types_for_recommend) > 1 else recommend_object[content_types_for_recommend[0]]
    user_lists_df = pd.read_json(json.dumps(concatenated_user_lists))
    
    if (len(content_types_for_recommend) == 1):
        prepare_df_func[content_types_for_recommend[0]](user_lists_df)
    else:
        concatenated_features = reduce(lambda x, y: features[x] + features[y], content_types_for_recommend) if len(content_types_for_recommend) > 1 else features[content_types_for_recommend[0]]
        prepare_combined_features(user_lists_df, concatenated_features)
    
    print(user_lists_df['combined_features'][0]) 
    
    recommend_result = create_recommend_list_cross(df_1, user_lists_df)
        
    sorted_similar = recommend_result[0]
    indexes_to_remove = recommend_result[1]

    i=1
>>>>>>> b95a42b (Реализованы простые рекомендации на основе разницы в указанных полях бд (фильм - фильм, игра - игра, книга - книга))
    result = []
    for element in sorted_similar:
        if (element[0] not in indexes_to_remove):
            result.append(str(get_const_content_id_from_index(df_1, element[0])))
            print(get_title_from_index(df_1, element[0]))
            i=i+1
<<<<<<< HEAD
            if i>20:
                break
        else:
            print('')
    return { 'ids': result }
=======
            if i>10:
                break
        else:
            print('')
    return { 'ids': result }

def create_recommend_list(df_1, recommend_object):
    cv = TfidfVectorizer()
    count_matrix = cv.fit_transform(df_1['combined_features'])
    cosine_sim = cosine_similarity(count_matrix)

    user_lists = recommend_object['content_ids']
    similar = list()
    indexes_to_remove = list(map(lambda item: get_index_from_const_content_id(df_1, item)[0], user_lists))

    for content in user_lists:
        content_index = get_index_from_const_content_id(df_1, content)[0]
        similar = similar + list(enumerate(cosine_sim[content_index]))

    sorted_similar = sorted(similar,key=lambda x:x[1],reverse=True)[1:]
    return [sorted_similar, indexes_to_remove]


# Методы подготовки датасетов

def prepare_combined_features(df, features_to_combine):
    for feature in features_to_combine:
        df[feature] = df[feature].fillna('') #filling all NaNs with blank string
    df['combined_features'] = df.apply(combine_features,args=(features_to_combine,'description',),axis=1, )


def prepare_movies_df(df_1):
    df_1['kp_rating'] = df_1['kp_rating'].fillna(df_1['kp_rating'].mean()) 
    prepare_combined_features(df_1, features['Movie'])

def prepare_games_df(df_1):
    df_1['metcrt_rating'] = df_1['metcrt_rating'].fillna(df_1['metcrt_rating'].mean()) 
    prepare_combined_features(df_1, features['Game'])

def prepre_books_df(df_1):
    df_1['user_rating'] = df_1['user_rating'].fillna(df_1['user_rating'].mean()) 

    for feature in books_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features,args=(books_features,'description',),axis=1)
    return create_recommend_list(df_1, recommend_object)
>>>>>>> b95a42b (Реализованы простые рекомендации на основе разницы в указанных полях бд (фильм - фильм, игра - игра, книга - книга))
