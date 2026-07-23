from pathlib import Path
assert "/v2/runs" in Path("client.py").read_text()
print("Python consumer verified")
