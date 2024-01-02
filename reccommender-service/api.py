#!flask/bin/python
from flask import Flask, jsonify, request
from content_based import recommend_content

app = Flask(__name__)

@app.errorhandler(404)
def not_found(error):
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
    result = recommend_content(recommend_object)
    return jsonify(result), 201

if __name__ == '__main__':
    app.run(debug=True)