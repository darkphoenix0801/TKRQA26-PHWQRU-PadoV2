import os
import sys
import tempfile
import librosa
import numpy as np
import whisper
# pyrefly: ignore [missing-import]
# Whisper requires ffmpeg executable in PATH. We copied it to venv/Scripts/ffmpeg.exe.
scripts_dir = os.path.dirname(sys.executable)
if scripts_dir not in os.environ["PATH"]:
    os.environ["PATH"] = scripts_dir + os.pathsep + os.environ["PATH"]
whisper_model = None
def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        print("[Whisper] Loading Whisper Model (tiny.en)... this may take a moment on first run.")
        try:
            whisper_model = whisper.load_model("tiny.en")
        except Exception as e:
            print(f"[Whisper] Failed to load whisper model: {e}")
    return whisper_model

def transcribe_audio(file_path: str) -> str:
    """
    Uses Groq's ultra-fast Whisper API if available, otherwise falls back to local OpenAI Whisper model.
    """
    from backend.agent.llm_client import GROQ_API_KEY
    import requests
    
    if GROQ_API_KEY:
        print(f"[Whisper] Using ultra-fast Groq API for: {file_path}")
        try:
            url = "https://api.groq.com/openai/v1/audio/transcriptions"
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}
            with open(file_path, "rb") as f:
                files = {"file": (os.path.basename(file_path), f, "audio/webm")}
                data = {"model": "whisper-large-v3-turbo", "response_format": "json"}
                res = requests.post(url, headers=headers, files=files, data=data, timeout=10)
                res.raise_for_status()
                return res.json()["text"].strip()
        except Exception as e:
            print(f"[Whisper] Groq API failed: {e}. Falling back to local model.")
            
    print(f"[Whisper] Transcribing with local model: {file_path}")
    model = get_whisper_model()
    if model is None:
        raise RuntimeError("Whisper model is not loaded.")
        
    # Using fp16=False to avoid warnings on CPU execution
    result = model.transcribe(file_path, fp16=False)
    return result["text"].strip()

def analyze_confidence(file_path: str) -> float:
    """
    Analyzes the audio file using librosa to produce a 'confidence' proxy score (0-100).
    It looks at pauses and speaking rate.
    """
    try:
        # Load audio file (y is the audio time series, sr is sampling rate). Resampled to 16kHz for speed.
        y, sr = librosa.load(file_path, sr=16000)
        
        # Calculate zero-crossing rate (higher ZCR often correlates to more active speaking/less silence)
        zcr = librosa.feature.zero_crossing_rate(y)
        avg_zcr = np.mean(zcr)
        
        # Split non-silent intervals to measure pauses
        # top_db is the threshold (in decibels) below reference to consider as silence
        non_mute_intervals = librosa.effects.split(y, top_db=20)
        
        total_duration = librosa.get_duration(y=y, sr=sr)
        
        # Calculate total speaking time vs silent time
        speaking_samples = sum(interval[1] - interval[0] for interval in non_mute_intervals)
        speaking_duration = speaking_samples / sr
        
        speaking_ratio = speaking_duration / total_duration if total_duration > 0 else 0
        
        # Normalize a score out of 100 based on speaking ratio (e.g. 60-90% speaking is usually ideal)
        # If someone pauses too much, speaking_ratio is low. 
        # If speaking_ratio is > 0.5, we give a good score, scaling up to 100.
        score = speaking_ratio * 100
        
        # Add a slight boost from ZCR (just a heuristic for demonstration)
        score += (avg_zcr * 50)
        
        # Clamp between 0 and 100
        final_score = max(0, min(100, score))
        
        # For our mock interview, people are usually fairly confident but taking time to think. 
        # Let's ensure a reasonable baseline.
        if final_score < 40:
            final_score = 40 + (final_score / 2)
            
        print(f"[Librosa] Audio Analysis: Speaking Ratio: {speaking_ratio:.2f}, Score: {final_score:.1f}")
        return float(final_score)
        
    except Exception as e:
        print(f"[Librosa] Error in audio analysis: {e}")
        return 75.0  # Safe fallback
