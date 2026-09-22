import os
import json
import base64
import numpy as np
import cv2

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models_ai")

YUNET_PATH = os.path.join(MODELS_DIR, "face_detection_yunet.onnx")
SFACE_PATH = os.path.join(MODELS_DIR, "face_recognition_sface.onnx")
HAAR_PATH = os.path.join(MODELS_DIR, "haarcascade_frontalface_default.xml")

# Recognition threshold for ArcFace / SFace cosine similarity (0.0 to 1.0)
# Standard SFace cosine threshold recommended by OpenCV is 0.363 for true positive verification.
# For college attendance with good lighting, 0.45 - 0.50 is optimal.
DEFAULT_THRESHOLD = float(os.getenv("FACE_RECOGNITION_THRESHOLD", "0.48"))

class FaceAI:
    def __init__(self):
        self.detector = None
        self.recognizer = None
        self.haar_cascade = None
        self._load_models()

    def _load_models(self):
        try:
            if os.path.exists(YUNET_PATH) and os.path.exists(SFACE_PATH):
                self.detector = cv2.FaceDetectorYN.create(
                    YUNET_PATH,
                    "",
                    (320, 320),
                    0.6,
                    0.3,
                    5000
                )
                self.recognizer = cv2.FaceRecognizerSF.create(
                    SFACE_PATH,
                    ""
                )
                print("[FaceAI] Loaded OpenCV YuNet and SFace (ArcFace) models successfully.")
        except Exception as e:
            print(f"[FaceAI] Error loading DNN models: {e}")

        # Optional Haar Cascade
        try:
            if hasattr(cv2, "CascadeClassifier") and os.path.exists(HAAR_PATH):
                self.haar_cascade = cv2.CascadeClassifier(HAAR_PATH)
            elif hasattr(cv2, "objdetect") and hasattr(cv2.objdetect, "CascadeClassifier") and os.path.exists(HAAR_PATH):
                self.haar_cascade = cv2.objdetect.CascadeClassifier(HAAR_PATH)
        except Exception:
            pass

    def decode_base64_image(self, base64_str: str) -> np.ndarray:
        """Decodes base64 data URI or raw base64 string to OpenCV BGR numpy array."""
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image from base64 string")
        return img

    def detect_faces(self, img: np.ndarray):
        """
        Detects faces in an image using YuNet.
        Returns (faces, count) where faces is an array of detected faces with bounding boxes & landmarks.
        """
        h, w, _ = img.shape
        if self.detector is not None:
            self.detector.setInputSize((w, h))
            _, faces = self.detector.detect(img)
            count = 0 if faces is None else len(faces)
            return faces, count
        elif self.haar_cascade is not None:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            rects = self.haar_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
            count = 0 if rects is None else len(rects)
            return rects, count
        else:
            return None, 0

    def extract_embedding(self, img: np.ndarray, face_info) -> np.ndarray:
        """
        Aligns face and computes 128-dimensional ArcFace/SFace deep embedding.
        """
        if self.recognizer is not None and face_info is not None:
            aligned_face = self.recognizer.alignCrop(img, face_info)
            feature = self.recognizer.feature(aligned_face)
            # Flatten and normalize
            vec = feature.flatten().astype(np.float32)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            return vec
        else:
            raise RuntimeError("Face recognizer model is not initialized.")

    def compute_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Computes cosine similarity between two normalized embeddings.
        Returns value between -1.0 and 1.0 (typical match >= 0.45).
        """
        norm1 = np.linalg.norm(emb1)
        norm2 = np.linalg.norm(emb2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(np.dot(emb1, emb2) / (norm1 * norm2))

    def process_registration_samples(self, sample_images_b64: list[str]) -> tuple[bool, str, list[float]]:
        """
        Processes 5-10 face samples for student registration.
        Validates that each sample contains exactly one face, extracts embeddings,
        and averages them into a high-accuracy registered face profile.
        """
        if not sample_images_b64:
            return False, "No face samples provided.", []

        valid_embeddings = []
        no_face_count = 0
        multi_face_count = 0

        for idx, b64_img in enumerate(sample_images_b64):
            try:
                img = self.decode_base64_image(b64_img)
                faces, count = self.detect_faces(img)

                if count == 0:
                    no_face_count += 1
                    continue
                elif count > 1:
                    multi_face_count += 1
                    continue

                # Single face detected
                face = faces[0]
                emb = self.extract_embedding(img, face)
                valid_embeddings.append(emb)
            except Exception as e:
                print(f"[FaceAI] Sample {idx} processing error: {e}")
                continue

        if multi_face_count > 0 and len(valid_embeddings) == 0:
            return False, "Multiple faces detected. Only one person should be visible.", []

        if len(valid_embeddings) == 0:
            return False, "No face detected. Please try again.", []

        # Average all valid embeddings to create robust student template
        avg_emb = np.mean(valid_embeddings, axis=0)
        norm = np.linalg.norm(avg_emb)
        if norm > 0:
            avg_emb = avg_emb / norm

        return True, f"Successfully processed {len(valid_embeddings)} face sample(s).", avg_emb.tolist()

    def identify_face(self, frame_b64: str, registered_students_embeddings: list[dict], threshold: float = None):
        """
        Identifies a face from a camera frame against a list of student embeddings.
        registered_students_embeddings: list of dicts:
          [{"student_id": 1, "student_name": "Rahul Sharma", "roll_number": "23", "embedding": [...]}, ...]
        """
        if threshold is None:
            threshold = DEFAULT_THRESHOLD

        try:
            img = self.decode_base64_image(frame_b64)
        except Exception as e:
            return {
                "success": False,
                "status": "error",
                "message": f"Failed to decode camera frame: {str(e)}",
                "box": None
            }

        faces, count = self.detect_faces(img)

        if count == 0:
            return {
                "success": False,
                "status": "no_face",
                "message": "No face detected. Please try again.",
                "box": None
            }

        if count > 1:
            return {
                "success": False,
                "status": "multiple_faces",
                "message": "Multiple faces detected. Only one person should be visible.",
                "box": None
            }

        face = faces[0]
        # Extract bounding box for frontend visual overlay if available
        # YuNet face format: [x, y, w, h, x_re, y_re, x_le, y_le, x_nt, y_nt, x_rcm, y_rcm, x_lcm, y_lcm, score]
        box = None
        if len(face) >= 4:
            box = {
                "x": int(face[0]),
                "y": int(face[1]),
                "w": int(face[2]),
                "h": int(face[3])
            }

        query_emb = self.extract_embedding(img, face)

        if not registered_students_embeddings:
            return {
                "success": False,
                "status": "no_registered_faces",
                "message": "No registered student faces found in the database. Please register student faces first.",
                "box": box
            }

        best_student = None
        best_similarity = -1.0

        for item in registered_students_embeddings:
            stored_emb = np.array(item["embedding"], dtype=np.float32)
            sim = self.compute_similarity(query_emb, stored_emb)
            if sim > best_similarity:
                best_similarity = sim
                best_student = item

        confidence_pct = max(0.0, min(100.0, round(best_similarity * 100, 1)))

        if best_similarity >= threshold and best_student is not None:
            return {
                "success": True,
                "status": "recognized",
                "message": f"Recognized: {best_student['name']}",
                "student_id": best_student["id"],
                "student_uid": best_student["student_id"],
                "name": best_student["name"],
                "roll_number": best_student["roll_number"],
                "course": best_student["course"],
                "year": best_student["year"],
                "division": best_student["division"],
                "confidence": confidence_pct,
                "similarity": round(best_similarity, 4),
                "threshold": threshold,
                "box": box
            }
        else:
            return {
                "success": False,
                "status": "unknown_face",
                "message": "Unknown Face. Attendance not marked.",
                "confidence": confidence_pct,
                "similarity": round(best_similarity, 4) if best_similarity > -1 else 0.0,
                "threshold": threshold,
                "box": box
            }

# Singleton instance
face_ai = FaceAI()
