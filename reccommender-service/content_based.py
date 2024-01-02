# импорт библиотек
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from mongo_client import read_mongo
import time
import os


# df_1 = pd.read_csv("movies.csv")
movies_features = ['actors','genres','directors']
games_features = ['title', 'genres']
books_features = ['title','categories','authors']

content_type_to_mongo_collection = {
    "Movie": "movies",
    "Game": "games",
    "Book": "books"
}

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

def get_const_content_id_from_index(df_1, index):
    return df_1['const_content_id'][index]

def get_index_from_const_content_id(df_1, const_content_id):
    return df_1[df_1['const_content_id'] == str(const_content_id)].index

def get_title_from_index(df_1, index):
    return df_1['title'][int(index)]

def recommend_content(recommend_object):
    recomment_func = {
        "Movie": recommend_movies,
        "Game": recommend_games,
        "Book": recommend_books
    }
    
    df_1 = load_df(recommend_object['reccommend_content_type'])
    recommend_result = recomment_func[recommend_object['reccommend_content_type']](df_1, recommend_object)
    sorted_similar = recommend_result[0]
    indexes_to_remove = recommend_result[1]

    i=1
    result = []
    for element in sorted_similar:
        if (element[0] not in indexes_to_remove):
            result.append(str(get_const_content_id_from_index(df_1, element[0])))
            print(get_title_from_index(df_1, element[0]))
            i=i+1
            if i>10:
                break
    return { 'ids': result }

def create_recommend_list(df_1, recommend_object):
    cv = CountVectorizer() #creating new CountVectorizer() object
    count_matrix = cv.fit_transform(df_1['combined_features'])
    cosine_sim = cosine_similarity(count_matrix)

    user_lists = recommend_object['content_ids']
    similar = list()
    indexes_to_remove = list(map(lambda item: get_index_from_const_content_id(df_1, item)[0], recommend_object['content_ids']))

    for content in user_lists:
        content_index = get_index_from_const_content_id(df_1, content)[0]
        similar = similar + list(enumerate(cosine_sim[content_index]))

    sorted_similar = sorted(similar,key=lambda x:x[1],reverse=True)[1:]
    return [sorted_similar, indexes_to_remove]

def recommend_movies(df_1, recommend_object):
    df_1['kp_rating'] = df_1['kp_rating'].fillna(df_1['kp_rating'].mean()) 

    for feature in movies_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features,args=(movies_features,),axis=1, )

    return create_recommend_list(df_1, recommend_object)

def recommend_games(df_1, recommend_object):
    df_1['metcrt_rating'] = df_1['metcrt_rating'].fillna(df_1['metcrt_rating'].mean()) 

    for feature in games_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features, args=(games_features,),axis=1,)
    print(df_1)
    return create_recommend_list(df_1, recommend_object)

def recommend_books(df_1, recommend_object):
    df_1['user_rating'] = df_1['user_rating'].fillna(df_1['user_rating'].mean()) 

    for feature in books_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features,args=(books_features,),axis=1)
    return create_recommend_list(df_1, recommend_object)