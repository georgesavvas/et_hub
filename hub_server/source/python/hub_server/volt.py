import os
import requests


ENV = os.environ
VOLT_API_URL = ENV.get("VOLT_API_URL")
API_VERSIONS = {
    "volt_shell": "v1",
    "volt_media": "v1",
    "rez": "v1",
}


def request(lib, method, data):
    api_v = API_VERSIONS[lib]
    url = f"http://{VOLT_API_URL}/{lib}/{api_v}/{method}"
    if not data:
        resp = requests.get(url, timeout=120)
    else:
        headers = {"Content-Type": "application/json"}
        resp = requests.post(url, headers=headers, json=data, timeout=120)
    return resp.json()


def volt_shell(method, data={}):
    resp = request("volt_shell", method, data)
    return resp


def volt_media(method, data={}):
    resp = request("volt_media", method, data)
    return resp


def get_projects():
    return volt_shell("projects").get("data")


def get_project(uri):
    return volt_shell(f"project/{uri}").get("data")


def get_project_by_name(name):
    return volt_shell(f"project_by_name/{name}").get("data")


def convert_sequence(source, dest):
    return volt_media("convert_sequence", {"source": source, "dest": dest}).get("data")


def get_env(packages):
    return request("rez", "get_env", {"packages": packages})
