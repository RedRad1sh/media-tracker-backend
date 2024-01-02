# импорт библиотек
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from db_cache_update import load_df

from multi_rake import Rake

# df_1 = pd.read_csv("movies.csv")
# дублирование полей помогает увеличить их важность при построении матрицы соответствия контента
movies_features = ['actors','genres','genres','directors']
games_features = ['developers', 'genres', 'genres']
books_features = ['title','categories','categories_ru','authors']

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

    i=0
    result = []
    for element in sorted_similar:
        if (element[0] not in indexes_to_remove):
            result.append(str(get_const_content_id_from_index(df_1, element[0])))
            print(get_title_from_index(df_1, element[0]))
            i=i+1
            if i>20:
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
    indexes_to_remove = list(map(lambda item: get_index_from_const_content_id(df_1, item)[0], recommend_object['content_ids']))

    for content in user_lists:
        content_index = get_index_from_const_content_id(df_1, content)[0]
        similar = similar + list(enumerate(cosine_sim[content_index]))

    sorted_similar = sorted(similar,key=lambda x:x[1],reverse=True)[1:]
    return [sorted_similar, indexes_to_remove]


# Методы подготовки датасетов

def recommend_movies(df_1, recommend_object):
    df_1['kp_rating'] = df_1['kp_rating'].fillna(df_1['kp_rating'].mean()) 

    for feature in movies_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features,args=(movies_features,'description',),axis=1, )

    return create_recommend_list(df_1, recommend_object)

def recommend_games(df_1, recommend_object):
    df_1['metcrt_rating'] = df_1['metcrt_rating'].fillna(df_1['metcrt_rating'].mean()) 

    for feature in games_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features, args=(games_features,),axis=1,)
    return create_recommend_list(df_1, recommend_object)

def recommend_books(df_1, recommend_object):
    df_1['user_rating'] = df_1['user_rating'].fillna(df_1['user_rating'].mean()) 

    for feature in books_features:
        df_1[feature] = df_1[feature].fillna('') #filling all NaNs with blank string
    df_1['combined_features'] = df_1.apply(combine_features,args=(books_features,'description',),axis=1)
    return create_recommend_list(df_1, recommend_object)

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
    keyword_str = ' '.join(map(lambda x: x[0],keywords[:15]))
    return keyword_str

def get_const_content_id_from_index(df_1, index):
    return df_1['const_content_id'][index]

def get_index_from_const_content_id(df_1, const_content_id):
    return df_1[df_1['const_content_id'] == str(const_content_id)].index

def get_title_from_index(df_1, index):
    return df_1['title'][int(index)]