import urllib.request

def create_job(base_url: str):
    request = urllib.request.Request(f"{base_url}/v1/jobs", method="POST")
    return urllib.request.urlopen(request).read()
