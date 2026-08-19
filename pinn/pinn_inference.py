

import os
import json

import numpy as np
import pandas as pd
import onnxruntime as ort


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


PINN_MODEL_PATH = os.path.join(
    BASE_DIR,
    "shm_pinn.onnx"
)


PINN_MEAN_PATH = os.path.join(
    BASE_DIR,
    "pinn_feature_mean.npy"
)


PINN_STD_PATH = os.path.join(
    BASE_DIR,
    "pinn_feature_std.npy"
)


# ============================================================
# EXACT 29-FEATURE ORDER
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
# LOAD PINN NORMALIZATION
# ============================================================

PINN_MEAN = np.load(
    PINN_MEAN_PATH
).astype(
    np.float32
)


PINN_STD = np.load(
    PINN_STD_PATH
).astype(
    np.float32
)


# ============================================================
# LOAD ONNX PINN ONCE
# ============================================================

PINN_SESSION = ort.InferenceSession(

    PINN_MODEL_PATH,

    providers=[
        "CPUExecutionProvider"
    ]

)


# ============================================================
# VERIFY MODEL INPUTS
# ============================================================

MODEL_INPUTS = {

    item.name

    for item in PINN_SESSION.get_inputs()

}


EXPECTED_INPUTS = {

    "x",
    "node1_features",
    "node2_features",
    "node1_damage_probability",
    "node2_damage_probability"

}


if MODEL_INPUTS != EXPECTED_INPUTS:

    raise RuntimeError(

        "Unexpected PINN ONNX inputs.\n"

        f"Expected: {EXPECTED_INPUTS}\n"

        f"Received: {MODEL_INPUTS}"

    )


# ============================================================
# MAIN INFERENCE FUNCTION
# ============================================================

def run_pinn_inference(

    node1_features,
    node1_damage_probability,

    node2_features,
    node2_damage_probability,

    num_positions=21

):

    """
    Run local PINN virtual sensing.

    INPUT:

        node1_features:
            29 RAW statistical features

        node1_damage_probability:
            TinyML probability from Node 1
            range 0 → 1

        node2_features:
            29 RAW statistical features

        node2_damage_probability:
            TinyML probability from Node 2
            range 0 → 1

    OUTPUT:

        Dictionary containing virtual sensors.
    """


    # ========================================================
    # CONVERT INPUTS
    # ========================================================

    node1_features = np.asarray(

        node1_features,

        dtype=np.float32

    ).reshape(-1)


    node2_features = np.asarray(

        node2_features,

        dtype=np.float32

    ).reshape(-1)


    # ========================================================
    # VALIDATE FEATURE COUNT
    # ========================================================

    if len(node1_features) != 29:

        raise ValueError(

            "Node 1 must contain exactly 29 features."

        )


    if len(node2_features) != 29:

        raise ValueError(

            "Node 2 must contain exactly 29 features."

        )


    # ========================================================
    # VALIDATE PROBABILITIES
    # ========================================================

    node1_damage_probability = float(

        node1_damage_probability

    )


    node2_damage_probability = float(

        node2_damage_probability

    )


    if not (

        0.0
        <= node1_damage_probability
        <= 1.0

    ):

        raise ValueError(

            "Node 1 damage probability must be "
            "between 0 and 1."

        )


    if not (

        0.0
        <= node2_damage_probability
        <= 1.0

    ):

        raise ValueError(

            "Node 2 damage probability must be "
            "between 0 and 1."

        )


    # ========================================================
    # VALIDATE SENSOR DATA
    # ========================================================

    if not np.isfinite(

        node1_features

    ).all():

        raise ValueError(

            "Node 1 contains NaN or Inf."

        )


    if not np.isfinite(

        node2_features

    ).all():

        raise ValueError(

            "Node 2 contains NaN or Inf."

        )


    # ========================================================
    # PINN NORMALIZATION
    # ========================================================

    node1_normalized = (

        node1_features - PINN_MEAN

    ) / PINN_STD


    node2_normalized = (

        node2_features - PINN_MEAN

    ) / PINN_STD


    # ========================================================
    # CREATE POSITION GRID
    # ========================================================

    x = np.linspace(

        0.0,

        1.0,

        num_positions,

        dtype=np.float32

    ).reshape(

        -1,

        1

    )


    # ========================================================
    # REPEAT PHYSICAL NODE STATES
    # ========================================================

    node1_batch = np.repeat(

        node1_normalized.reshape(1, 29),

        num_positions,

        axis=0

    ).astype(np.float32)


    node2_batch = np.repeat(

        node2_normalized.reshape(1, 29),

        num_positions,

        axis=0

    ).astype(np.float32)


    damage1_batch = np.full(

        (num_positions, 1),

        node1_damage_probability,

        dtype=np.float32

    )


    damage2_batch = np.full(

        (num_positions, 1),

        node2_damage_probability,

        dtype=np.float32

    )


    # ========================================================
    # RUN PINN
    # ========================================================

    outputs = PINN_SESSION.run(

        [

            "displacement",

            "virtual_features"

        ],

        {

            "x":
                x,

            "node1_features":
                node1_batch,

            "node2_features":
                node2_batch,

            "node1_damage_probability":
                damage1_batch,

            "node2_damage_probability":
                damage2_batch

        }

    )


    displacement = outputs[0]

    virtual_features_normalized = outputs[1]


    # ========================================================
    # CONVERT FEATURES BACK TO ORIGINAL SCALE
    # ========================================================

    virtual_features = (

        virtual_features_normalized

        *

        PINN_STD.reshape(1, 29)

        +

        PINN_MEAN.reshape(1, 29)

    )


    # ========================================================
    # CREATE OUTPUT
    # ========================================================

    sensors = []


    for i in range(num_positions):

        if i == 0:

            sensor_id = "NODE_01"

        elif i == num_positions - 1:

            sensor_id = "NODE_02"

        else:

            sensor_id = f"VIRTUAL_{i:02d}"


        feature_values = (

            virtual_features[i]

        )


        sensor = {

            "sensor_id":
                sensor_id,

            "x_normalized":
                float(x[i, 0]),

            "pinn_displacement":
                float(displacement[i, 0])

        }


        # ----------------------------------------------------
        # Add all 29 features
        # ----------------------------------------------------

        for j, feature_name in enumerate(

            FEATURE_NAMES

        ):

            sensor[feature_name] = float(

                feature_values[j]

            )


        sensors.append(sensor)


    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "num_positions":
            num_positions,

        "num_virtual_sensors":
            num_positions - 2,

        "num_features_per_sensor":
            29,

        "node_01_damage_probability":
            node1_damage_probability,

        "node_02_damage_probability":
            node2_damage_probability,

        "virtual_sensors":
            sensors

    }


# ============================================================
# SIMPLE HEALTH CHECK
# ============================================================

def health_check():

    return {

        "status":
            "ready",

        "model":
            "shm_pinn.onnx",

        "feature_count":
            29,

        "input_dimension":
            61,

        "output_features":
            29

    }


