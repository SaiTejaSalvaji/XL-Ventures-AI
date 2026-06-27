from google.cloud import firestore
import logging
import os
import json
from typing import Dict, List, Any, Optional

# Custom Cosmos-compatible exception to prevent breaking repository layers
class CosmosResourceNotFoundError(Exception):
    pass

logger = logging.getLogger("app.database.firestore")

class MockFirestoreCollectionProxy:
    """Mock Collection Proxy storing data locally in JSON files when offline"""
    def __init__(self, collection_name: str):
        self.collection_name = collection_name
        self.db_dir = "./local_db"
        self.db_path = os.path.join(self.db_dir, f"{collection_name}.json")
        os.makedirs(self.db_dir, exist_ok=True)
        if not os.path.exists(self.db_path):
            with open(self.db_path, "w") as f:
                json.dump([], f)

    def _read_all(self) -> List[Dict[str, Any]]:
        try:
            with open(self.db_path, "r") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_all(self, items: List[Dict[str, Any]]):
        with open(self.db_path, "w") as f:
            json.dump(items, f, indent=2)

    async def create_item(self, body: Dict[str, Any]) -> Dict[str, Any]:
        items = self._read_all()
        items = [item for item in items if item.get("id") != body.get("id")]
        items.append(body)
        self._write_all(items)
        return body

    async def read_item(self, item: str, partition_key: Any) -> Dict[str, Any]:
        items = self._read_all()
        for idx in items:
            if idx.get("id") == item:
                return idx
        raise CosmosResourceNotFoundError(f"Document {item} not found in collection {self.collection_name}")

    async def replace_item(self, item: str, body: Dict[str, Any]) -> Dict[str, Any]:
        items = self._read_all()
        updated = False
        for i, idx in enumerate(items):
            if idx.get("id") == item:
                items[i] = body
                updated = True
                break
        if not updated:
            items.append(body)
        self._write_all(items)
        return body

    async def upsert_item(self, body: Dict[str, Any]) -> Dict[str, Any]:
        item_id = body.get("id")
        return await self.replace_item(item_id, body)

    async def delete_item(self, item: str, partition_key: Any) -> None:
        items = self._read_all()
        filtered = [idx for idx in items if idx.get("id") != item]
        self._write_all(filtered)

    async def query_items(self, query: str, parameters: List[Dict[str, Any]] = None):
        """Mock local query filters"""
        items = self._read_all()
        matched_items = list(items)
        parameters = parameters or []

        for p in parameters:
            param_name = p["name"]
            val = p["value"]
            
            field_name = None
            parts = query.split()
            for idx, part in enumerate(parts):
                if param_name in part:
                    if "=" in part:
                        left = part.split("=")[0]
                        field_name = left.replace("c.", "").strip()
                    elif idx > 1 and parts[idx - 1] == "=":
                        field_name = parts[idx - 2].replace("c.", "").strip()
                    elif idx > 0 and "=" in parts[idx - 1]:
                        field_name = parts[idx - 1].replace("c.", "").replace("=", "").strip()
            
            if field_name:
                matched_items = [item for item in matched_items if item.get(field_name) == val]

        query_lower = query.lower()
        if "order by" in query_lower:
            try:
                order_part = query_lower.split("order by")[1].strip()
                order_field = order_part.split()[0].replace("c.", "").strip()
                is_desc = "desc" in order_part
                matched_items.sort(key=lambda x: x.get(order_field, ""), reverse=is_desc)
            except Exception:
                pass

        class AsyncIterator:
            def __init__(self, lst):
                self.lst = lst
                self.idx = 0
            def __aiter__(self):
                return self
            async def __anext__(self):
                if self.idx >= len(self.lst):
                    raise StopAsyncIteration
                val = self.lst[self.idx]
                self.idx += 1
                return val

        return AsyncIterator(matched_items)

class LiveFirestoreCollectionProxy:
    """Live GCP Firestore collection proxy translating Cosmos APIs to Firestore Async Client"""
    def __init__(self, client: firestore.AsyncClient, collection_name: str):
        self.client = client
        self.collection_name = collection_name

    async def create_item(self, body: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = body.get("id")
        ref = self.client.collection(self.collection_name).document(doc_id)
        await ref.set(body)
        return body

    async def read_item(self, item: str, partition_key: Any) -> Dict[str, Any]:
        ref = self.client.collection(self.collection_name).document(item)
        doc = await ref.get()
        if not doc.exists:
            raise CosmosResourceNotFoundError(f"Document {item} not found in collection {self.collection_name}")
        return doc.to_dict()

    async def replace_item(self, item: str, body: Dict[str, Any]) -> Dict[str, Any]:
        ref = self.client.collection(self.collection_name).document(item)
        await ref.set(body)
        return body

    async def upsert_item(self, body: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = body.get("id")
        ref = self.client.collection(self.collection_name).document(doc_id)
        await ref.set(body, merge=True)
        return body

    async def delete_item(self, item: str, partition_key: Any) -> None:
        ref = self.client.collection(self.collection_name).document(item)
        await ref.delete()

    async def query_items(self, query: str, parameters: List[Dict[str, Any]] = None):
        """Translates basic Cosmos SQL strings to Firestore where queries"""
        ref = self.client.collection(self.collection_name)
        parameters = parameters or []

        for p in parameters:
            param_name = p["name"]
            val = p["value"]
            
            field_name = None
            parts = query.split()
            for idx, part in enumerate(parts):
                if param_name in part:
                    if "=" in part:
                        left = part.split("=")[0]
                        field_name = left.replace("c.", "").strip()
                    elif idx > 1 and parts[idx - 1] == "=":
                        field_name = parts[idx - 2].replace("c.", "").strip()
                    elif idx > 0 and "=" in parts[idx - 1]:
                        field_name = parts[idx - 1].replace("c.", "").replace("=", "").strip()
            
            if field_name:
                ref = ref.where(field_name, "==", val)

        query_lower = query.lower()
        if "order by" in query_lower:
            try:
                order_part = query_lower.split("order by")[1].strip()
                order_field = order_part.split()[0].replace("c.", "").strip()
                direction = firestore.Query.DESCENDING if "desc" in order_part else firestore.Query.ASCENDING
                ref = ref.order_by(order_field, direction=direction)
            except Exception:
                pass

        docs = await ref.get()
        results = [doc.to_dict() for doc in docs]

        class AsyncIterator:
            def __init__(self, lst):
                self.lst = lst
                self.idx = 0
            def __aiter__(self):
                return self
            async def __anext__(self):
                if self.idx >= len(self.lst):
                    raise StopAsyncIteration
                val = self.lst[self.idx]
                self.idx += 1
                return val

        return AsyncIterator(results)

class FirestoreDBClient:
    """GCP Firestore client wrapper falling back to Local JSON DB if project unconfigured"""
    def __init__(self, project_id: str, database_id: str = "(default)"):
        self.project_id = project_id
        self.database_id = database_id
        self.client: Optional[firestore.AsyncClient] = None
        self.containers: Dict[str, Any] = {}
        self.is_mock = not project_id or "your-gcp-project" in project_id.lower()

    async def connect(self):
        if self.is_mock:
            logger.info("Initializing Local JSON Firestore Emulator Mock...")
            self._initialize_containers()
            return

        try:
            logger.info(f"Connecting to Cloud Firestore Database: {self.database_id}...")
            self.client = firestore.AsyncClient(
                project=self.project_id,
                database=self.database_id
            )
            self._initialize_containers()
            logger.info("Successfully connected to GCP Firestore database.")
        except Exception as e:
            logger.error(f"Failed to connect to GCP Firestore: {str(e)}")
            raise

    async def close(self):
        if self.client:
            await self.client.close()
            self.client = None
            self.containers = {}
            logger.info("GCP Firestore Client connection closed.")

    def _initialize_containers(self):
        collections = ["opportunities", "users", "documents", "analysis", "workflow_events", "what_if_conversations"]
        for c in collections:
            if self.is_mock:
                self.containers[c] = MockFirestoreCollectionProxy(c)
            else:
                self.containers[c] = LiveFirestoreCollectionProxy(self.client, c)

    def get_container(self, container_name: str) -> Any:
        return self.containers[container_name]

