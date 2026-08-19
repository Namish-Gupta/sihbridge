#include <Arduino.h>
#include <Wire.h>
#include <math.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/schema/schema_generated.h"

#include "shm_tinyml_model_data_esp32.h"
#include "shm_tinyml_features.h"
#include "shm_tinyml_scaler.h"

#include <DHT.h>


// ============================================================
// DHT11
// ============================================================

#define DHT_PIN 16
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);


// ============================================================
// SETTINGS
// ============================================================

#define WINDOW_SIZE 100
#define FEATURE_COUNT 29
#define SAMPLE_RATE_HZ 50

#define NODE_ID "NODE_01"


// ============================================================
// SENSOR VALIDATION
// ============================================================
const char* WIFI_SSID = "Ennada lookuh?";
const char* WIFI_PASSWORD = "Suriya@2006";

const char* SERVER_URL =
    "http://10.173.225.229:8000/api/iot/data";


const float SENSOR_DEVIATION_THRESHOLD = 1.00f;

const int MAX_BAD_SAMPLES = 10;


// ============================================================
// GY-61
// ============================================================

#define GY_X_PIN 4
#define GY_Y_PIN 5
#define GY_Z_PIN 6


// ============================================================
// GY-61 CALIBRATION
// ============================================================

const float GY61_OFFSET_X = 1944.90f;
const float GY61_OFFSET_Y = 1960.185f;
const float GY61_OFFSET_Z = 1930.77f;

const float GY61_SCALE_X = 382.06f;
const float GY61_SCALE_Y = 385.005f;
const float GY61_SCALE_Z = 402.64f;


// ============================================================
// MPU6500
// ============================================================

#define MPU_ADDRESS 0x68

#define MPU_SDA 8
#define MPU_SCL 9

TwoWire MPUWire = TwoWire(1);


// ============================================================
// ADXL345
// ============================================================

#define ADXL345_ADDR 0x53

#define ADXL_SDA 40
#define ADXL_SCL 39

#define ADXL_POWER_CTL   0x2D
#define ADXL_DATA_FORMAT 0x31

#define ADXL_DATAX0 0x32
#define ADXL_DATAY0 0x34
#define ADXL_DATAZ0 0x36


// ============================================================
// ADXL345 CALIBRATION
// ============================================================

const float ADXL_OFFSET_X = 0.021543f;
const float ADXL_OFFSET_Y = 0.009102f;
const float ADXL_OFFSET_Z = 0.082344f;

const float ADXL_SCALE_X = 0.983730f;
const float ADXL_SCALE_Y = 0.990469f;
const float ADXL_SCALE_Z = 0.964766f;

const float MPU_OFFSET_X = 0.004344f;
const float MPU_OFFSET_Y = -0.012520f;
const float MPU_OFFSET_Z = 0.024040f;

const float MPU_SCALE_X = 0.975370f;
const float MPU_SCALE_Y = 0.983827f;
const float MPU_SCALE_Z = 1.004381f;
// ============================================================
// SENSOR ARRAYS
// ============================================================

float mpu_x[WINDOW_SIZE];
float mpu_y[WINDOW_SIZE];
float mpu_z[WINDOW_SIZE];

float adxl_x[WINDOW_SIZE];
float adxl_y[WINDOW_SIZE];
float adxl_z[WINDOW_SIZE];

float strain_data[WINDOW_SIZE];

float temperature[WINDOW_SIZE];
float humidity[WINDOW_SIZE];


// ============================================================
// 29 RAW FEATURES FOR PINN
// ============================================================

float rawFeatures[FEATURE_COUNT];

// ============================================================
// STANDARDIZED FEATURES FOR ESP32 TINYML
// ============================================================

float features[FEATURE_COUNT];

// ============================================================
// TELEMETRY STATE
// ============================================================

float lastGyX = 0.0f;
float lastGyY = 0.0f;
float lastGyZ = 0.0f;

float lastMpuX = 0.0f;
float lastMpuY = 0.0f;
float lastMpuZ = 0.0f;

float lastAdxlX = 0.0f;
float lastAdxlY = 0.0f;
float lastAdxlZ = 0.0f;

float currentTemperature = NAN;
float currentHumidity = NAN;

int validationBadSamples = 0;
float validationMaximumDeviation = 0.0f;
bool validationOK = false;

bool tinyMLAvailable = false;
float lastDamageProbability = 0.0f;
float lastHealthyProbability = 1.0f;
const char* lastPrediction = "HEALTHY";



// ============================================================
// TFLITE
// ============================================================

const tflite::Model* model = nullptr;

tflite::MicroInterpreter* interpreter = nullptr;

TfLiteTensor* input_tensor = nullptr;

TfLiteTensor* output_tensor = nullptr;


// ============================================================
// TENSOR ARENA
// ============================================================

constexpr int TENSOR_ARENA_SIZE = 32 * 1024;

alignas(16)
uint8_t tensor_arena[TENSOR_ARENA_SIZE];


// ============================================================
// OPERATOR RESOLVER
// ============================================================

tflite::MicroMutableOpResolver<2> resolver;


// ============================================================
// FUNCTION DECLARATIONS
// ============================================================

void initializeTinyML();

void initializeMPU();

void initializeADXL345();

void readGY61(
    float &x,
    float &y,
    float &z
);

void readADXL345(
    float &x,
    float &y,
    float &z
);

bool sensorsAgree(
    float gyX,
    float gyY,
    float gyZ,

    float mpuX,
    float mpuY,
    float mpuZ,

    float adxlX,
    float adxlY,
    float adxlZ
);

bool collectSensorWindow();

void standardizeFeatures();

void runInference();

void readDHT11();
void connectWiFi();
void sendIoTData();


// ============================================================
// MPU6500 WRITE REGISTER
// ============================================================

void writeMPURegister(
    byte reg,
    byte value
)
{
    MPUWire.beginTransmission(MPU_ADDRESS);

    MPUWire.write(reg);
    MPUWire.write(value);

    MPUWire.endTransmission();
}


// ============================================================
// MPU6500 READ 16-BIT
// ============================================================

int16_t readMPU16(
    byte highReg
)
{
    MPUWire.beginTransmission(MPU_ADDRESS);

    MPUWire.write(highReg);

    if (MPUWire.endTransmission(false) != 0)
    {
        return 0;
    }

    MPUWire.requestFrom(
        MPU_ADDRESS,
        (uint8_t)2
    );

    if (MPUWire.available() < 2)
    {
        return 0;
    }

    byte highByte = MPUWire.read();
    byte lowByte = MPUWire.read();

    return (int16_t)(
        (highByte << 8) | lowByte
    );
}


// ============================================================
// INITIALIZE MPU6500
// ============================================================

void initializeMPU()
{
    MPUWire.begin(
        MPU_SDA,
        MPU_SCL
    );

    MPUWire.setClock(400000);


    // Wake up

    writeMPURegister(
        0x6B,
        0x00
    );

    delay(100);


    // Accelerometer ±2g

    writeMPURegister(
        0x1C,
        0x00
    );


    // Accelerometer low-pass filter

    writeMPURegister(
        0x1D,
        0x03
    );

    delay(100);


    Serial.println(
        "MPU6500 initialized."
    );
}


// ============================================================
// ADXL345 READ REGISTER
// ============================================================

byte adxlReadRegister(
    byte reg
)
{
    Wire.beginTransmission(
        ADXL345_ADDR
    );

    Wire.write(reg);

    Wire.endTransmission(false);

    Wire.requestFrom(
        ADXL345_ADDR,
        (uint8_t)1
    );

    if (Wire.available())
    {
        return Wire.read();
    }

    return 0;
}


// ============================================================
// ADXL345 WRITE REGISTER
// ============================================================

void adxlWriteRegister(
    byte reg,
    byte value
)
{
    Wire.beginTransmission(
        ADXL345_ADDR
    );

    Wire.write(reg);
    Wire.write(value);

    Wire.endTransmission();
}


// ============================================================
// ADXL345 READ AXIS
// ============================================================

int16_t adxlReadAxis(
    byte lowRegister
)
{
    Wire.beginTransmission(
        ADXL345_ADDR
    );

    Wire.write(lowRegister);

    Wire.endTransmission(false);

    Wire.requestFrom(
        ADXL345_ADDR,
        (uint8_t)2
    );

    if (Wire.available() < 2)
    {
        return 0;
    }

    byte low = Wire.read();
    byte high = Wire.read();

    return (int16_t)(
        (high << 8) | low
    );
}


// ============================================================
// READ CALIBRATED ADXL345
// ============================================================

void readADXL345(
    float &x,
    float &y,
    float &z
)
{
    int16_t rawX =
        adxlReadAxis(
            ADXL_DATAX0
        );

    int16_t rawY =
        adxlReadAxis(
            ADXL_DATAY0
        );

    int16_t rawZ =
        adxlReadAxis(
            ADXL_DATAZ0
        );


    // ADXL345 full-resolution mode
    // approximately 256 LSB/g

    float xRaw =
        rawX / 256.0f;

    float yRaw =
        rawY / 256.0f;

    float zRaw =
        rawZ / 256.0f;


    // Apply calibration

    x =
        (
            xRaw
            -
            ADXL_OFFSET_X
        )
        /
        ADXL_SCALE_X;


    y =
        (
            yRaw
            -
            ADXL_OFFSET_Y
        )
        /
        ADXL_SCALE_Y;


    z =
        (
            zRaw
            -
            ADXL_OFFSET_Z
        )
        /
        ADXL_SCALE_Z;
}


// ============================================================
// INITIALIZE ADXL345
// ============================================================

void initializeADXL345()
{
    Wire.begin(
        ADXL_SDA,
        ADXL_SCL
    );

    Wire.setClock(400000);


    byte deviceID =
        adxlReadRegister(0x00);


    Serial.print(
        "ADXL345 Device ID: 0x"
    );

    if (deviceID < 16)
    {
        Serial.print("0");
    }

    Serial.println(
        deviceID,
        HEX
    );


    if (deviceID == 0xE5)
    {
        Serial.println(
            "ADXL345 detected."
        );
    }
    else
    {
        Serial.println(
            "WARNING: ADXL345 not detected!"
        );
    }


    // Full resolution, ±2g

    adxlWriteRegister(
        ADXL_DATA_FORMAT,
        0x08
    );


    // Measurement mode

    adxlWriteRegister(
        ADXL_POWER_CTL,
        0x08
    );

    delay(100);


    Serial.println(
        "ADXL345 initialized."
    );
}


// ============================================================
// READ GY-61
// ============================================================

void readGY61(
    float &x,
    float &y,
    float &z
)
{
    int rawX =
        analogRead(GY_X_PIN);

    int rawY =
        analogRead(GY_Y_PIN);

    int rawZ =
        analogRead(GY_Z_PIN);


    x =
        (
            (float)rawX
            -
            GY61_OFFSET_X
        )
        /
        GY61_SCALE_X;


    y =
        (
            (float)rawY
            -
            GY61_OFFSET_Y
        )
        /
        GY61_SCALE_Y;


    z =
        (
            (float)rawZ
            -
            GY61_OFFSET_Z
        )
        /
        GY61_SCALE_Z;
}


// ============================================================
// SENSOR COMPARISON
// ============================================================
//
// Compare all three sensors:
//
// GY-61 ↔ MPU6500
// GY-61 ↔ ADXL345
// MPU6500 ↔ ADXL345
//
// On X, Y and Z.
//
// ============================================================

bool sensorsAgree(
    float gyX,
    float gyY,
    float gyZ,

    float mpuX,
    float mpuY,
    float mpuZ,

    float adxlX,
    float adxlY,
    float adxlZ
)
{
    // GY-61 vs MPU6500

    if (
        fabsf(gyX - mpuX)
            > SENSOR_DEVIATION_THRESHOLD
        ||
        fabsf(gyY - mpuY)
            > SENSOR_DEVIATION_THRESHOLD
        ||
        fabsf(gyZ - mpuZ)
            > SENSOR_DEVIATION_THRESHOLD
    )
    {
        return false;
    }


    // GY-61 vs ADXL345

    if (
        fabsf(gyX - adxlX)
            > SENSOR_DEVIATION_THRESHOLD
        ||
        fabsf(gyY - adxlY)
            > SENSOR_DEVIATION_THRESHOLD
        ||
        fabsf(gyZ - adxlZ)
            > SENSOR_DEVIATION_THRESHOLD
    )
    {
        return false;
    }


    // MPU6500 vs ADXL345

    if (
        fabsf(mpuX - adxlX)
            > SENSOR_DEVIATION_THRESHOLD
        ||
        fabsf(mpuY - adxlY)
            > SENSOR_DEVIATION_THRESHOLD
        ||
        fabsf(mpuZ - adxlZ)
            > SENSOR_DEVIATION_THRESHOLD
    )
    {
        return false;
    }


    return true;
}


// ============================================================
// INITIALIZE TINYML
// ============================================================
void initializeTinyML()
{
    // --------------------------------------------------------
    // ADD ONLY THE OPERATORS REQUIRED BY THE MODEL
    // --------------------------------------------------------

    if (
        resolver.AddFullyConnected()
        != kTfLiteOk
    )
    {
        Serial.println(
            "ERROR: Failed to add FullyConnected."
        );

        while (true)
        {
            delay(1000);
        }
    }


    if (
        resolver.AddLogistic()
        != kTfLiteOk
    )
    {
        Serial.println(
            "ERROR: Failed to add Logistic."
        );

        while (true)
        {
            delay(1000);
        }
    }


    // --------------------------------------------------------
    // LOAD MODEL
    // --------------------------------------------------------

    model =
        tflite::GetModel(
            shm_tinyml_model_data
        );


    if (model == nullptr)
    {
        Serial.println(
            "ERROR: Model pointer is NULL."
        );

        while (true)
        {
            delay(1000);
        }
    }


    Serial.println(
        "Model pointer: OK"
    );


    Serial.print(
        "Model schema version: "
    );

    Serial.println(
        model->version()
    );


    Serial.print(
        "Supported schema version: "
    );

    Serial.println(
        TFLITE_SCHEMA_VERSION
    );


    if (
        model->version()
        !=
        TFLITE_SCHEMA_VERSION
    )
    {
        Serial.println(
            "ERROR: TFLite schema mismatch."
        );

        while (true)
        {
            delay(1000);
        }
    }


    Serial.println(
        "Schema version OK."
    );


    // --------------------------------------------------------
    // INTERPRETER
    // --------------------------------------------------------

    static tflite::MicroInterpreter
        static_interpreter(
            model,
            resolver,
            tensor_arena,
            TENSOR_ARENA_SIZE,
            nullptr
        );


    interpreter =
        &static_interpreter;


    // --------------------------------------------------------
    // ALLOCATE TENSORS
    // --------------------------------------------------------

    Serial.println(
        "Trying TFLite Micro setup..."
    );


    if (
        interpreter->AllocateTensors()
        !=
        kTfLiteOk
    )
    {
        Serial.println(
            "ERROR: AllocateTensors failed."
        );

        while (true)
        {
            delay(1000);
        }
    }


    // --------------------------------------------------------
    // GET TENSORS
    // --------------------------------------------------------

    input_tensor =
        interpreter->input(0);

    output_tensor =
        interpreter->output(0);


    if (
        input_tensor == nullptr
        ||
        output_tensor == nullptr
    )
    {
        Serial.println(
            "ERROR: Input/output tensor unavailable."
        );

        while (true)
        {
            delay(1000);
        }
    }


    Serial.println(
        "TinyML model loaded successfully."
    );


    Serial.print(
        "Input type: "
    );

    Serial.println(
        input_tensor->type
    );


    Serial.print(
        "Output type: "
    );

    Serial.println(
        output_tensor->type
    );


    Serial.print(
        "Input scale: "
    );

    Serial.println(
        input_tensor->params.scale,
        10
    );


    Serial.print(
        "Input zero point: "
    );

    Serial.println(
        input_tensor->params.zero_point
    );


    Serial.print(
        "Output scale: "
    );

    Serial.println(
        output_tensor->params.scale,
        10
    );


    Serial.print(
        "Output zero point: "
    );

    Serial.println(
        output_tensor->params.zero_point
    );
}

// ============================================================
// COLLECT SENSOR WINDOW
// ============================================================

bool collectSensorWindow()
{
    const unsigned long
        SAMPLE_INTERVAL_US =
            1000000UL
            /
            SAMPLE_RATE_HZ;


    unsigned long
        nextSampleTime =
            micros();


    int badSamples = 0;


    float maximumDifference =
        0.0f;


    // --------------------------------------------------------
    // DHT11
    // --------------------------------------------------------

    float currentTemperature =
        dht.readTemperature();

    float currentHumidity =
        dht.readHumidity();


    if (
        isnan(currentTemperature)
        ||
        isnan(currentHumidity)
    )
    {
        Serial.println(
            "DHT11 read failed."
        );

        currentTemperature =
            25.0f;

        currentHumidity =
            60.0f;
    }


    // --------------------------------------------------------
    // 100 SAMPLES
    // --------------------------------------------------------

    for (
        int i = 0;
        i < WINDOW_SIZE;
        i++
    )
    {
        // ====================================================
        // GY-61
        // ====================================================

        float gyX;
        float gyY;
        float gyZ;


        readGY61(
            gyX,
            gyY,
            gyZ
        );


        // ====================================================
        // MPU6500
        // ====================================================

        int16_t rawMpuX =
            readMPU16(0x3B);

        int16_t rawMpuY =
            readMPU16(0x3D);

        int16_t rawMpuZ =
            readMPU16(0x3F);


        // MPU6500 ±2g
        // 16384 LSB/g

        float mpuX =
    (
        ((float)rawMpuX / 16384.0f)
        -
        MPU_OFFSET_X
    )
    /
    MPU_SCALE_X;

float mpuY =
    (
        ((float)rawMpuY / 16384.0f)
        -
        MPU_OFFSET_Y
    )
    /
    MPU_SCALE_Y;

float mpuZ =
    (
        ((float)rawMpuZ / 16384.0f)
        -
        MPU_OFFSET_Z
    )
    /
    MPU_SCALE_Z;


        // ====================================================
        // ADXL345
        // ====================================================

        float adxlX;
        float adxlY;
        float adxlZ;


        readADXL345(
            adxlX,
            adxlY,
            adxlZ
        );


        // ====================================================
        // ALL PAIRWISE DIFFERENCES
        // ====================================================

        float diffGYMPUX =
            fabsf(
                gyX - mpuX
            );

        float diffGYMPUY =
            fabsf(
                gyY - mpuY
            );

        float diffGYMPUZ =
            fabsf(
                gyZ - mpuZ
            );


        float diffGYADXLX =
            fabsf(
                gyX - adxlX
            );

        float diffGYADXLY =
            fabsf(
                gyY - adxlY
            );

        float diffGYADXLZ =
            fabsf(
                gyZ - adxlZ
            );


        float diffMPUADXLX =
            fabsf(
                mpuX - adxlX
            );

        float diffMPUADXLY =
            fabsf(
                mpuY - adxlY
            );

        float diffMPUADXLZ =
            fabsf(
                mpuZ - adxlZ
            );


        // ====================================================
        // WORST DIFFERENCE
        // ====================================================

        float worstDifference =
            diffGYMPUX;


        if (
            diffGYMPUY >
            worstDifference
        )
        {
            worstDifference =
                diffGYMPUY;
        }


        if (
            diffGYMPUZ >
            worstDifference
        )
        {
            worstDifference =
                diffGYMPUZ;
        }


        if (
            diffGYADXLX >
            worstDifference
        )
        {
            worstDifference =
                diffGYADXLX;
        }


        if (
            diffGYADXLY >
            worstDifference
        )
        {
            worstDifference =
                diffGYADXLY;
        }


        if (
            diffGYADXLZ >
            worstDifference
        )
        {
            worstDifference =
                diffGYADXLZ;
        }


        if (
            diffMPUADXLX >
            worstDifference
        )
        {
            worstDifference =
                diffMPUADXLX;
        }


        if (
            diffMPUADXLY >
            worstDifference
        )
        {
            worstDifference =
                diffMPUADXLY;
        }


        if (
            diffMPUADXLZ >
            worstDifference
        )
        {
            worstDifference =
                diffMPUADXLZ;
        }


        if (
            worstDifference >
            maximumDifference
        )
        {
            maximumDifference =
                worstDifference;
        }


        // ====================================================
        // VALIDATE SAMPLE
        // ====================================================

        bool sampleOK =
            sensorsAgree(

                gyX,
                gyY,
                gyZ,

                mpuX,
                mpuY,
                mpuZ,

                adxlX,
                adxlY,
                adxlZ
            );


        if (!sampleOK)
        {
            badSamples++;
        }


        // ====================================================
// STORE ORIGINAL SENSOR DATA FOR TINYML

        lastGyX = gyX;
        lastGyY = gyY;
        lastGyZ = gyZ;

        lastMpuX = mpuX;
        lastMpuY = mpuY;
        lastMpuZ = mpuZ;

        lastAdxlX = adxlX;
        lastAdxlY = adxlY;
        lastAdxlZ = adxlZ;

// ====================================================
//
// MPU6500 -> MPU feature group
// ADXL345 -> ADXL feature group
// GY-61   -> validation ONLY
//

mpu_x[i] = mpuX;
mpu_y[i] = mpuY;
mpu_z[i] = mpuZ;

adxl_x[i] = adxlX;
adxl_y[i] = adxlY;
adxl_z[i] = adxlZ;

        // ====================================================
        // STORE FUSED ACCELERATION
        // ====================================================
        //
        // Existing feature extractor accepts two acceleration
        // streams, so the same fused signal is supplied to
        // both existing inputs.
        //
        // ====================================================


        // ====================================================
        // STRAIN
        // ====================================================
        //
        // Temporary until HX711 is integrated.
        //
        // ====================================================

        strain_data[i] =
            50.0f;


        // ====================================================
        // DHT11
        // ====================================================

        temperature[i] =
            currentTemperature;

        humidity[i] =
            currentHumidity;


        // ====================================================
        // 50 Hz TIMING
        // ====================================================

        nextSampleTime +=
            SAMPLE_INTERVAL_US;


        while (
            micros()
            <
            nextSampleTime
        )
        {
            delayMicroseconds(100);
        }
    }


    // ========================================================
    // VALIDATION RESULT
    // ========================================================

    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "     3-SENSOR VALIDATION"
    );

    Serial.println(
        "================================"
    );


    Serial.print(
        "Total samples       : "
    );

    Serial.println(
        WINDOW_SIZE
    );


    Serial.print(
        "Bad samples         : "
    );

    Serial.println(
        badSamples
    );


    Serial.print(
        "Allowed bad samples : "
    );

    Serial.println(
        MAX_BAD_SAMPLES
    );


    Serial.print(
        "Deviation threshold : "
    );

    Serial.print(
        SENSOR_DEVIATION_THRESHOLD,
        3
    );

    Serial.println(
        " g"
    );


    Serial.print(
        "Maximum deviation   : "
    );

    Serial.print(
        maximumDifference,
        4
    );

    Serial.println(
        " g"
    );


    // ========================================================

    validationBadSamples = badSamples;
    validationMaximumDeviation = maximumDifference;
    validationOK = (badSamples <= MAX_BAD_SAMPLES);

    // SENSOR MALFUNCTION
    // ========================================================

    if (
        badSamples >
        MAX_BAD_SAMPLES
    )
    {
        Serial.println();

        Serial.println(
            "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        );

        Serial.println(
            "      SENSOR MALFUNCTION"
        );

        Serial.println(
            "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        );


        Serial.println();

        Serial.println(
            "GY-61 / MPU6500 / ADXL345"
        );

        Serial.println(
            "show serious disagreement."
        );


        Serial.println();

        Serial.println(
            "100-sample window DISCARDED."
        );

        Serial.println(
            "TinyML inference CANCELLED."
        );


        Serial.println(
            "================================"
        );


        return false;
    }


    // ========================================================
    // SENSOR HEALTHY
    // ========================================================

    Serial.println();

    Serial.println(
        "SENSOR VALIDATION OK"
    );

    Serial.println(
        "All three accelerometers agree."
    );

    Serial.println(
        "Using average of:"
    );

    Serial.println(
        "GY-61 + MPU6500 + ADXL345"
    );

    Serial.println(
        "================================"
    );


    return true;
}


// ============================================================
// STANDARDIZE FEATURES
// ============================================================

void standardizeFeatures()
{
    for (
        int i = 0;
        i < FEATURE_COUNT;
        i++
    )
    {
        features[i] =
            (
                features[i]
                -
                SHM_SCALER_MEAN[i]
            )
            /
            SHM_SCALER_SCALE[i];
    }
}


// ============================================================
// TINYML INFERENCE
// ============================================================

void runInference()
{
    tinyMLAvailable = false;

    if (
        input_tensor->type
        !=
        kTfLiteInt8
    )
    {
        Serial.println(
            "ERROR: Model input is not INT8."
        );

        return;
    }


    // ========================================================
    // QUANTIZE
    // ========================================================

    for (
        int i = 0;
        i < FEATURE_COUNT;
        i++
    )
    {
        int32_t quantized =
            (int32_t)
            roundf(
                features[i]
                /
                input_tensor
                    ->params
                    .scale
            )
            +
            input_tensor
                ->params
                .zero_point;


        if (
            quantized > 127
        )
        {
            quantized = 127;
        }


        if (
            quantized < -128
        )
        {
            quantized = -128;
        }


        input_tensor
            ->data
            .int8[i] =
                (int8_t)
                quantized;
    }


    // ========================================================
    // INFERENCE
    // ========================================================

    if (
        interpreter->Invoke()
        !=
        kTfLiteOk
    )
    {
        Serial.println(
            "ERROR: TinyML inference failed."
        );

        return;
    }


    // ========================================================
    // OUTPUT
    // ========================================================

    float damage_probability =
        0.0f;


    if (
        output_tensor->type
        ==
        kTfLiteInt8
    )
    {
        int8_t raw_output =
            output_tensor
                ->data
                .int8[0];


        damage_probability =
            (
                (
                    (float)raw_output
                    -
                    output_tensor
                        ->params
                        .zero_point
                )
                *
                output_tensor
                    ->params
                    .scale
            );
    }
    else
    {
        Serial.println(
            "ERROR: Unexpected output type."
        );

        return;
    }


    // ========================================================
    // CLAMP
    // ========================================================

    if (
        damage_probability < 0.0f
    )
    {
        damage_probability =
            0.0f;
    }


    if (
        damage_probability > 1.0f
    )
    {
        damage_probability =
            1.0f;
    }


    float healthy_probability =
        1.0f
        -
        damage_probability;

    lastDamageProbability = damage_probability;
    lastHealthyProbability = healthy_probability;
    lastPrediction =
        (damage_probability >= 0.5f)
        ? "DAMAGED"
        : "HEALTHY";

    tinyMLAvailable = true;



    // ========================================================
    // RESULT
    // ========================================================

    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "       TINYML RESULT"
    );

    Serial.println(
        "================================"
    );


    Serial.print(
        "Node ID              : "
    );

    Serial.println(
        NODE_ID
    );


    Serial.print(
        "Healthy probability  : "
    );

    Serial.print(
        healthy_probability * 100.0f,
        2
    );

    Serial.println(
        " %"
    );


    Serial.print(
        "Damage probability   : "
    );

    Serial.print(
        damage_probability * 100.0f,
        2
    );

    Serial.println(
        " %"
    );


    if (
        damage_probability >= 0.5f
    )
    {
        Serial.println(
            "Prediction           : DAMAGED"
        );
    }
    else
    {
        Serial.println(
            "Prediction           : HEALTHY"
        );
    }


    Serial.println(
        "================================"
    );
}


// ============================================================
// DHT11 DISPLAY
// ============================================================

void readDHT11()
{
    currentTemperature =
        dht.readTemperature();

    currentHumidity =
        dht.readHumidity();


    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "       ENVIRONMENT DATA"
    );

    Serial.println(
        "================================"
    );


    if (
        isnan(currentTemperature)
        ||
        isnan(currentHumidity)
    )
    {
        Serial.println(
            "DHT11 read failed!"
        );
    }
    else
    {
        Serial.print(
            "Temperature : "
        );

        Serial.print(
            currentTemperature,
            1
        );

        Serial.println(
            " °C"
        );


        Serial.print(
            "Humidity    : "
        );

        Serial.print(
            currentHumidity,
            1
        );

        Serial.println(
            " %"
        );
    }


    Serial.println(
        "================================"
    );
}



// ============================================================
// WIFI CONNECTION
// ============================================================

void connectWiFi()
{
    if (WiFi.status() == WL_CONNECTED)
    {
        return;
    }

    Serial.println();
    Serial.println("================================");
    Serial.println("          WIFI CONNECTION");
    Serial.println("================================");

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting");

    unsigned long startTime = millis();

    while (
        WiFi.status() != WL_CONNECTED &&
        millis() - startTime < 20000UL
    )
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("WiFi connected.");
        Serial.print("ESP32 IP : ");
        Serial.println(WiFi.localIP());
        Serial.print("Server   : ");
        Serial.println(SERVER_URL);
    }
    else
    {
        Serial.println("WiFi connection failed.");
        Serial.println("Continuing sensor/TinyML operation.");
    }

    Serial.println("================================");
}


// ============================================================
// SEND DATA TO FASTAPI
// ============================================================

void sendIoTData()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi not connected. Data not sent.");
        return;
    }

    HTTPClient http;

    http.setConnectTimeout(3000);
    http.setTimeout(5000);

    if (!http.begin(SERVER_URL))
    {
        Serial.println("ERROR: HTTP begin failed.");
        return;
    }

    http.addHeader(
        "Content-Type",
        "application/json"
    );

    String json;
    json.reserve(4500);

    json += "{";
    json += "\"type\":\"sensor_update\",";
    json += "\"node_id\":\"";
    json += NODE_ID;
    json += "\",";
    json += "\"timestamp_ms\":";
    json += String(millis());
    json += ",";

    // Sensors
    json += "\"sensors\":{";

    json += "\"mpu6500\":{";
    json += "\"x\":";
    json += String(lastMpuX, 6);
    json += ",\"y\":";
    json += String(lastMpuY, 6);
    json += ",\"z\":";
    json += String(lastMpuZ, 6);
    json += "},";

    json += "\"adxl345\":{";
    json += "\"x\":";
    json += String(lastAdxlX, 6);
    json += ",\"y\":";
    json += String(lastAdxlY, 6);
    json += ",\"z\":";
    json += String(lastAdxlZ, 6);
    json += "},";

    json += "\"gy61\":{";
    json += "\"x\":";
    json += String(lastGyX, 6);
    json += ",\"y\":";
    json += String(lastGyY, 6);
    json += ",\"z\":";
    json += String(lastGyZ, 6);
    json += "}";

    json += "},";

    // Environment
    json += "\"environment\":{";

    // Keep numeric values for the backend schema.
    // If DHT failed, use the same fallback values used by
    // collectSensorWindow().
    if (isnan(currentTemperature))
    {
        json += "\"temperature\":25.0,";
    }
    else
    {
        json += "\"temperature\":";
        json += String(currentTemperature, 2);
        json += ",";
    }

    if (isnan(currentHumidity))
    {
        json += "\"humidity\":60.0";
    }
    else
    {
        json += "\"humidity\":";
        json += String(currentHumidity, 2);
    }

    json += "},";

    // HX711/strain not integrated yet.
    json += "\"strain\":{";
    json += "\"value\":null,";
    json += "\"unit\":\"microstrain\"";
    json += "},";

    // Validation
    json += "\"validation\":{";
    json += "\"status\":\"";
    json += validationOK ? "OK" : "ERROR";
    json += "\",";
    json += "\"total_samples\":";
    json += String(WINDOW_SIZE);
    json += ",";
    json += "\"bad_samples\":";
    json += String(validationBadSamples);
    json += ",";
    json += "\"allowed_bad_samples\":";
    json += String(MAX_BAD_SAMPLES);
    json += ",";
    json += "\"deviation_threshold\":";
    json += String(SENSOR_DEVIATION_THRESHOLD, 4);
    json += ",";
    json += "\"maximum_deviation\":";
    json += String(validationMaximumDeviation, 4);
    json += "},";
    // ========================================================
// RAW 29 FEATURES
// ========================================================

json += "\"features\":[";

for (int i = 0; i < FEATURE_COUNT; i++)
{
    json += String(rawFeatures[i], 8);

    if (i < FEATURE_COUNT - 1)
    {
        json += ",";
    }
}

json += "],";
    // TinyML
    json += "\"tinyml\":";

    if (!validationOK || !tinyMLAvailable)
    {
        json += "null";
    }
    else
    {
        json += "{";
        json += "\"prediction\":\"";
        json += lastPrediction;
        json += "\",";
        json += "\"damage_probability\":";
        json += String(lastDamageProbability, 6);
        json += ",";
        json += "\"healthy_probability\":";
        json += String(lastHealthyProbability, 6);
        json += "}";
    }

    json += "}";

    Serial.println();
    Serial.println("================================");
    Serial.println("       SENDING IOT DATA");
    Serial.println("================================");
    Serial.print("Validation : ");
    Serial.println(validationOK ? "OK" : "ERROR");
    Serial.print("TinyML     : ");

    if (!validationOK || !tinyMLAvailable)
    {
        Serial.println("BLOCKED");
    }
    else
    {
        Serial.println(lastPrediction);
    }

    Serial.print("HTTP POST  : ");
    Serial.println(SERVER_URL);

    int httpCode = http.POST(json);

    Serial.print("HTTP code  : ");
    Serial.println(httpCode);

    if (httpCode > 0)
    {
        Serial.print("Server     : ");
        Serial.println(http.getString());
    }
    else
    {
        Serial.print("HTTP error : ");
        Serial.println(http.errorToString(httpCode));
    }

    http.end();

    Serial.println("================================");
}


// ============================================================
// SETUP
// ============================================================

void setup()
{
    Serial.begin(115200);

    delay(2000);


    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "      SHM TinyML ESP32-S3"
    );

    Serial.println(
        "================================"
    );

    connectWiFi();
    // ========================================================
    // ADC
    // ========================================================

    analogReadResolution(12);


    // ========================================================
    // DHT11
    // ========================================================

    dht.begin();

    Serial.println(
        "DHT11 initialized."
    );


    // ========================================================
    // ADXL345
    // ========================================================

    initializeADXL345();


    // ========================================================
    // MPU6500
    // ========================================================

    initializeMPU();


    // ========================================================
    // TINYML
    // ========================================================

    initializeTinyML();


    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "         SYSTEM READY"
    );

    Serial.println(
        "================================"
    );
}


// ============================================================
// LOOP
// ============================================================

void loop()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        connectWiFi();
    }

    Serial.println();

    Serial.println(
        "Collecting 100 samples..."
    );

    readDHT11();
    // ========================================================
    // COLLECT + VALIDATE
    // ========================================================

    bool sensorsHealthy =
        collectSensorWindow();


    // ========================================================
    // SENSOR MALFUNCTION
    // ========================================================

    if (
        !sensorsHealthy
    )
    {
        Serial.println();

        Serial.println(
            "Window rejected."
        );

        Serial.println(
            "No feature extraction."
        );

        Serial.println(
            "No TinyML inference."
        );

        Serial.println(
            "Waiting for next window..."
        );


        // Send SENSOR_ERROR to FastAPI.
        // TinyML is automatically sent as null.
        sendIoTData();


        delay(1000);

        return;
    }


    // ========================================================
    // FEATURE EXTRACTION
    // ========================================================

    Serial.println();

    Serial.println(
        "Extracting 29 features..."
    );


    shm_extract_features(
    mpu_x,
    mpu_y,
    mpu_z,

    adxl_x,
    adxl_y,
    adxl_z,

    strain_data,

    temperature,
    humidity,

    rawFeatures
);
for (int i = 0; i < FEATURE_COUNT; i++)
{
    features[i] = rawFeatures[i];
}


    // ========================================================
    // RAW FEATURES
    // ========================================================

    Serial.println();

    Serial.println(
        "================================"
    );

    Serial.println(
        "       RAW 29 FEATURES"
    );

    Serial.println(
        "================================"
    );


    for (
        int i = 0;
        i < FEATURE_COUNT;
        i++
    )
    {
        Serial.print(
            "Feature["
        );

        Serial.print(
            i
        );

        Serial.print(
            "] = "
        );

        Serial.println(
            features[i],
            6
        );
    }


    Serial.println(
        "================================"
    );


    // ========================================================
    // STANDARDIZATION
    // ========================================================

    Serial.println();

    Serial.println(
        "Standardizing features..."
    );


    standardizeFeatures();
    Serial.println();
Serial.println("================================");
Serial.println("   STANDARDIZED FEATURES");
Serial.println("================================");

for (int i = 0; i < FEATURE_COUNT; i++)
{
    Serial.print("Feature[");
    Serial.print(i);
    Serial.print("] = ");
    Serial.println(features[i], 6);
}

Serial.println("================================");

    // ========================================================
    // TINYML
    // ========================================================

    Serial.println(
        "Running TinyML..."
    );


    runInference();


    // ========================================================
    // DHT11
    // ========================================================

    


    // Send the processed real sensor/TinyML state to FastAPI.
    sendIoTData();


    delay(1000);
}