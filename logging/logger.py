"""
Logging setup for the application
"""
import logging
import os

def setup_logging():
    log_dir = os.path.join(os.getcwd(), "logs")
    os.makedirs(log_dir, exist_ok=True)
    logging.basicConfig(
        filename=os.path.join(log_dir, "app.log"),
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s"
    )
