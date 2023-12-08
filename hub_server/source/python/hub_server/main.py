from pathlib import Path

import os
import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from opentelemetry.propagate import inject

from hub_server import tools
from hub_server.routers import data_v1
from hub_server.observability import PrometheusMiddleware, metrics, setting_otlp


LOGGER = tools.get_logger(__name__)
APP_NAME = "hub_server"
OTLP_GRPC_ENDPOINT = os.environ.get("OTLP_GRPC_ENDPOINT", "http://tempo:4317")
REEL_PATH = Path("/transfer/hub/reels")


app = FastAPI()
app.add_middleware(PrometheusMiddleware, app_name=APP_NAME)
app.add_route("/metrics", metrics)

# Setting OpenTelemetry exporter
setting_otlp(app, APP_NAME, OTLP_GRPC_ENDPOINT)

app.include_router(data_v1.router, prefix="/api/v1")
app.include_router(data_v1.router, prefix="/api/latest")
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def mount_reels():
    if not REEL_PATH.is_dir():
        LOGGER.warning(f"Couldn't mount {REEL_PATH} as it doesn't exist...")
        return
    LOGGER.debug(f"Attempting to mount {REEL_PATH}")
    app.mount(
        "/data/reel", StaticFiles(directory=REEL_PATH.as_posix()), name="reels"
    )
    LOGGER.debug("Mounted on /data/reel")


@app.on_event("startup")
def startup_event():
    mount_reels()


class EndpointFilter(logging.Filter):
    def __init__(
        self,
        path,
        *args,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self._path = path

    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find(self._path) == -1


uvicorn_logger = logging.getLogger("uvicorn.access")
uvicorn_logger.addFilter(EndpointFilter(path="/metrics"))


if __name__ == "__main__":
    uvicorn.run(
        f"{__name__}:app",
        host="0.0.0.0",
        port=8080,
        log_level="info",
        workers=4,
        reload=True,
    )
