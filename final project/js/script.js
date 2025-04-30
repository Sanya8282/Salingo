let selectedLanguage = '';
let selectedDifficulty = '';
let currentWord = '';
let score = 0;
let attempts = 0;
let words = [];
let mediaRecorder;
let audioChunks = [];

// Выбор страны
document.querySelectorAll('.country').forEach(country => {
    country.addEventListener('click', function() {
        selectedLanguage = this.getAttribute('data-lang');
        const countryName = this.getAttribute('data-name');
        
        document.querySelector('.difficulty').style.display = 'block';
        document.querySelector('.game-area').style.display = 'none';
        
        alert(`You select ${countryName}, lets start?`);
    });
});

// Выбор уровня сложности
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        selectedDifficulty = this.getAttribute('data-difficulty');
        
        try {
            const response = await fetch('/get_words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lang: selectedLanguage,
                    difficulty: selectedDifficulty
                })
            });
            
            const data = await response.json();
            if (data.words) {
                words = [...data.words];
                document.querySelector('.game-area').style.display = 'block';
                startGame();
            } else {
                throw new Error(data.error || 'Failed to load words');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load words. Please try again.');
        }
    });
});

// Инициализация микрофона
async function initMicrophone() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];
            
            try {
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.wav');
                formData.append('lang', selectedLanguage);
                
                const response = await fetch('/recognize', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.text) {
                    processRecognitionResult(data.text);
                } else {
                    throw new Error(data.error || 'Recognition failed');
                }
            } catch (error) {
                console.error('Recognition error:', error);
                document.querySelector('.result').className = 'result incorrect';
                document.querySelector('.result').textContent = 'Ошибка распознавания. Попробуйте еще раз.';
            } finally {
                document.querySelector('.mic-btn').textContent = '🎤';
                document.querySelector('.mic-btn').disabled = false;
            }
        };
    } catch (error) {
        console.error('Microphone access error:', error);
        alert('Не удалось получить доступ к микрофону. Проверьте разрешения.');
    }
}

// Обработка результата распознавания
function processRecognitionResult(recognizedText) {
    document.querySelector('.result').textContent = `Вы сказали: ${recognizedText}`;
    
    attempts++;
    if (recognizedText.toLowerCase() === currentWord.toLowerCase()) {
        document.querySelector('.result').className = 'result correct';
        document.querySelector('.result').textContent += ' - Правильно!';
        score++;
    } else {
        document.querySelector('.result').className = 'result incorrect';
        document.querySelector('.result').textContent += ` - Неправильно. Правильно: ${currentWord}`;
    }
    
    updateScore();
    document.querySelector('.next-btn').style.display = 'inline-block';
}

// Остальные функции (startGame, nextWord, updateScore) как в вашем исходном коде