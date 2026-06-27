import uvicorn
import os

if __name__ == "__main__":
    # Ensure export directory exists
    os.makedirs("./exports", exist_ok=True)
    print("Starting ProspectPilot AI Platform API Service on http://localhost:8000")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
