import random
from datasets import load_dataset
import threading

# Global cache for datasets
_ds_cache = {
    "dsa": None,
    "behavioral": None
}
_cache_lock = threading.Lock()

def _load_dsa_dataset():
    if _ds_cache["dsa"] is None:
        print("[HF] Loading LeetCode dataset from HuggingFace...")
        try:
            _ds_cache["dsa"] = load_dataset("kaysss/leetcode-problem-solutions", split="train")
            print("[HF] LeetCode dataset loaded!")
        except Exception as e:
            print(f"[HF] Failed to load LeetCode dataset: {e}")
            _ds_cache["dsa"] = []
    return _ds_cache["dsa"]

def _load_behavioral_dataset():
    if _ds_cache["behavioral"] is None:
        print("[HF] Loading Behavioral dataset from HuggingFace...")
        try:
            _ds_cache["behavioral"] = load_dataset("Aiman1234/Interview-questions", split="train")
            print("[HF] Behavioral dataset loaded!")
        except Exception as e:
            print(f"[HF] Failed to load Behavioral dataset: {e}")
            _ds_cache["behavioral"] = []
    return _ds_cache["behavioral"]

def get_dataset_context(company: str, round_type: str) -> str:
    """
    Retrieves a sample question from Hugging Face datasets.
    """
    with _cache_lock:
        if round_type.upper() == "DSA":
            ds = _load_dsa_dataset()
            if not ds:
                return "No dataset data found."
                
            # Randomly sample a problem
            idx = random.randint(0, len(ds) - 1)
            problem = ds[idx]
            title = problem.get("title", "")
            summary = problem.get("summary", "")
            return f"**{title}**\n\n{summary}"
            
        else:
            ds = _load_behavioral_dataset()
            if not ds:
                return "No dataset data found."
                
            # Randomly sample a behavioral question
            idx = random.randint(0, len(ds) - 1)
            q = ds[idx]
            question = q.get("Questions", "")
            return f"{question}"

# Pre-load datasets in a background thread to prevent blocking the first request
def preload_datasets():
    def _preload():
        _load_dsa_dataset()
        _load_behavioral_dataset()
    
    t = threading.Thread(target=_preload, daemon=True)
    t.start()
