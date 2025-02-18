import os

import requests
from dotenv import load_dotenv

load_dotenv()

backend_url = os.getenv("backend_url", default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    "sentiment_analyzer_url", default="http://localhost:5050/"
)


def get_request(endpoint, **kwargs):
    params = (
        "&".join(f"{key}={value}" for key, value in kwargs.items()) if kwargs else ""
    )
    request_url = f"{backend_url}{endpoint}?{params}"

    print(f"GET from {request_url}")
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        data = response.json()
        print("Response JSON:", data)  # Debugging output
        return data
    except requests.exceptions.Timeout:
        print("Error: Request timed out.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Network exception occurred: {e}")  # 🔴 Print full error
        return None


def analyze_review_sentiments(text):
    request_url = f"{sentiment_analyzer_url}analyze/{text}"
    try:
        # Call get method of requests library with URL and parameters
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        print(f"Unexpected error: {err}, {type(err)}")
        print("Network exception occurred")


def post_review(data_dict):
    request_url = f"{backend_url}/insert_review"
    try:
        response = requests.post(request_url, json=data_dict)
        print(response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Network exception occurred: {e}")
