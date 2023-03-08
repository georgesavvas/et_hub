import datetime
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from redis import Redis
from rq_scheduler import Scheduler

from hub_server import tools
from hub_server.routers import data_v1
from hub_server.tasks.farm_snapshot import farm_snapshot_extended, farm_snapshot
from hub_server.tasks.make_reels import make_reels
from hub_server.tasks.cue_notify import cue_notify
from hub_server.tasks.fetch_licenses import fetch_licenses


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

SCHEDULER = Scheduler(connection=Redis())


def schedule_job(func, interval, timeout=600):
    if func.__name__ in [j.func_name for j in remaining_jobs]:
        return
    SCHEDULER.schedule(
        scheduled_time=datetime.datetime.utcnow(),
        func=func,
        args=None,
        kwargs=None,
        interval=interval,
        repeat=None,
        timeout=timeout
    )


for job in SCHEDULER.get_jobs():
    SCHEDULER.cancel(job)


remaining_jobs = list(SCHEDULER.get_jobs())
schedule_job(farm_snapshot, 10)
schedule_job(farm_snapshot_extended, 30)
schedule_job(cue_notify, 10)
schedule_job(fetch_licenses, 10)
schedule_job(make_reels, 21600)


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
