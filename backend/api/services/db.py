from google.cloud import firestore
from google.oauth2 import service_account
from ..config import get_settings
import os

settings = get_settings()

_firestore_client = None

def get_firestore_client():
    """Get Firestore client singleton"""
    global _firestore_client
    
    if _firestore_client is None:
        if settings.firebase_credentials_path and os.path.exists(settings.firebase_credentials_path):
            # Use service account file
            credentials = service_account.Credentials.from_service_account_file(
                settings.firebase_credentials_path
            )
            _firestore_client = firestore.Client(
                project=settings.firebase_project_id,
                credentials=credentials
            )
        else:
            # Use default credentials (for deployed environments)
            _firestore_client = firestore.Client(project=settings.firebase_project_id)
    
    return _firestore_client

def init_collections():
    """Initialize Firestore collections with indexes"""
    db = get_firestore_client()
    
    # Create initial documents to establish collections
    collections = [
        'submissions',
        'leaderboard_13-15_male',
        'leaderboard_13-15_female',
        'leaderboard_16-18_male',
        'leaderboard_16-18_female',
        'leaderboard_19-25_male',
        'leaderboard_19-25_female',
        'leaderboard_26-35_male',
        'leaderboard_26-35_female'
    ]
    
    for collection in collections:
        # Add a dummy document if collection is empty
        docs = db.collection(collection).limit(1).stream()
        if not any(docs):
            db.collection(collection).document('_init').set({
                'created': firestore.SERVER_TIMESTAMP,
                'type': 'initialization'
            })
