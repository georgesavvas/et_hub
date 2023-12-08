import os
import requests

from celery import Celery
from celery.schedules import crontab
from celery.signals import task_failure

from . import celery_tasks


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


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    print("Setting up celery tasks")
    sender.add_periodic_task(
        30,
        celery_tasks.farm_snapshot.s(),
        name="farm_snapshot",
        expires=30,
    )
    # sender.add_periodic_task(
    #     60,
    #     celery_tasks.farm_snapshot_extended.s(),
    #     name="farm_snapshot_extended",
    #     expires=60,
    # )
    sender.add_periodic_task(
        10,
        celery_tasks.cue_notify.s(),
        name="cue_notify",
        expires=10,
    )
    sender.add_periodic_task(
        10,
        celery_tasks.volt_notify.s(),
        name="volt_notify",
        expires=10,
    )
    sender.add_periodic_task(
        10,
        celery_tasks.fetch_licenses.s(),
        name="fetch_licenses",
        expires=10,
    )
    sender.add_periodic_task(
        21600 * 2,
        celery_tasks.make_reels.s(),
        name="make_reels",
        expires=21600 * 2,
    )
    # Executes every Monday morning at 7:30 a.m.
    # sender.add_periodic_task(
    #     crontab(hour=7, minute=30, day_of_week=1),
    #     test.s('Happy Mondays!'),
    # )


def broadcast(task_id, data):
    headers = {"Content-Type": "application/json"}
    data = {"task_id": task_id, "data": data}
    requests.post(
        f"http://{HUB_SERVER_URL}/api/v1/broadcast_update",
        headers=headers,
        json=data
    )


@task_failure.connect()
def task_failure(task_id, *args, **kwargs):
    broadcast(task_id, {"state": "failed", **kwargs["kwargs"]})


if __name__ == "__main__":
    app.start()
