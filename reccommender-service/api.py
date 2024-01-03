#!flask/bin/python
from flask import Flask, jsonify, request, abort
from content_based import recommend_content
import schedule
from db_cache_update import updateJob
import time
from threading import Thread
import pandas as pd
import json


app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.route('/recommend/simple', methods=['POST'])
def recommend_simple():
    if not request.json or not 'reccommend_content_type' in request.json:
        abort(400)
    recommend_object = {
        'Movie': list(map(lambda x: x['content_id'], request.json.get('movieList', []))),
        'Game': list(map(lambda x: x['content_id'], request.json.get('gameList', []))),
        'Book': list(map(lambda x: x['content_id'], request.json.get('bookList', []))),
        'content_types_for_recommend': request.json.get('content_types_for_recommend', []),
        'reccommend_content_type': request.json.get('reccommend_content_type', "")
    }
    result = recommend_content(recommend_object)
    # print(pd.read_json(json.dumps(recommend_object['movies'])))
    return jsonify(result), 201

def run_jobs():

    while True: 
        schedule.run_pending() 
        time.sleep(1)

if __name__ == '__main__':
    schedule.every(10).minutes.do(updateJob) 
    thread = Thread(target=run_jobs)
    thread.daemon = True
    thread.start()
    app.run(debug=True)