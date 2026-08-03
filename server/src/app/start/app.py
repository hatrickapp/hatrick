from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError

from server.src.app.errors.base import AppError
from server.src.app.errors.handler import app_error_handler, http_exception_handler, request_validation_error_handler
from server.src.app.routers.authentication.auth_router import router as auth_router
from server.src.app.routers.billing.billing_router import router as billing_router
from server.src.app.routers.health import router as health_router
from server.src.app.routers.leagues.leagues_router import router as leagues_router
from server.src.app.routers.predictions.predictions_router import router as predictions_router
from server.src.app.routers.realtime.realtime_router import router as realtime_router
from server.src.app.routers.sports.sports_router import router as sports_router
from server.src.app.routers.users.users_router import router as users_router
from server.src.app.start.context import lifespan
from server.src.app.start.middleware import setup_middleware

def create_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)
    
    setup_middleware(app)
    
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)
    
    app.include_router(auth_router)
    app.include_router(billing_router)
    app.include_router(sports_router)
    app.include_router(predictions_router)
    app.include_router(leagues_router)
    app.include_router(users_router)
    app.include_router(realtime_router)
    app.include_router(health_router)
    
    return app
