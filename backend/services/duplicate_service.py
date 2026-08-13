from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models import Grievance
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def check_duplicate_grievance(new_text: str, new_translation: str, db: Session, threshold: float = 0.45) -> Dict[str, Any]:
    """
    Computes TF-IDF vector cosine similarity between the incoming grievance (text + translation)
    and all existing grievances in the database.
    """
    existing_grievances: List[Grievance] = db.query(Grievance).all()

    if not existing_grievances:
        return {
            "is_duplicate": False,
            "similarity": 0.0,
            "matched_ticket_id": None,
            "matched_text": None
        }

    # Combine original_text and translation for robust cross-lingual duplicate matching
    corpus = [g.original_text + " " + g.translation for g in existing_grievances]
    target_doc = new_text + " " + new_translation

    all_docs = corpus + [target_doc]

    try:
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform(all_docs)

        # Compute cosine similarity between the last document (target) and all preceding (corpus)
        target_vec = tfidf_matrix[-1]
        corpus_matrix = tfidf_matrix[:-1]

        similarities = cosine_similarity(target_vec, corpus_matrix)[0]

        max_idx = int(np.argmax(similarities))
        max_sim = float(similarities[max_idx])

        if max_sim >= threshold:
            matched = existing_grievances[max_idx]
            return {
                "is_duplicate": True,
                "similarity": round(max_sim * 100, 1),
                "matched_ticket_id": matched.ticket_id,
                "matched_text": matched.original_text
            }
        else:
            return {
                "is_duplicate": False,
                "similarity": round(max_sim * 100, 1),
                "matched_ticket_id": None,
                "matched_text": None
            }
    except Exception as e:
        print(f"Error during duplicate detection: {e}")
        return {
            "is_duplicate": False,
            "similarity": 0.0,
            "matched_ticket_id": None,
            "matched_text": None
        }
