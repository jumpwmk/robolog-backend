import hashlib
import json
import random
import datetime
import firebase_admin
from firebase_admin import credentials
from firebase_admin import credentials, firestore
import datetime
import json

with open('./maps.json') as f:
  data = json.load(f)

# Output: {'name': 'Bob', 'languages': ['English', 'Fench']}
print(data)

cred = credentials.Certificate("../../logicgame-9f4ca-firebase-adminsdk-80vw9-945285eefb.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

for key, value in data.items():
    doc_ref = db.collection(u'maps').document(key)

    doc_ref.set(value)
