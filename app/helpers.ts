import axios from 'axios';

export const getFileBlob = async (uri: string) => {
    const response = await fetch(uri);
    return await response.blob();
};

export const predictImage = async (uriImage: string, fileName: string, imageType: string) => {
    try {
        const formData = new FormData();
        
        // Формируем объект файла
        formData.append('file', {
          image: uriImage,
          name: fileName || 'image.jpg', // Обязательное поле
          type: imageType || 'image/jpeg', // MIME-тип
        });

        const blob = await getFileBlob(uriImage);
        formData.append('file', blob, fileName || 'image.jpg');

        // Отправляем запрос через axios
        const response = await axios.post(
          'http://127.0.0.1:5000/predict', 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
    
        // Обработка успешного ответа
        const { digit, probabilities } = response.data;
        

        return { digit, probabilities };
      } catch (error) {
        // Детальная обработка ошибок
        let errorMessage = 'Ошибка запроса';
        
        if (error.response) {
          // Сервер ответил с кодом ошибки
          errorMessage = error.response.data.error || `HTTP error ${error.response.status}`;
        } else if (error.request) {
          // Запрос был отправлен, но нет ответа
          errorMessage = 'Нет ответа от сервера';
        }
        
        alert(errorMessage);
        console.error('Ошибка распознавания:', error);
      }
}
