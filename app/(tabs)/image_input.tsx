import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { predictImage } from '../helpers';

export default function imageInput () {
    const [image, setImage] = useState(null);
    const [fileName, setFileName] = useState('');
    const [imageType, setImageType] = useState('');
    const [captionPrediction, setCaptionPrediction] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            setImage(asset.uri);
            setFileName(asset.uri.split('/').pop());
            setImageType(asset.mimeType || 'image/jpeg');
        }
    };

    const removeImage = () => {
        setImage(null);
        setFileName('');
        setImageType(null);
    };
    const handleRecognize = async () => {
      if (!image) return;
    
      const result = await predictImage(image, fileName, imageType);
      const msg = `Распознано: ${result.digit}\nУверенность: ${Math.max(...result.probabilities).toFixed(2) * 100}%`

      setCaptionPrediction(msg);
    };

    return (
    <View style={styles.container}>
        {/* Кнопка выбора изображения */}
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Выбрать изображение</Text>
        </TouchableOpacity>

        {/* Область предпросмотра изображения */}
        {image && (
        <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
                <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
        </View>
        )}

        {/* Label с названием */}
        <Text style={styles.label}>
            {captionPrediction || ''}
        </Text>

        {/* Кнопка распознавания */}
        {image && (
        <TouchableOpacity style={styles.recognizeButton} onPress={handleRecognize}>
            <Text style={styles.buttonText}>Распознать</Text>
        </TouchableOpacity>
        )}
    </View>);
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
    },
    uploadButton: {
      backgroundColor: '#2196F3',
      padding: 15,
      borderRadius: 5,
      marginBottom: 20,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
    imageContainer: {
      width: 300,
      height: 300,
      marginBottom: 20,
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    removeButton: {
      position: 'absolute',
      right: 10,
      top: 10,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 15,
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeText: {
      color: 'white',
      fontSize: 24,
      lineHeight: 30,
    },
    label: {
      fontSize: 16,
      marginBottom: 20,
      color: '#666',
    },
    recognizeButton: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 5,
    },
});