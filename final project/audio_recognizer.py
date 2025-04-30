import speech_recognition as sr
import io

def recognize_audio(audio_file, language="en-US"):
    recognizer = sr.Recognizer()
    
    # Для обработки аудио из файла
    with io.BytesIO(audio_file.read()) as audio_stream:
        with sr.AudioFile(audio_stream) as source:
            audio = recognizer.record(source)
            
    try:
        return recognizer.recognize_google(audio, language=language)
    except sr.UnknownValueError:
        raise Exception("Google Speech Recognition could not understand audio")
    except sr.RequestError as e:
        raise Exception(f"Could not request results from Google Speech Recognition service; {e}")