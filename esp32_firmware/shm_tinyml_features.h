
#ifndef SHM_TINYML_FEATURES_H
#define SHM_TINYML_FEATURES_H

#define SHM_WINDOW_SIZE 100
#define SHM_FEATURE_COUNT 29

void shm_extract_features(
    const float* mpu_x,
    const float* mpu_y,
    const float* mpu_z,

    const float* adxl_x,
    const float* adxl_y,
    const float* adxl_z,

    const float* strain,

    const float* temperature,
    const float* humidity,

    float output[SHM_FEATURE_COUNT]
);

#endif
