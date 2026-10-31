#!/usr/bin/env python3
"""Create a GitHub repo via the custom.github credential path.
Usage: github_create_repo.py <name> [description]"""
import json
import sys
import urllib.error
import urllib.request

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request, read_json_response

API = "https://api.github.com"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        raise RuntimeError("redirect refused")

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    data = None
    if body is not None:
        req.add_header("Content-Type", "application/json")
        data = json.dumps(body).encode()
    add_surrogate_to_request(req, "custom.github", allowed_hosts=["api.github.com"])
    try:
        with urllib.request.build_opener(NoRedirect()).open(req, data=data, timeout=60) as r:
            return r.status, read_json_response(r)
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw or b"null")
        except Exception:
            return e.code, raw.decode(errors="replace")

name = sys.argv[1]
desc = sys.argv[2] if len(sys.argv) > 2 else ""
st, body = call("GET", f"/repos/watengu/{name}")
if st == 200:
    print("exists:", body.get("full_name"))
    sys.exit(0)
st, body = call("POST", "/user/repos", {"name": name, "description": desc, "private": False, "auto_init": True})
print("create status:", st)
if st in (200, 201):
    print("full_name:", body.get("full_name"))
    print("default_branch:", body.get("default_branch"))
else:
    print("body:", body)
    sys.exit(1)
