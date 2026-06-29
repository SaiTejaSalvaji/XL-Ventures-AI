import requests
import time


def test_pipeline():
    url_analyze = "http://127.0.0.1:8001/analyze"
    payload = {
        "industry": "AI FinTech",
        "stage": "Seed",
        "location": "India",
        "tech_keywords": ["machine learning", "predictive analytics"],
    }

    print("1. Starting analysis...")
    resp = requests.post(url_analyze, json=payload)
    job = resp.json()
    job_id = job["job_id"]
    print(f"Job ID: {job_id}")

    print("\n2. Polling for results...")
    while True:
        res_resp = requests.get(
            f"http://127.0.0.1:8001/{job_id}"
            if "results/" in url_analyze
            else f"http://127.0.0.1:8001/results/{job_id}"
        )
        res_data = res_resp.json()
        status = res_data.get("status")
        step = res_data.get("current_step")
        print(f"Status: {status} | Current Step: {step}")
        if status in ["done", "error"]:
            break
        time.sleep(3)

    if status == "done":
        print("\n3. Verification Successful! Results retrieved:\n")
        for c in res_data.get("companies", []):
            name = c.get("name")
            url = c.get("url")
            score = c.get("score")
            tier = c.get("tier")
            founders = ", ".join(
                [f"{f.get('name')} ({f.get('title')})" for f in c.get("founders", [])]
            )
            report = c.get("report", "")

            print(f"- Company: {name}")
            print(f"  URL: {url}")
            print(f"  Score: {score} ({tier})")
            print(f"  Founders: {founders}")
            print(f"  Report snippet:\n{report[:300]}...\n")
            print("-" * 50)
    else:
        print(f"\nJob failed with error: {res_data}")


if __name__ == "__main__":
    test_pipeline()
