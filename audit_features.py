import numpy as np
import json

# Real NODE_01 features provided by user
real_node_01 = [0.38745552, 0.00165545, 0.38745901, 0.00832269, -0.28952819, 0.00298487, 0.28954369, 0.01203546, -0.86965144, 0.00209048, 0.86965394, 0.01014841, 0.39698619, 0.00289055, 0.39699692, 0.01191255, 0.47704637, 0.00263353, 0.47705349, 0.01183152, -0.80439758, 0.00397103, 0.80440652, 0.02024454, 50.0, 0.0, 0.0, 29.60001755, 75.0]

# Simulated NODE_02 features
sim_node_02 = [0.0, 0.01, 0.01, 0.05, 0.0, 0.01, 0.01, 0.05, 1.0, 0.02, 1.0, 0.1, 0.0, 0.01, 0.01, 0.05, 0.0, 0.01, 0.01, 0.05, 1.0, 0.02, 1.0, 0.1, 80.0, 1.0, 5.0, 30.0, 65.0]

FEATURE_NAMES = [
    "mpu_x_mean", "mpu_x_std", "mpu_x_rms", "mpu_x_ptp",
    "mpu_y_mean", "mpu_y_std", "mpu_y_rms", "mpu_y_ptp",
    "mpu_z_mean", "mpu_z_std", "mpu_z_rms", "mpu_z_ptp",
    "adxl_x_mean", "adxl_x_std", "adxl_x_rms", "adxl_x_ptp",
    "adxl_y_mean", "adxl_y_std", "adxl_y_rms", "adxl_y_ptp",
    "adxl_z_mean", "adxl_z_std", "adxl_z_rms", "adxl_z_ptp",
    "strain_mean", "strain_std", "strain_ptp",
    "temperature_mean", "humidity_mean"
]

UNITS = [
    "g", "g", "g", "g",
    "g", "g", "g", "g",
    "g", "g", "g", "g",
    "g", "g", "g", "g",
    "g", "g", "g", "g",
    "g", "g", "g", "g",
    "microstrain", "microstrain", "microstrain",
    "°C", "%"
]

PINN_MEAN = np.load("c:/Users/Suriya/sihbridge/pinn/pinn_feature_mean.npy")
PINN_STD = np.load("c:/Users/Suriya/sihbridge/pinn/pinn_feature_std.npy")

print("=========================================================================================")
print(f"{'FEATURE':<18} | {'REAL VALUE':<12} | {'PINN MEAN':<12} | {'PINN STD':<10} | {'Z-SCORE':<10} | {'UNIT'}")
print("=========================================================================================")

for i in range(29):
    mean_val = PINN_MEAN.item(i) if hasattr(PINN_MEAN, 'item') else PINN_MEAN[i]
    std_val = PINN_STD.item(i) if hasattr(PINN_STD, 'item') else PINN_STD[i]
    z = float((real_node_01[i] - mean_val) / std_val)
    
    z_str = f"{z:.3f}"
    if abs(z) > 10:
        z_str = f"*** {z_str} ***"
    elif abs(z) > 5:
        z_str = f"** {z_str} **"
    elif abs(z) > 3:
        z_str = f"* {z_str} *"
        
    print(f"{FEATURE_NAMES[i]:<18} | {real_node_01[i]:<12.6f} | {mean_val:<12.6f} | {std_val:<10.6f} | {z_str:<10} | {UNITS[i]}")

print("\n\n=========================================================================================")
print(f"NODE_02 SIMULATOR AUDIT")
print("=========================================================================================")
for i in range(29):
    mean_val = PINN_MEAN.item(i) if hasattr(PINN_MEAN, 'item') else PINN_MEAN[i]
    std_val = PINN_STD.item(i) if hasattr(PINN_STD, 'item') else PINN_STD[i]
    z = float((sim_node_02[i] - mean_val) / std_val)
    z_str = f"{z:.3f}"
    if abs(z) > 10:
        z_str = f"*** {z_str} ***"
    elif abs(z) > 5:
        z_str = f"** {z_str} **"
    elif abs(z) > 3:
        z_str = f"* {z_str} *"
        
    print(f"{FEATURE_NAMES[i]:<18} | {sim_node_02[i]:<12.6f} | {mean_val:<12.6f} | {std_val:<10.6f} | {z_str:<10} | {UNITS[i]}")
