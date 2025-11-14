from flask import Flask, jsonify, request
from flask_cors import CORS
import time


#Always create the a virtual enviorment in the backApp directory to run code

"""
  cd backApp
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  two terminals in do
    npm run start
  the other do
    npm run start-app
"""

app = Flask(__name__)
CORS(app)

# In-memory storage for services
services_db = []

@app.route('/api/services', methods=['POST'])
def create_service():
    """Create a new service"""
    data = request.get_json()

    # Validate required fields
    required_fields = ['title', 'description', 'price', 'userId']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Create service object
    service = {
        'id': data.get('id') or str(int(time.time() * 1000)),
        'userId': data['userId'],
        'title': data['title'],
        'description': data['description'],
        'price': data['price'],
        'createdAt': data.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    }

    services_db.append(service)
    print("Service created:", service)
    return jsonify(service), 201
