from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from engine import NeuroEngine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NeuroFlow API")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    wake_time: str
    sleep_time: str
    actual_sleep_hours: float

class Task(BaseModel):
    title: str
    quadrant: str = None

@app.post("/analyze-bio")
async def analyze_bio(profile: UserProfile):
    zones = NeuroEngine.calculate_circadian_zones(profile.wake_time, profile.sleep_time)
    # Sleep Debt logic: if < 7h, trigger light mode
    is_sleep_deprived = profile.actual_sleep_hours < 7.0
    return {"zones": zones, "light_mode": is_sleep_deprived}

@app.post("/tasks/auto-prioritize")
async def prioritize_task(task: Task):
    assigned_q = NeuroEngine.ai_prioritize(task.title)
    return {"title": task.title, "quadrant": assigned_q}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)