#!flask/bin/python
<<<<<<< HEAD
from flask import Flask, jsonify, request, abort
from content_based import recommend_content
import schedule
from db_cache_update import updateJob
import time
from threading import Thread
import pandas as pd
import json

=======
from flask import Flask, jsonify, request
from content_based import recommend_content
>>>>>>> b95a42b (Реализованы простые рекомендации на основе разницы в указанных полях бд (фильм - фильм, игра - игра, книга - книга))

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
<<<<<<< HEAD
    return jsonify({'error': 'Not found'}), 404

@app.route('/recommend/simple', methods=['POST'])
def recommend_simple():
    if not request.json or not 'recommendContentType' or not 'usingContentTypes' in request.json:
        abort(400)
    recommend_object = {
        'Movie': list(map(lambda x: x['content_id'], request.json.get('movieList', []))),
        'Game': list(map(lambda x: x['content_id'], request.json.get('gameList', []))),
        'Book': list(map(lambda x: x['content_id'], request.json.get('bookList', []))),
        'using_content_types': request.json.get('usingContentTypes', []),
        'recommend_content_type': request.json.get('recommendContentType', "")
    }
    print(recommend_object)
    result = recommend_content(recommend_object)
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
=======
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.route('/recommend/simple', methods=['POST'])
def recommend_simple():
    if not request.json or not 'content_ids' in request.json:
        abort(400)
    recommend_object = {
        'content_ids': request.json['content_ids'],
        'content_type': request.json.get('content_type', ""),
        'reccommend_content_type': request.json.get('reccommend_content_type', "")
    }
    print(recommend_object)
    result = recommend_content(recommend_object)
    return jsonify(result), 201

def run_jobs():

    while True: 
        schedule.run_pending() 
        time.sleep(1)

if __name__ == '__main__':
>>>>>>> b95a42b (Реализованы простые рекомендации на основе разницы в указанных полях бд (фильм - фильм, игра - игра, книга - книга))
    app.run(debug=True)