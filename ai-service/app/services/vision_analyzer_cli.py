import os
import sys
import json

# Ensure ai-service root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_service_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if ai_service_dir not in sys.path:
    sys.path.insert(0, ai_service_dir)

from app.services.vision_analyzer import VisionAnalyzer

def main():
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        with open(filepath, "rb") as f:
            data = f.read()
    else:
        data = sys.stdin.buffer.read()

    result = VisionAnalyzer.analyze_crop_image(data)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
