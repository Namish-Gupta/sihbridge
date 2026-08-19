import sys
import os
from pathlib import Path
import json

PINN_DIR = Path(__file__).resolve().parent / "pinn"
sys.path.append(str(PINN_DIR))

import shm_local_inference

# Create fake but valid 29 features for NODE_01 and NODE_02
node1_features = [0.1] * 29
node2_features = [0.12] * 29
node1_damage_prob = 0.15
node2_damage_prob = 0.18

print("Running ACTUAL ONNX PINN Inference...")

try:
    result = shm_local_inference.run_shm_inference(
        node1_features=node1_features,
        node1_damage_probability=node1_damage_prob,
        node2_features=node2_features,
        node2_damage_probability=node2_damage_prob,
        num_positions=21
    )
    
    print("\nSUCCESS! Inference Result:")
    print(json.dumps(result, indent=2))
except Exception as e:
    print(f"\nERROR: {e}")
