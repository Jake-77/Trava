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

def findItem(db, item_id):
    for item in db:
        if item['id'] == item_id:
            return item
    return None

# In-memory storage for services
services_db = []

@app.route('/api/services/<service_id>', methods=['GET'])
def get_service(service_id):
            
    service = findItem(services_db, service_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    return jsonify(service), 200

@app.route('/api/services', methods=['GET'])
def get_services():
    return jsonify(services_db), 200

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

@app.route('/api/services/<service_id>', methods=['PUT'])
def update_service(service_id):
    data = request.get_json()
    service = findItem(services_db, service_id)
    
    if not service:
        return jsonify({'error': 'Service not found'}), 404

    # Update fields if they exist in the payload
    service['title'] = data.get('title', service['title'])
    service['description'] = data.get('description', service['description'])
    service['price'] = data.get('price', service['price'])
    
    return jsonify(service), 200

@app.route('/api/services/<service_id>', methods=['DELETE'])
def delete_service(service_id):
    global services_db
    services_db = [s for s in services_db if s['id'] != service_id]
    return jsonify({'message': 'Service deleted'}), 200