

import os

import numpy as np

from pinn_inference import run_pinn_inference

from tinyml_inference import predict_damage_probability


# ============================================================
# EXACT 29 FEATURE ORDER
# ============================================================

FEATURE_NAMES = [

    "mpu_x_mean",
    "mpu_x_std",
    "mpu_x_rms",
    "mpu_x_ptp",

    "mpu_y_mean",
    "mpu_y_std",
    "mpu_y_rms",
    "mpu_y_ptp",

    "mpu_z_mean",
    "mpu_z_std",
    "mpu_z_rms",
    "mpu_z_ptp",

    "adxl_x_mean",
    "adxl_x_std",
    "adxl_x_rms",
    "adxl_x_ptp",

    "adxl_y_mean",
    "adxl_y_std",
    "adxl_y_rms",
    "adxl_y_ptp",

    "adxl_z_mean",
    "adxl_z_std",
    "adxl_z_rms",
    "adxl_z_ptp",

    "strain_mean",
    "strain_std",
    "strain_ptp",

    "temperature_mean",
    "humidity_mean"

]


# ============================================================
# COMPLETE SHM INFERENCE
# ============================================================

def run_shm_inference(

    node1_features,

    node1_damage_probability,

    node2_features,

    node2_damage_probability,

    num_positions=21

):

    """
    COMPLETE LOCAL SHM PIPELINE

    Physical nodes
          ↓
        PINN
          ↓
    virtual features
          ↓
       TinyML
          ↓
    damage probability
    """


    # ========================================================
    # 1. RUN PINN
    # ========================================================

    pinn_result = run_pinn_inference(

        node1_features=node1_features,

        node1_damage_probability=
            node1_damage_probability,

        node2_features=node2_features,

        node2_damage_probability=
            node2_damage_probability,

        num_positions=num_positions

    )


    sensors = pinn_result[

        "virtual_sensors"

    ]


    # ========================================================
    # 2. EXTRACT VIRTUAL FEATURE MATRIX
    # ========================================================

    feature_matrix = np.array(

        [

            [

                sensor[feature]

                for feature in FEATURE_NAMES

            ]

            for sensor in sensors

        ],

        dtype=np.float32

    )


    # ========================================================
    # 3. RUN SAME TINYML CLASSIFIER
    # ========================================================

    damage_probabilities = (

        predict_damage_probability(

            feature_matrix

        )

    )


    # ========================================================
    # 4. ADD DAMAGE RESULTS
    # ========================================================

    for i, sensor in enumerate(sensors):

        probability = float(

            damage_probabilities[i]

        )


        sensor[

            "damage_probability"

        ] = probability


        sensor[

            "damage_probability_pct"

        ] = (

            probability * 100.0

        )


        sensor[

            "healthy_probability"

        ] = (

            1.0 - probability

        )


        sensor[

            "healthy_probability_pct"

        ] = (

            (1.0 - probability)

            *

            100.0

        )


        sensor[

            "predicted_state"

        ] = (

            "DAMAGED"

            if probability >= 0.5

            else "HEALTHY"

        )


    # ========================================================
    # 5. DIAGNOSTIC LOGGING (TEMPORARY)
    # ========================================================
    print("\n--- DIAGNOSTIC TRACE ---")
    print(f"1. NODE_01 damage probability: {node1_damage_probability}")
    print(f"2. NODE_02 damage probability: {node2_damage_probability}")
    print(f"3. NODE_01's complete 29-feature vector: \n{list(node1_features)}")
    print(f"4. NODE_02's complete 29-feature vector: \n{list(node2_features)}")
    print(f"5. Exact feature names/order: \n{FEATURE_NAMES}")
    
    # We need to manually calculate the PINN normalized features just to print them
    from pinn_inference import PINN_MEAN, PINN_STD
    node1_norm = (np.array(node1_features, dtype=np.float32) - PINN_MEAN) / PINN_STD
    print(f"6. Feature normalization values after preprocessing (NODE_01): \n{node1_norm.tolist()}")
    print(f"7. PINN input tensor shape: (1, 29)") # Simplified
    print(f"8. PINN output tensor shape: (21, 29)")
    
    print(f"9. First virtual sensor's 29 features: \n{[sensors[0][f] for f in FEATURE_NAMES]}")
    print(f"10. Middle virtual sensor's 29 features: \n{[sensors[10][f] for f in FEATURE_NAMES]}")
    print(f"11. Last virtual sensor's 29 features: \n{[sensors[20][f] for f in FEATURE_NAMES]}")
    
    print(f"12. TinyML input shape: {feature_matrix.shape}")
    print(f"13. First virtual sensor damage probability: {sensors[0]['damage_probability']}")
    print(f"14. Middle virtual sensor damage probability: {sensors[10]['damage_probability']}")
    print(f"15. Last virtual sensor damage probability: {sensors[20]['damage_probability']}")
    
    probs = [s['damage_probability'] for s in sensors]
    print(f"16. Minimum damage probability across all 21 sensors: {min(probs)}")
    print(f"17. Maximum damage probability across all 21 sensors: {max(probs)}")
    print(f"18. Average damage probability across all 21 sensors: {sum(probs)/len(probs)}")
    
    healthy_count = sum(1 for s in sensors if s['predicted_state'] == 'HEALTHY')
    damaged_count = sum(1 for s in sensors if s['predicted_state'] == 'DAMAGED')
    print(f"19. Number of HEALTHY virtual sensors: {healthy_count}")
    print(f"20. Number of DAMAGED virtual sensors: {damaged_count}")
    print("------------------------\n")

    return {

        "status":
            "success",

        "num_positions":
            num_positions,

        "num_virtual_sensors":
            num_positions - 2,

        "features_per_sensor":
            29,

        "physical_nodes": {

            "node_01": {

                "damage_probability":
                    float(
                        node1_damage_probability
                    )

            },

            "node_02": {

                "damage_probability":
                    float(
                        node2_damage_probability
                    )

            }

        },

        "virtual_sensors":
            sensors

    }


# ============================================================
# HEALTH CHECK
# ============================================================

def health_check():

    return {

        "status":
            "ready",

        "pipeline":
            "Node data -> PINN -> TinyML",

        "pinnt_output_features":
            29,

        "virtual_sensor_positions":
            21

    }

