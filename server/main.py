import uvicorn
import os

from server.src.app.start.app import create_app

app = create_app()