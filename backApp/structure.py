from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
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
app.secret_key = 'development-key' #hide in production
CORS(app, supports_credentials=True)

def findItem(db, item_id):
    for item in db:
        if item['id'] == item_id:
            return item
    return None

# In-memory storage for services
services_db = []
appointments_db = []
users_db = {}

@app.post("/api/auth/signup")
def signup():
    data = request.json
    email = data["email"].lower()
    password = data["password"]

    if email in users_db:
        return jsonify({"error": "Email already exists"}), 400

    users_db[email] = {
        "id": str(len(users_db) + 1),
        "email": email,
        "password_hash": generate_password_hash(password),
        "createdAt": time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    }

    # create session
    session["user_email"] = email

    return jsonify({"id": users_db[email]["id"], "email": email}), 200


@app.post("/api/auth/login")
def login():
    data = request.json
    email = data["email"].lower()
    password = data["password"]

    user = users_db.get(email)
    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_email"] = email

    return jsonify({"id": user["id"], "email": user["email"]}), 200


@app.get("/api/auth/me")
def me():
    email = session.get("user_email")
    if not email or email not in users_db:
        return jsonify({"user": None}), 200

    user = users_db[email]
    return jsonify({"id": user["id"], "email": user["email"]}), 200


@app.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify({"message": "logged out"}), 200


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

@app.route('/api/appointments/<appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    appointment = findItem(appointments_db, appointment_id)
    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    return jsonify(appointment), 200

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    return jsonify(appointments_db), 200

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.get_json()

    required_fields = ['userId', 'serviceId', 'date', 'time']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    appointment = {
        'id': data.get('id') or str(int(time.time() * 1000)),
        'userId': data['userId'],
        'serviceId': data['serviceId'],
        'date': data['date'],
        'time': data['time'],
        'notes': data.get('notes', ''),
        'createdAt': data.get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%S.%fZ')
    }

    appointments_db.append(appointment)
    print("Appointment created:", appointment)
    return jsonify(appointment), 201

@app.route('/api/appointments/<appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    data = request.get_json()
    appointment = findItem(appointments_db, appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    appointment['date'] = data.get('date', appointment['date'])
    appointment['time'] = data.get('time', appointment['time'])
    appointment['notes'] = data.get('notes', appointment['notes'])
    
    return jsonify(appointment), 200

@app.route('/api/appointments/<appointment_id>', methods=['DELETE'])
def delete_appointment(appointment_id):
    global appointments_db
    appointments_db = [a for a in appointments_db if a['id'] != appointment_id]
    return jsonify({'message': 'Appointment deleted'}), 200

