import datetime

import uvicorn
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from redis import Redis
from rq import Queue
from rq_scheduler import Scheduler

from hub_server import tools, router
from hub_server.tasks import farm_snapshot_extended, farm_snapshot
from hub_server.tasks import hosts_snapshot, make_project_reels, cuenotify_run
from hub_server.tasks import fetch_licenses


LOGGER = tools.get_logger(__name__)

app = FastAPI()
app.include_router(router)
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
schedule_job(cuenotify_run, 10)
schedule_job(fetch_licenses, 10)
schedule_job(hosts_snapshot, 30)
schedule_job(make_project_reels, 21600)


@app.on_event("startup")
def startup_event():
    router.mount_reels()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8085,
        log_level="info",
        reload=True,
        workers=8
    )
