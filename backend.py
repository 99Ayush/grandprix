import torch
from PIL import Image
from transformers import pipeline

print("🏎️ Initializing Multi-Sector Vision Engine & Temperature Scaler...")
classifier = pipeline(
    task="zero-shot-image-classification",
    model="google/siglip-base-patch16-224"
)

CANDIDATE_LABELS = [
    "a photo of a dry asphalt race track",
    "a photo of a damp race track surface with slight dark patches",
    "a photo of a wet race track with standing water and rain spray",
    "a photo of a drying race track with a clear dry racing line"
]

LABEL_MAP = {
    "a photo of a dry asphalt race track": "Dry",
    "a photo of a damp race track surface with slight dark patches": "Damp",
    "a photo of a wet race track with standing water and rain spray": "Wet",
    "a photo of a drying race track with a clear dry racing line": "Drying"
}

def analyze_track_frame(image: Image.Image, camera_feed: str, track_temp: float = 28.5):
    """
    Processes optical frame using SigLIP, applying Temperature-Scaled Softmax (tau=5.0) 
    and factoring in surface temperature parameters.
    """
    if image is None:
        return {"Dry": 0.25, "Damp": 0.25, "Wet": 0.25, "Drying": 0.25}, camera_feed
    
    results = classifier(image, candidate_labels=CANDIDATE_LABELS)
    
    # Extract raw model logits/scores
    raw_scores = [res["score"] for res in results]
    scores_tensor = torch.tensor(raw_scores)
    
    # Apply Temperature-Scaled Softmax (tau = 5.0)
    normalized_probs = torch.softmax(scores_tensor * 5.0, dim=0).tolist()
    
    formatted_scores = {}
    for res, prob in zip(results, normalized_probs):
        clean_label = LABEL_MAP[res["label"]]
        formatted_scores[clean_label] = round(prob, 3)
        
    # Temperature heuristic: Accelerate drying line confidence if surface temp >= 30°C
    if track_temp >= 30.0 and formatted_scores.get("Drying", 0) > 0.20:
        formatted_scores["Drying"] = min(1.0, round(formatted_scores["Drying"] * 1.15, 3))
        
    return formatted_scores, camera_feed
