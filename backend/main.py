from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess, platform, re

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_traceroute(target: str):
    """Cross-platform traceroute generator"""
    system = platform.system()
    cmd = ["tracert", "-d", target] if system == "Windows" else ["traceroute", "-n", target]

    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        hop_number = 0
        for line in iter(process.stdout.readline, b""):
            text = line.decode().strip()
            hop_number += 1

            # Extract RTT in ms (supports Linux/Mac/Windows)
            times = re.findall(r"(\d+\.?\d*)\s*ms", text)
            times = [float(t) for t in times] if times else []
            avg_time = sum(times) / len(times) if times else None

            yield f'data: {{"hop": {hop_number}, "text": "{text}", "avg_time": {avg_time}}}\n\n'

    except FileNotFoundError:
        yield f'data: {{"hop": 0, "text": "Traceroute command not found.", "avg_time": null}}\n\n'
    except Exception as e:
        yield f'data: {{"hop": 0, "text": "Error: {str(e)}", "avg_time": null}}\n\n'

@app.get("/traceroute")
async def traceroute(target: str):
    return StreamingResponse(run_traceroute(target), media_type="text/event-stream")
