from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from hub_server import tools
from hub_server.routers import data_v1


LOGGER = tools.get_logger(__name__)
REEL_PATH = Path("/transfer/hub/reels")

app = FastAPI()
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


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8085,
        log_level="info",
        workers=8
    )
