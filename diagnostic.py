import os
import sys
import numpy as np

# Add pinn dir to path
sys.path.append(os.path.join(os.path.dirname(__file__), "pinn"))

from pinn.shm_local_inference import run_shm_inference
from pinn.tinyml_inference import tinyml_scaler, tinyml_model, FEATURE_NAMES as TINYML_FEATURES
from pinn.pinn_inference import PINN_MEAN, PINN_STD, EXPECTED_INPUTS, PINN_SESSION
from backend.simulator import generate_simulated_node_02

def run_diagnostic():
    # Generate NODE_01 (simulated as healthy to match real behavior)
    node1 = generate_simulated_node_02(1000, "HEALTHY")
    # Modify NODE_01 to match the REAL ESP32 data from the log
    node1.features[-2] = 29.6
    node1.features[-1] = 75.0
    node2 = generate_simulated_node_02(1000, "HEALTHY")
    
    print("\n--- DIAGNOSTIC TRACE ---\n")
    print(f"1. NODE_01 damage probability: {node1.tinyml.damage_probability}")
    print(f"2. NODE_02 damage probability: {node2.tinyml.damage_probability}")
    print(f"3. NODE_01's complete 29-feature vector: \n{node1.features}")
    print(f"4. NODE_02's complete 29-feature vector: \n{node2.features}")
    print(f"5. Exact feature names/order in TinyML: \n{TINYML_FEATURES}")
    
    # Run PINN normalization step manually to see
    node1_normalized = (np.array(node1.features, dtype=np.float32) - PINN_MEAN) / PINN_STD
    print(f"6. Feature normalization values after preprocessing (NODE_01): \n{node1_normalized}")
    
    # Run complete inference
    res = run_shm_inference(
        node1_features=node1.features,
        node1_damage_probability=node1.tinyml.damage_probability,
        node2_features=node2.features,
        node2_damage_probability=node2.tinyml.damage_probability,
        num_positions=21
    )
    
    sensors = res["virtual_sensors"]
    print(f"7. PINN input tensor shape: Expected {EXPECTED_INPUTS}")
    print(f"8. PINN output tensor shape: (21, 29)") # Known from logic
    
    s0 = sensors[0]
    s10 = sensors[10]
    s20 = sensors[20]
    
    def get_features(sensor):
        return [sensor[f] for f in TINYML_FEATURES]
        
    print(f"9. First virtual sensor's 29 features (RAW FROM PINN): \n{get_features(s0)}")
    print(f"10. Middle virtual sensor's 29 features: \n{get_features(s10)}")
    print(f"11. Last virtual sensor's 29 features: \n{get_features(s20)}")
    
    # Now let's see what TinyML receives
    feature_matrix = np.array([get_features(s) for s in sensors], dtype=np.float32)
    print(f"12. TinyML input shape (before scaling): {feature_matrix.shape}")
    
    # What does the scaler do?
    scaled_matrix = tinyml_scaler.transform(feature_matrix)
    print(f"   TinyML scaled first sensor features: \n{scaled_matrix[0]}")
    
    print(f"13. First virtual sensor damage probability: {s0['damage_probability']}")
    print(f"14. Middle virtual sensor damage probability: {s10['damage_probability']}")
    print(f"15. Last virtual sensor damage probability: {s20['damage_probability']}")
    
    probs = [s['damage_probability'] for s in sensors]
    print(f"16. Minimum damage probability: {min(probs)}")
    print(f"17. Maximum damage probability: {max(probs)}")
    print(f"18. Average damage probability: {sum(probs)/len(probs)}")
    
    healthy_count = sum(1 for s in sensors if s['predicted_state'] == 'HEALTHY')
    damaged_count = sum(1 for s in sensors if s['predicted_state'] == 'DAMAGED')
    
    print(f"19. Number of HEALTHY virtual sensors: {healthy_count}")
    print(f"20. Number of DAMAGED virtual sensors: {damaged_count}")
    
    # Let's inspect the warning about Feature Names
    print("\n--- SKLEARN FEATURE NAME INSPECTION ---")
    print(f"Scaler expected features (if pandas was used): {getattr(tinyml_scaler, 'feature_names_in_', 'NOT FOUND')}")
    print(f"Scaler mean: \n{tinyml_scaler.mean_}")
    print(f"Scaler scale: \n{tinyml_scaler.scale_}")
    
if __name__ == "__main__":
    import warnings
    # Do NOT suppress warnings, let them print naturally
    run_diagnostic()
