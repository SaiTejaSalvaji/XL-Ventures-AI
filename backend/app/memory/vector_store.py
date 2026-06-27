import math
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.app.database.models import SemanticMemory

# A simple pure-Python TF-IDF vectorizer fallback to avoid external dependencies
class LocalTFIDFVectorizer:
    def __init__(self):
        pass

    def get_embedding(self, text: str) -> List[float]:
        # Simple bag-of-words character n-gram hashing to create a deterministic vector of length 128
        vector = [0.0] * 128
        text = text.lower()
        # Hash character bi-grams
        for i in range(len(text) - 1):
            bigram = text[i:i+2]
            h = hash(bigram) % 128
            vector[h] += 1.0
            
        # Normalize the vector
        magnitude = math.sqrt(sum(x*x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        return vector

class VectorStore:
    def __init__(self):
        self.vectorizer = LocalTFIDFVectorizer()

    def get_embedding(self, text: str, openai_key: str = None) -> List[float]:
        # If openai_key is available, we could call OpenAI embedding endpoint
        # For robustness and performance, use our local vectorizer
        return self.vectorizer.get_embedding(text)

    def add_text(self, db: Session, key: str, text: str) -> SemanticMemory:
        # Check if already exists
        existing = db.query(SemanticMemory).filter(SemanticMemory.entity_key == key).first()
        embedding = self.get_embedding(text)
        
        if existing:
            existing.text_content = text
            existing.embedding = embedding
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_mem = SemanticMemory(
                entity_key=key,
                text_content=text,
                embedding=embedding
            )
            db.add(new_mem)
            db.commit()
            db.refresh(new_mem)
            return new_mem

    def search_similar(self, db: Session, text: str, limit: int = 5) -> List[Tuple[SemanticMemory, float]]:
        query_vector = self.get_embedding(text)
        all_memories = db.query(SemanticMemory).all()
        
        results = []
        for mem in all_memories:
            mem_vector = mem.embedding
            # Cosine similarity
            dot_product = sum(q * m for q, m in zip(query_vector, mem_vector))
            results.append((mem, dot_product))
            
        # Sort by similarity descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]

vector_store = VectorStore()
