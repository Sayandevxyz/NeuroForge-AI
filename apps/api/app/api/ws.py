from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

class ConnectionManager:
    def __init__(self):
        # Map research_id -> List[WebSocket]
        self.research_rooms: Dict[str, List[WebSocket]] = {}
        # Global GPU subscribers
        self.gpu_clients: List[WebSocket] = []

    async def connect_research(self, research_id: str, websocket: WebSocket):
        await websocket.accept()
        if research_id not in self.research_rooms:
            self.research_rooms[research_id] = []
        self.research_rooms[research_id].append(websocket)

    def disconnect_research(self, research_id: str, websocket: WebSocket):
        if research_id in self.research_rooms:
            if websocket in self.research_rooms[research_id]:
                self.research_rooms[research_id].remove(websocket)

    async def broadcast_research(self, research_id: str, message: dict):
        if research_id in self.research_rooms:
            dead_clients = []
            for connection in self.research_rooms[research_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_clients.append(connection)
            for dead in dead_clients:
                self.disconnect_research(research_id, dead)

    async def connect_gpu(self, websocket: WebSocket):
        await websocket.accept()
        self.gpu_clients.append(websocket)

    def disconnect_gpu(self, websocket: WebSocket):
        if websocket in self.gpu_clients:
            self.gpu_clients.remove(websocket)

    async def broadcast_gpu(self, message: dict):
        dead_clients = []
        for connection in self.gpu_clients:
            try:
                await connection.send_json(message)
            except Exception:
                dead_clients.append(connection)
        for dead in dead_clients:
            self.disconnect_gpu(dead)


manager = ConnectionManager()
ws_router = APIRouter(tags=["WebSockets"])


@ws_router.websocket("/ws/research/{research_id}")
async def websocket_research_endpoint(websocket: WebSocket, research_id: str):
    await manager.connect_research(research_id, websocket)
    try:
        while True:
            # Keep connection alive & listen for client ping/messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_research(research_id, websocket)


@ws_router.websocket("/ws/gpu")
async def websocket_gpu_endpoint(websocket: WebSocket):
    await manager.connect_gpu(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_gpu(websocket)
