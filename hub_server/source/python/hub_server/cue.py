import os
import requests


ENV = os.environ
CUE_API_URL = ENV.get("CUE_API_URL")
API_VERSION = "v1"


def request(method, data=None):
    url = f"http://{CUE_API_URL}/api/{API_VERSION}/{method}"
    if not data:
        resp = requests.get(url)
    else:
        headers = {"Content-Type": "application/json"}
        resp = requests.post(url, headers=headers, json=data)
    return resp.json()


def get_jobs(**kwargs):
    resp = request("get_jobs", kwargs)
    return resp["data"]


def get_active_shows():
    resp = request("active_shows")
    return resp["data"]
