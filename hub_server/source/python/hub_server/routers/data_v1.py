import os
import json

from fastapi import APIRouter, Request

from hub_server.tools import get_logger, process_request
from hub_server.views.farm import farm_data, get_core_seconds
from hub_server.views.farm import get_render_records
from hub_server.views.studio_jobs import project_reels
from hub_server.views.licenses import format_licenses


LOGGER = get_logger(__name__)
ENV = os.environ

router = APIRouter()


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
async def data_projects(request: Request):
    data = project_reels()
    return {"data": data}


@router.get("/data/render/{name}")
async def data_render(name):
    data = get_render_records(name)
    return {"data": data}


@router.get("/data/licenses")
async def data_licenses(request: Request):
    await process_request(request)
    data = format_licenses()
    return {"data": data}


@router.post("/data/core_seconds")
async def data_core_seconds(request: Request):
    result = await request.json()
    data = get_core_seconds(result.get("data"))
    return {"data": data}
