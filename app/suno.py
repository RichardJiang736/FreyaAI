import os
import requests
import time
import logging

# Set up logging
logger = logging.getLogger(__name__)

SUNO_API_BASE_URL = "https://api.sunoapi.org/api/v1"

def generate_music(api_key, prompt, custom_mode=False, instrumental=False, model="V3_5"):
    """
    Generate music using Suno API
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "prompt": prompt,
        "customMode": custom_mode,
        "instrumental": instrumental,
        "callBackUrl": "https://api.example.com/callback",
        "model": model
    }
    
    try:
        logger.info(f"Sending request to Suno API with prompt: {prompt}")
        response = requests.post(f"{SUNO_API_BASE_URL}/generate", headers=headers, json=payload)                
        response.raise_for_status()
        data = response.json()
        
        # Check if the response contains the expected data structure
        if 'data' not in data:
            raise ValueError(f"Unexpected API response: {data}")
        
        logger.info(f"Music generation initiated with task data: {data.get('data')}")
        return data.get('data')
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error generating music: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error generating music: {str(e)}")
        raise

def check_status(api_key, task_id):
    """
    Check the status of a music generation task
    """
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    # Try using the task ID directly as a parameter
    params = {"taskId": task_id}
    
    try:
        logger.info(f"Checking status for task ID: {task_id}")
        response = requests.get(f"{SUNO_API_BASE_URL}/generate/record-info", headers=headers, params=params)
        response.raise_for_status()
        task_data = response.json().get("data", [])
        
        if task_data:
            status = task_data.get("status")
            logger.info(f"Task status: {status}")
            return status
        logger.warning("No task data found in response")
        return None
    except Exception as e:
        logger.error(f"Error checking status: {str(e)}")
        raise

def get_music_data(api_key, task_id):
    """
    Get the music data once generation is complete
    """
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    # Use the task ID directly as a parameter
    params = {"taskId": task_id}
    
    try:
        logger.info(f"Checking status for task ID: {task_id}")
        response = requests.get(f"{SUNO_API_BASE_URL}/generate/record-info", headers=headers, params=params)
        response.raise_for_status()
        task_data = response.json().get("data", [])
        
        if task_data:
            status = task_data.get("status")
            logger.info(f"Task status: {status}")
            return task_data
        logger.warning("No task data found in response")
        return None
    except Exception as e:
        logger.error(f"Error getting music data: {str(e)}")
        raise

def wait_for_completion(api_key, task_id, max_wait_time=300):
    """
    Wait for music generation to complete
    """
    logger.info(f"Waiting for completion of task ID: {task_id}")
    start_time = time.time()
    while time.time() - start_time < max_wait_time:
        try:
            status = check_status(api_key, task_id)
            if status == "SUCCESS":
                logger.info("Music generation completed successfully")
                return True
            elif status == "FAILED":
                raise RuntimeError("Music generation failed")
            elif status is None:
                logger.warning("Status check returned no data")
            time.sleep(5)  # Wait 5 seconds before checking again
        except Exception as e:
            logger.error(f"Error while waiting for completion: {str(e)}")
            raise
    raise TimeoutError("Music generation timed out")

def get_audio_url(api_key, task_id):
    """
    Get the audio URL for the generated music
    """
    try:
        logger.info(f"Getting audio URL for task ID: {task_id}")
        music_data = get_music_data(api_key, task_id)
        if music_data and music_data.get("response") and music_data["response"].get("sunoData"):
            suno_data = music_data["response"]["sunoData"][0]
            audio_url = suno_data.get("audioUrl")
            logger.info(f"Audio URL retrieved: {audio_url}")
            return audio_url
        logger.warning("No audio URL found in music data")
        return None
    except Exception as e:
        logger.error(f"Error getting audio URL: {str(e)}")
        raise

def get_status_description(status):
    """
    Get a user-friendly description for a status value
    """
    descriptions = {
        'PENDING': 'Your request is in the queue',
        'TEXT_SUCCESS': 'Text processing complete. Generating music',
        'FIRST_SUCCESS': 'Last touches...',
        'SUCCESS': 'Music generation completed',
        'FAILED': 'Music generation failed'
    }
    return descriptions.get(status, status)