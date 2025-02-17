from flask import Flask, request, jsonify, make_response
from keras.models import load_model
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# Загрузка модели
model = load_model('mnist_model.keras')

def preprocess_image(image):
    img = image.convert('L').resize((28, 28))
    img_array = np.array(img)
    img_array = 255 - img_array  # Инверсия цветов
    img_array = img_array.astype('float32') / 255.0
    img_array = np.expand_dims(img_array, axis=(0, -1))
    return img_array

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    # Добавляем подробное логирование
    print("Received files:", len(request.files))
    
    if 'file' not in request.files:
        return _corsify_actual_response(jsonify({'error': 'No file part'})), 400
        
    file = request.files['file']
    
    # Добавляем проверку пустого файла
    if file.filename == '' or not file:
        return _corsify_actual_response(jsonify({'error': 'Empty file'})), 400

    try:
        print("Received file:", file.filename, "Content type:", file.content_type)
        img_bytes = file.read()
        
        if not img_bytes:
            return _corsify_actual_response(jsonify({'error': 'Empty file content'})), 400
            
        image = Image.open(io.BytesIO(img_bytes))
        
        # Добавляем проверку формата изображения
        if image.format not in ['JPEG', 'PNG', 'BMP']:
            return _corsify_actual_response(jsonify({'error': 'Unsupported image format'})), 400
            
        processed_image = preprocess_image(image)
        
        # Проверка формы массива
        if processed_image.shape != (1, 28, 28, 1):
            return _corsify_actual_response(jsonify({'error': 'Invalid image shape after processing'})), 400
            
        predictions = model.predict(processed_image)
        predicted_digit = int(np.argmax(predictions[0]))
        
        return _corsify_actual_response(jsonify({
            'digit': predicted_digit,
            'probabilities': predictions[0].tolist()
        }))
        
    except Exception as e:
        # Логируем полную ошибку
        print("Error:", str(e))
        return _corsify_actual_response(jsonify({
            'error': f'Processing error: {str(e)}'
        })), 500

@app.route('/predict_json', methods=['POST', 'OPTIONS'])
def predict_json():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    try:
        # 1. Получаем и проверяем данные
        data = request.json
        if not data or 'pixels' not in data:
            return _corsify_actual_response(jsonify(error="Missing pixels array")), 400
            
        pixels = data['pixels']
        
        # 2. Проверка размера массива
        if len(pixels) != 784:
            return _corsify_actual_response(jsonify(error="Array must contain 784 elements (28x28)")), 400

        # 3. Преобразование в numpy array
        img_array = np.array(pixels, dtype='float32').reshape(1, 28, 28, 1)
        
        # 4. Нормализация (0-255 -> 0.0-1.0)
        img_array /= 255.0
        
        # 5. Делаем предсказание
        prediction = model.predict(img_array)
        digit = int(np.argmax(prediction[0]))

        return _corsify_actual_response(jsonify({
            'digit': digit,
            'probabilities': prediction[0].tolist()
        }))

    except Exception as e:
        return _corsify_actual_response(jsonify(error=f"Processing error: {str(e)}")), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)