import os
import json
from pathlib import Path

from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles

from hub_server.tools import get_logger
from hub_server.views.farm import farm_data
from hub_server.views.studio_jobs import project_reels
from hub_server.views.licenses import format_licenses
from hub_server.api import get_render_records


LOGGER = get_logger(__name__)
ENV = os.environ
REEL_PATH = Path("/transfer/hub/reels")


api_version = ENV["HUB_SERVER_API_VERSION"]
router = APIRouter(
    prefix=f"/api/{api_version}"
)


def mount_reels():
    if not REEL_PATH.is_dir():
        LOGGER.warning(f"Couldn't mount {REEL_PATH} as it doesn't exist...")
        return
    LOGGER.debug(f"Attempting to mount {REEL_PATH}")
    router.mount(
        "/reels", StaticFiles(directory=REEL_PATH), name="reels"
    )
    LOGGER.debug("Mounted on /reels")


@router.get("/data/farm/{query}")
async def data_farm(query):
    queries = {
        "jobs": farm_data
    }

    if query not in queries:
        response = json.jsonify({"text": "Invalid query."})
        return response

    data = queries[query]()
    return {"data": data}


@router.get("/data/projects")
async def data_projects(query):
    data = project_reels()
    return {"data": data}


@router.get("/get_render_data/{name}")
async def get_render_data(name):
    data = get_render_records(name)
    return {"data": data}


@router.get("/data/licenses")
async def data_licenses(query):
    data = format_licenses()
    return {"data": data}
