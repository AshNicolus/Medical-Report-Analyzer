"""
Launcher script to run FastAPI server and validate setup
"""
import os
import subprocess

def run_server():
    os.system("uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload")

def run_tests():
    subprocess.run(["pytest", "tests/"])

if __name__ == "__main__":
    print("Starting Medical Diagnostic Test Recommendation System...")
    run_server()
