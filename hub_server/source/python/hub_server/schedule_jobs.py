import datetime

from redis import Redis
from rq_scheduler import Scheduler

from hub_server.tasks.farm_snapshot import farm_snapshot, farm_snapshot_extended
from hub_server.tasks.make_reels import make_reels
from hub_server.tasks.cue_notify import cue_notify
from hub_server.tasks.fetch_licenses import fetch_licenses


SCHEDULER = Scheduler(connection=Redis())


def schedule_job(func, interval, remaining_jobs):
    if func.__name__ in [j.func_name for j in remaining_jobs]:
        return
    SCHEDULER.schedule(
        scheduled_time=datetime.datetime.utcnow(),
        func=func,
        args=None,
        kwargs=None,
        interval=interval,
        repeat=None
    )


if __name__ == "__main__":
    for job in SCHEDULER.get_jobs():
        SCHEDULER.cancel(job)

    remaining_jobs = list(SCHEDULER.get_jobs())
    schedule_job(farm_snapshot, 10, remaining_jobs)
    schedule_job(farm_snapshot_extended, 30, remaining_jobs)
    schedule_job(cue_notify, 10, remaining_jobs)
    schedule_job(fetch_licenses, 10, remaining_jobs)
    schedule_job(make_reels, 21600, remaining_jobs)
