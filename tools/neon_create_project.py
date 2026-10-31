#!/usr/bin/env python3
"""Create a Neon project via the custom.neon helper's API call path.
Prints only the new project id/name/region (never credentials)."""
import importlib.util
import sys

spec = importlib.util.spec_from_file_location(
    "neon_api", "/home/hatch/workspace/custom-connectors/custom.neon/bin/neon_api.py"
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

name = sys.argv[1] if len(sys.argv) > 1 else "plaza"
org_id = m.get_org_id()
st, body = m.call("POST", "/projects", body={
    "project": {"name": name, "region_id": "aws-ap-southeast-1", "org_id": org_id}
})
print("status:", st)
if st in (200, 201):
    p = body.get("project", body)
    print("id:", p.get("id"))
    print("name:", p.get("name"))
    print("region_id:", p.get("region_id"))
else:
    print("body:", body)
    sys.exit(1)
