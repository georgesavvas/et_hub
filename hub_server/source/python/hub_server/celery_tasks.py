import os
import datetime
import requests

from celery import Celery
from starlette.websockets import WebSocketState

import hub_server.tasks as hub_tasks
from hub_server.tools import get_logger


LOGGER = get_logger(__name__)
ENV = os.environ
RABBITMQ_URL = ENV.get("RABBITMQ_URL")
REDIS_URL = ENV.get("REDIS_URL")
HUB_SERVER_URL = ENV.get("HUB_SERVER_URL")


app = Celery(
    "hub_server",
    broker=f"redis://{REDIS_URL}/0",
    backend=f"redis://{REDIS_URL}/0",
    include=["hub_server.celery_tasks"],
)
app.conf.update(
    broker_connection_retry_on_startup=True,
    task_routes={"hub_server.*": {"queue": "hub"}},
)


def broadcast(task_id, data):
    headers = {"Content-Type": "application/json"}
    data = {"task_id": task_id, "data": data}
    print(f"http://{HUB_SERVER_URL}/api/v1/broadcast_tasks_update")
    requests.post(
        f"http://{HUB_SERVER_URL}/api/v1/broadcast_tasks_update",
        headers=headers,
        json=data
    )


@app.task(bind=True)
def task(self, fn, *args, **kwargs):
    return fn(*args, **kwargs)


@app.task(bind=True)
def farm_snapshot(self, *args, **kwargs):
    return hub_tasks.farm_snapshot(*args, **kwargs)


@app.task(bind=True)
def farm_snapshot_extended(self, *args, **kwargs):
    return hub_tasks.farm_snapshot_extended(*args, **kwargs)


@app.task(bind=True)
def volt_notify(self, *args, **kwargs):
    return hub_tasks.volt_notify(*args, **kwargs)


@app.task(bind=True)
def make_reels(self, *args, **kwargs):
    return hub_tasks.make_reels(*args, **kwargs)


@app.task(bind=True)
def fetch_licenses(self, *args, **kwargs):
    return hub_tasks.fetch_licenses(*args, **kwargs)


@app.task(bind=True)
def cue_notify(self, *args, **kwargs):
    return hub_tasks.cue_notify(*args, **kwargs)
