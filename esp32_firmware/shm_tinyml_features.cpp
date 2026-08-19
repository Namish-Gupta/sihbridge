
#include "shm_tinyml_features.h"

#include <math.h>


static float shm_mean(
    const float* x,
    int n
)
{
    float sum = 0.0f;

    for (int i = 0; i < n; i++)
    {
        sum += x[i];
    }

    return sum / (float)n;
}


static float shm_std(
    const float* x,
    int n
)
{
    float mean = shm_mean(x, n);

    float sum = 0.0f;

    for (int i = 0; i < n; i++)
    {
        float d = x[i] - mean;
        sum += d * d;
    }

    return sqrtf(
        sum / (float)n
    );
}


static float shm_rms(
    const float* x,
    int n
)
{
    float sum = 0.0f;

    for (int i = 0; i < n; i++)
    {
        sum += x[i] * x[i];
    }

    return sqrtf(
        sum / (float)n
    );
}


static float shm_ptp(
    const float* x,
    int n
)
{
    float min_value = x[0];
    float max_value = x[0];

    for (int i = 1; i < n; i++)
    {
        if (x[i] < min_value)
            min_value = x[i];

        if (x[i] > max_value)
            max_value = x[i];
    }

    return max_value - min_value;
}


static void add_axis_features(
    const float* x,
    int n,
    float* output,
    int& index
)
{
    output[index++] =
        shm_mean(x, n);

    output[index++] =
        shm_std(x, n);

    output[index++] =
        shm_rms(x, n);

    output[index++] =
        shm_ptp(x, n);
}


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
)
{
    int index = 0;

    // -----------------------------------------
    // MPU9250 = 12
    // -----------------------------------------

    add_axis_features(
        mpu_x,
        SHM_WINDOW_SIZE,
        output,
        index
    );

    add_axis_features(
        mpu_y,
        SHM_WINDOW_SIZE,
        output,
        index
    );

    add_axis_features(
        mpu_z,
        SHM_WINDOW_SIZE,
        output,
        index
    );


    // -----------------------------------------
    // ADXL335 = 12
    // -----------------------------------------

    add_axis_features(
        adxl_x,
        SHM_WINDOW_SIZE,
        output,
        index
    );

    add_axis_features(
        adxl_y,
        SHM_WINDOW_SIZE,
        output,
        index
    );

    add_axis_features(
        adxl_z,
        SHM_WINDOW_SIZE,
        output,
        index
    );


    // -----------------------------------------
    // STRAIN = 3
    // -----------------------------------------

    output[index++] =
        shm_mean(
            strain,
            SHM_WINDOW_SIZE
        );

    output[index++] =
        shm_std(
            strain,
            SHM_WINDOW_SIZE
        );

    output[index++] =
        shm_ptp(
            strain,
            SHM_WINDOW_SIZE
        );


    // -----------------------------------------
    // TEMPERATURE = 1
    // -----------------------------------------

    output[index++] =
        shm_mean(
            temperature,
            SHM_WINDOW_SIZE
        );


    // -----------------------------------------
    // HUMIDITY = 1
    // -----------------------------------------

    output[index++] =
        shm_mean(
            humidity,
            SHM_WINDOW_SIZE
        );
}
