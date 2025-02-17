import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, Alert } from 'react-native';
import axios from 'axios';

const DIGIT_SIZE = 280; // Общий размер области рисования
const PIXEL_SIZE = DIGIT_SIZE / 28; // Размер одного пикселя

const DrawingScreen = () => {
  const [pixels, setPixels] = useState(Array(28).fill().map(() => Array(28).fill(false)));
  const [captionPrediction, setCaptionPrediction] = useState(null);

  // Создание PanResponder для обработки рисования
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const x = Math.floor(locationX / PIXEL_SIZE);
      const y = Math.floor(locationY / PIXEL_SIZE);
      
      if (x >= 0 && x < 28 && y >= 0 && y < 28) {
        const newPixels = [...pixels];
        newPixels[y][x] = true;
        setPixels(newPixels);
      }
    }
  });

  // Обработчик сброса рисунка
  const handleReset = () => {
    setPixels(Array(28).fill().map(() => Array(28).fill(false)));
  };

  const handleRecognize = async () => {
    try {
      // 1. Преобразуем двумерный массив в плоский (с инверсией цветов)
      const pixelData = pixels.flat().map(cell => cell ? 0 : 255);
  
      // 2. Отправляем JSON на сервер
      const response = await axios.post('http://127.0.0.1:5000/predict_json', {
        pixels: pixelData // [255, 0, 255, ...] (784 элемента)
      });
  
      // 3. Обрабатываем ответ
      const result = response.data;
      const msg = `Распознано: ${result.digit}\nУверенность: ${Math.max(...result.probabilities).toFixed(2) * 100}%`

      setCaptionPrediction(msg);
  
    } catch (error) {
      Alert.alert('Ошибка', error.response?.data?.error || 'Ошибка сети');
    }
  };

  return (
    <View style={styles.container}>
      {/* Область рисования */}
      <View style={styles.drawingContainer}>
        <View 
          style={styles.drawingArea}
          {...panResponder.panHandlers}
        >
          {pixels.map((row, y) => (
            <View key={y} style={styles.row}>
              {row.map((filled, x) => (
                <View
                  key={x}
                  style={[
                    styles.pixel,
                    { backgroundColor: filled ? 'black' : 'white' }
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>

    {/* Label с названием */}
    <Text style={styles.label}>
        {captionPrediction || ''}
    </Text>

      {/* Кнопка сброса */}
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Сброс</Text>
      </TouchableOpacity>

      {/* Кнопка распознавания */}
      <TouchableOpacity 
        style={[styles.button, styles.recognizeButton]} 
        onPress={handleRecognize}
      >
        <Text style={styles.buttonText}>Распознать</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  drawingContainer: {
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  drawingArea: {
    width: DIGIT_SIZE,
    height: DIGIT_SIZE,
    backgroundColor: 'black',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    width: PIXEL_SIZE,
    height: PIXEL_SIZE,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
  },
  recognizeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
});

export default DrawingScreen;