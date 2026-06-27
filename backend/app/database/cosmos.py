# pyrefly: ignore [missing-import]
from azure.cosmos import exceptions, ContainerProxy, DatabaseProxy, PartitionKey
from azure.cosmos.aio import CosmosClient
from azure.cosmos.exceptions import CosmosResourceNotFoundError
from azure.identity.aio import ChainedTokenCredential

import logging
import os
import json
from typing import Dict, List, Any, Optional

# Configure logging
logger = logging.getLogger("app.database.cosmos")

class MockContainerProxy:
    """Mock ContainerProxy that stores data in local JSON files"""
    def __init__(self, container_name: str):
        self.container_name = container_name
        self.db_dir = "./local_db"
        self.db_path = os.path.join(self.db_dir, f"{container_name}.json")
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
        # Prevent duplicate IDs
        items = [item for item in items if item.get("id") != body.get("id")]
        items.append(body)
        self._write_all(items)
        return body

    async def read_item(self, item: str, partition_key: Any) -> Dict[str, Any]:
        items = self._read_all()
        for idx in items:
            if idx.get("id") == item:
                return idx
        raise CosmosResourceNotFoundError(message=f"Item {item} not found in container {self.container_name}")

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
        """Mock SQL query parser for basic SELECT * FROM c queries"""
        items = self._read_all()
        matched_items = list(items)
        parameters = parameters or []

        # Parse filters
        for p in parameters:
            param_name = p["name"] # e.g. "@is_active"
            val = p["value"]
            
            # Simple field extraction logic
            field_name = None
            query_lower = query.lower()
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

        # Parse ordering
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

class CosmosDBClient:
    """Azure Cosmos DB client wrapper with Mock local file fallback"""

    def __init__(self, database: str, endpoint: str, credential: str | ChainedTokenCredential):
        self.database = database
        self.endpoint = endpoint
        self.credential = credential
        self.client: CosmosClient = None
        self.database_proxy: DatabaseProxy = None
        self.containers: Dict[str, ContainerProxy | MockContainerProxy] = {}
        self.is_mock = not endpoint or "documents.azure.com" not in endpoint

    async def connect(self):
        """Initialize Cosmos DB connection or fallback to Local DB"""
        if self.is_mock:
            logger.info("Initializing Local JSON-based Database (Mock Cosmos Mode)...")
            self._initialize_containers()
            return

        logger.info("Connecting to real Cosmos DB...")
        try:
            self.client = CosmosClient(
                url=self.endpoint,
                credential=self.credential
            )
            self.database_proxy = self.client.get_database_client(database=self.database)
            self._initialize_containers()
            logger.info("Successfully connected to Cosmos DB")
        except Exception as e:
            logger.error(f"Failed to connect to Cosmos DB: {str(e)}")
            raise

    async def close(self):
        """Close Cosmos DB connection"""
        if self.client:
            await self.client.close()
            self.client = None
            self.database_proxy = None
            self.containers = {}
            logger.info("Cosmos DB connection closed")

    def _initialize_containers(self):
        """Initialize all required containers"""
        containers_config = [
            {"id": "opportunities"},
            {"id": "users"},
            {"id": "documents"},
            {"id": "analysis"},
            {"id": "workflow_events"},
            {"id": "what_if_conversations"}
        ]
        
        for container_config in containers_config:
            self._load_container(container_config["id"])

    def _load_container(self, container_name: str):
        """Ensure the container is initialized"""
        if container_name not in self.containers:
            if self.is_mock:
                self.containers[container_name] = MockContainerProxy(container_name)
            else:
                container = self.database_proxy.get_container_client(container=container_name)
                self.containers[container_name] = container

    def get_container(self, container_name: str) -> ContainerProxy | MockContainerProxy:
        """Get container by name"""
        return self.containers[container_name]
