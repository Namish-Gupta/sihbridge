

import os

import numpy as np
import joblib
import tensorflow as tf


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(

    os.path.abspath(__file__)

)


# ============================================================
# TINYML MODEL PATHS
# ============================================================
#
# These are the SAME artifacts used during TinyML training.
#
# ============================================================

TINYML_MODEL_PATH = os.path.join(

    BASE_DIR,

    "shm_tinyml_final.keras"

)


TINYML_SCALER_PATH = os.path.join(

    BASE_DIR,

    "shm_tinyml_scaler.joblib"

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
# LOAD MODEL
# ============================================================

if not os.path.exists(

    TINYML_MODEL_PATH

):

    raise FileNotFoundError(

        "TinyML model not found:\n"
        + TINYML_MODEL_PATH

    )


tinyml_model = tf.keras.models.load_model(

    TINYML_MODEL_PATH

)


# ============================================================
# LOAD EXACT SCALER
# ============================================================

if not os.path.exists(

    TINYML_SCALER_PATH

):

    raise FileNotFoundError(

        "TinyML scaler not found:\n"
        + TINYML_SCALER_PATH

    )


tinyml_scaler = joblib.load(

    TINYML_SCALER_PATH

)


# ============================================================
# VALIDATE SCALER
# ============================================================

if len(tinyml_scaler.mean_) != 29:

    raise RuntimeError(

        "TinyML scaler does not contain "
        "exactly 29 features."

    )


# ============================================================
# INFERENCE FUNCTION
# ============================================================

def predict_damage_probability(

    feature_matrix

):

    """
    Run the trained TinyML classifier.

    INPUT:

        feature_matrix:
            shape = (N, 29)

            RAW feature values.

    OUTPUT:

        shape = (N,)

        damage probabilities in [0, 1]
    """


    feature_matrix = np.asarray(

        feature_matrix,

        dtype=np.float32

    )


    # --------------------------------------------------------
    # Handle a single sensor
    # --------------------------------------------------------

    if feature_matrix.ndim == 1:

        feature_matrix = feature_matrix.reshape(

            1,

            -1

        )


    # --------------------------------------------------------
    # Validate dimensions
    # --------------------------------------------------------

    if feature_matrix.shape[1] != 29:

        raise ValueError(

            "TinyML expects exactly 29 features. "

            f"Received {feature_matrix.shape[1]}."

        )


    # --------------------------------------------------------
    # Validate values
    # --------------------------------------------------------

    if not np.isfinite(

        feature_matrix

    ).all():

        raise ValueError(

            "Feature matrix contains NaN or Inf."

        )


    # --------------------------------------------------------
    # STANDARDIZATION
    # --------------------------------------------------------
    #
    # This MUST use the same scaler used during training.
    #
    # --------------------------------------------------------

    import pandas as pd
    
    df_features = pd.DataFrame(
        feature_matrix,
        columns=FEATURE_NAMES
    )

    scaled_features = (
        tinyml_scaler.transform(
            df_features
        )
    )


    # --------------------------------------------------------
    # MODEL INFERENCE
    # --------------------------------------------------------

    probabilities = (

        tinyml_model.predict(

            scaled_features,

            verbose=0

        )

        .reshape(-1)

    )


    # --------------------------------------------------------
    # SAFETY CLAMP
    # --------------------------------------------------------

    probabilities = np.clip(

        probabilities,

        0.0,

        1.0

    )


    return probabilities.astype(

        np.float32

    )


# ============================================================
# SINGLE SENSOR HELPER
# ============================================================

def predict_single_sensor(

    features

):

    """

    Predict damage probability for one sensor.

    INPUT:
        29 raw features

    OUTPUT:
        float probability
    """


    probability = predict_damage_probability(

        np.asarray(

            features,

            dtype=np.float32

        ).reshape(

            1,

            29

        )

    )


    return float(

        probability[0]

    )


# ============================================================
# HEALTH CHECK
# ============================================================

def health_check():

    return {

        "status":
            "ready",

        "model":
            "shm_tinyml_final.keras",

        "feature_count":
            29

    }

