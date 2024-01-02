import pandas as pd
from pymongo import MongoClient
import yaml

def get_mongo_uri():
    with open("../config/common.yml", "r") as stream:
        try:
            return yaml.safe_load(stream)['defaults']['mongo']['url']
        except yaml.YAMLError as exc:
            print(exc)

def _connect_mongo():
    """ A util for making a connection to mongo """
    conn = MongoClient(get_mongo_uri())
    return conn


def read_mongo(collection, query={}, no_id=True):
    """ Read from Mongo and Store into DataFrame """

    # Connect to MongoDB
    db = _connect_mongo()['test']

    # Make a query to the specific DB and Collection
    cursor = db[collection].find(query)

    # Expand the cursor and construct the DataFrame
    df =  pd.DataFrame(list(cursor))
    # Delete the _id
    if no_id:
        del df['_id']

    return df