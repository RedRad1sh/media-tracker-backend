from mongo_client import read_mongo
import pandas as pd
import time
import os

def load_df(content_type):
    # Кеш фрейма, чтобы все время в бд не ходить
    # Обновление кеша нужно перенести в асинхронную джобу
    content_type_to_mongo_collection = {
        "Movie": "movies",
        "Game": "games",
        "Book": "books"
    }
    
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

def updateJob():
    print('Обновление данных контента')
    load_df('Movie')
    load_df('Game')
    load_df('Book')