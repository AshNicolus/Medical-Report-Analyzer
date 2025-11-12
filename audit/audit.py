"""
Audit logging for compliance
"""
import logging

def log_audit(filename, entities, recommendations):
    logging.info(f"AUDIT: File {filename} processed. Entities: {entities}. Recommendations: {recommendations}")
