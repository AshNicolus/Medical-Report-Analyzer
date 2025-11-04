"""
Azure OpenAI GPT integration for clinical entity extraction and recommendation
"""
import requests
import json

# Hardcoded API key (for demo only; do NOT use in production)
AZURE_OPENAI_API_KEY = "xxxxxxxxxxx"
AZURE_ENDPOINT = "xxxxxxxxxxxx"
DEPLOYMENT_NAME = "gpt-4o"
API_VERSION = "2024-08-01-preview"

HEADERS = {
    "Content-Type": "application/json",
    "api-key": AZURE_OPENAI_API_KEY
}

def call_azure_gpt(prompt):
    url = f"{AZURE_ENDPOINT}/openai/deployments/{DEPLOYMENT_NAME}/chat/completions?api-version={API_VERSION}"
    payload = {
        "messages": [
            {"role": "system", "content": "You are a clinical assistant that extracts medical entities and recommends diagnostic tests."},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1024,
        "temperature": 0.2
    }
    try:
        response = requests.post(url, headers=HEADERS, data=json.dumps(payload))
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error calling Azure OpenAI: {str(e)}"

# Example usage
if __name__ == "__main__":
    sample_text = "Patient reports severe pain and swelling. Diagnosed with diabetes."
    prompt = f"Extract clinical entities and recommend diagnostic tests for this report: {sample_text}"
    gpt_response = call_azure_gpt(prompt)
    print("Azure GPT Response:", gpt_response)

# SECURITY NOTE:
# Hardcoding API keys is NOT recommended for production. Use secure vaults, environment variables, or managed identity for secrets.
