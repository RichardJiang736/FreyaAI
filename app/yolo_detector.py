import cv2
import time
import os
from ultralytics import YOLO
import numpy as np
from typing import Optional, Tuple, Dict
import base64

class YOLOEmotionDetector:
    def __init__(self, model_path: str = None):  # type: ignore
        """
        Initialize the YOLO emotion detector.
        
        Args:
            model_path: Path to the YOLO model file. If None, uses the default model.
        """
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "best.onnx")
        
        self.model = YOLO(model_path, task='classify')
        self.supported_emotions = ['Angry', 'Fearful', 'Happy', 'Neutral', 'Sad']
    
    def detect_emotion_from_frame(self, frame: np.ndarray) -> Dict:
        """
        Detect emotion from a single frame and return annotated image.
        
        Args:
            frame: Input image frame (BGR format)
            
        Returns:
            Dictionary with detected emotion, confidence, and annotated image
        """
        # Convert the frame to grayscale
        gray_image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Convert grayscale to 3-channel image
        gray_image_3d = cv2.merge([gray_image, gray_image, gray_image])
        
        # Perform inference
        results = self.model(gray_image_3d)
        result = results[0]
        
        # Extract detected emotion label if available
        detected_emotion = None
        confidence = 0.0
        
        if hasattr(result, 'names') and hasattr(result, 'probs') and hasattr(result, 'boxes'):
            # If YOLO result has class indices and probabilities
            if len(result.boxes) > 0:
                class_idx = int(result.boxes.cls[0])
                detected_emotion = result.names[class_idx]
                confidence = float(result.boxes.conf[0]) if hasattr(result.boxes, 'conf') else 0.0
        elif hasattr(result, 'probs') and hasattr(result, 'names'):
            # If YOLO result has probabilities for each class (e.g., classification model)
            class_idx = int(result.probs.top1)
            detected_emotion = result.names[class_idx]
            confidence = float(result.probs.top1conf)
        
        # Plot results on the frame
        try:
            annotated_frame = result.plot()
        except AttributeError:
            print("Error: plot() method not available for results.")
            annotated_frame = frame.copy()
        
        # Convert annotated frame to base64 for sending to frontend
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        annotated_image_base64 = base64.b64encode(buffer).decode('utf-8')  # type: ignore
        
        return {
            'emotion': detected_emotion,
            'confidence': confidence,
            'annotated_image': annotated_image_base64
        }
    
    def detect_emotion_from_base64(self, image_data: str) -> Dict:
        """
        Detect emotion from a base64 encoded image.
        
        Args:
            image_data: Base64 encoded image data
            
        Returns:
            Dictionary with detected emotion, confidence, and annotated image
        """
        try:
            # Remove data URL prefix if present
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            
            # Decode base64 image
            image_data = base64.b64decode(image_data)  # type: ignore
            image_array = np.frombuffer(image_data, np.uint8)  # type: ignore
            frame = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            
            # Detect emotion from frame
            return self.detect_emotion_from_frame(frame)
        except Exception as e:
            print(f"Error processing image: {e}")
            return {
                'emotion': None,
                'confidence': 0.0,
                'annotated_image': None,
                'error': str(e)
            }
    
    def detect_emotion_from_camera(self, duration: float = 5.0) -> Dict:
        """
        Detect emotion from camera feed for a specified duration.
        
        Args:
            duration: Duration in seconds to capture frames (minimum 5 seconds)
            
        Returns:
            Dictionary with detected emotion, confidence, and annotated image
        """
        # Ensure minimum duration of 5 seconds
        duration = max(duration, 5.0)
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Failed to open camera")
            return {
                'emotion': None,
                'confidence': 0.0,
                'annotated_image': None,
                'error': 'Failed to open camera'
            }
            
        start_time = time.time()
        result = {
            'emotion': None,
            'confidence': 0.0,
            'annotated_image': None
        }
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to grab frame.")
                    break
                
                # Detect emotion from frame
                result = self.detect_emotion_from_frame(frame)
                
                # Exit after specified duration or if ESC is pressed
                if (time.time() - start_time) > duration or cv2.waitKey(1) == 27:
                    break
                    
        finally:
            cap.release()
            cv2.destroyAllWindows()
            
        return result