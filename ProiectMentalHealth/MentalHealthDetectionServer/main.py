import pickle
import threading
import time
import os
from random import random

from flask import Flask, jsonify, request, session, redirect, url_for
from Dataset import Dataset
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

api = Flask(__name__)
api.secret_key = 'your-secret-key'
CORS(api)

base_dir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(base_dir, '..', 'inovative.db')

api.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
api.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(api)

user_data = {}
threads = {}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    username = db.Column(db.String(80), unique=True, nullable=False)  # Username
    password = db.Column(db.String(120), nullable=False)  # Hashed password

    def __repr__(self):
        return f'<User {self.username}>'

with api.app_context():
    db.create_all()

def load_measurements(user_id):
    try:
        with open(f'measurementsUser{user_id}.pkl', 'rb') as f:
            return pickle.load(f).dataset
    except FileNotFoundError:
        return None

def save_measurements(user_id):
    with open(f'measurementsUser{user_id}.pkl', 'wb') as f:
        pickle.dump(user_data.get(user_id, Dataset), f)


def add_measurements_periodically(user_id):
    dataset = user_data.get(user_id, Dataset())
    while True:
        acc_x = random()
        acc_y = random()
        acc_z = random()
        bvp = random()
        eda = random()
        temp = random()
        dataset.add(acc_x, acc_y, acc_z, bvp, eda, temp)
        time.sleep(10)


@api.route('/measurements', methods=['GET'])
def get_measurements():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header is missing"}), 401

    token = auth_header.split(" ")[1] if " " in auth_header else auth_header
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token.get('user_id')
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    dataset = user_data.get(user_id, Dataset())
    last_two_values = {field: values[-2:] for field, values in dataset.to_dict().items()}
    return jsonify(last_two_values)

from flask import request, jsonify
import jwt
import datetime
import threading

SECRET_KEY = "your_secret_key"  # Replace with your actual secret key

@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400

    username = data['username'].strip()
    password = data['password'].strip()

    # Replace this with your actual database query
    user = db.session.query(User).filter(User.username==username,User.password==password).first()
    
    # Check if user exists
    if user is None:
        return jsonify({"error": "Invalid username or password"}), 401  # Return 401 Unauthorized if user not found

    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm='HS256')

    session['user_id'] = user.id

    loaded_data = load_measurements(user.id)
    dataset = Dataset()

    if loaded_data:
        data_length = len(loaded_data['acc_x'])
        for i in range(data_length):
            dataset.add(
                loaded_data['acc_x'][i],
                loaded_data['acc_y'][i],
                loaded_data['acc_z'][i],
                loaded_data['bvp'][i],
                loaded_data['eda'][i],
                loaded_data['temp'][i]
            )

    user_data[user.id] = dataset

    stop_event = threading.Event()

    threads[user.id] = threading.Thread(target=add_measurements_periodically, args=(user.id,), daemon=True)
    threads[user.id].start()

    return jsonify({"token": token})

@api.route('/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header is missing"}), 401

    token = auth_header.split(" ")[1] if " " in auth_header else auth_header
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token.get('user_id')
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    save_measurements(user_id)
    session.pop('user_id', None)
    if user_id in threads:
        threads[user_id]._stop()
    return jsonify({"message": f"User {user_id} logged out"})


from flask import jsonify, request, session
import numpy as np
import tensorflow as tf
import json

os.chdir(os.path.dirname(__file__))

model = tf.keras.models.load_model('lstm_wit_4_classes.keras')
consecutive_timeline = 15


def reshape_data(input_data):
    """
    Reshape the flat data array into samples of timeline_length.
    """
    return np.array(input_data).reshape(1, consecutive_timeline, 1)

label_mapping = {}

with open("label_mapping.json", "r") as file:
    label_mapping = json.load(file)

reverse_mapping = {v: k for k, v in label_mapping.items()}

@api.route('/predict', methods=['GET'])
def get_prediction():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify({"error": "Authorization header is missing"}), 401

    token = auth_header.split(" ")[1] if " " in auth_header else auth_header
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        user_id = decoded_token.get('user_id')
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    
    
    dataset = user_data.get(user_id, Dataset())
    dict_dataset = dataset.to_dict()

    acc_x = dict_dataset.get('acc_x')
    acc_y = dict_dataset.get('acc_y')
    acc_z = dict_dataset.get('acc_z')
    bvp = dict_dataset.get('bvp')
    eda = dict_dataset.get('eda')
    temp = dict_dataset.get('temp')
    if not acc_x or len(acc_x) < consecutive_timeline:
        return jsonify({'error': 'Insufficient data for prediction'}), 400

    input_data = [
        reshape_data(acc_x[-consecutive_timeline:]),
        reshape_data(acc_y[-consecutive_timeline:]),
        reshape_data(acc_z[-consecutive_timeline:]),
        reshape_data(bvp[-consecutive_timeline:]),
        reshape_data(eda[-consecutive_timeline:]),
        reshape_data(temp[-consecutive_timeline:]),
    ]

    prediction = model.predict(input_data)[-1]
    max_index = np.argmax(prediction)
    predicted_class = reverse_mapping[max_index]

    return jsonify({'user_id': user_id, 'prediction': predicted_class})


def auto_save():
    while True:
        time.sleep(60)
        for user_id in user_data:
            save_measurements(user_id)


threading.Thread(target=auto_save, daemon=True).start()

import atexit

atexit.register(lambda: [save_measurements(user_id) for user_id in user_data])

# Start the server
if __name__ == '__main__':
    api.run(debug=True)
