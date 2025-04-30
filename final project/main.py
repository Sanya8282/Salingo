from flask import Flask, render_template, jsonify, request
import audio_recognizer as ar

app = Flask(__name__)

# Слова для разных языков и уровней сложности
WORDS_DATABASE = {
    'cs-CZ': {
        'easy': ['ahoj', 'dům', 'jablko', 'voda', 'slunce', 'matka', 'otec', 'kniha', 'škola', 'auto'],
        'normal': ['dobrý den', 'restaurace', 'knihovna', 'nádraží', 'letiště', 'nemocnice', 'univerzita', 'divadlo', 'kavárna', 'obchod'],
        'hard': ['neuvěřitelné', 'zodpovědnost', 'překvapení', 'všechno nejlepší', 'porozumění', 'zdvořilost', 'sousedství', 'spokojenost', 'zachránit', 'obdivuhodný']
    },
    # ... остальные языки (как в вашем исходном коде)
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_words', methods=['POST'])
def get_words():
    data = request.json
    lang = data.get('lang')
    difficulty = data.get('difficulty')
    
    if lang in WORDS_DATABASE and difficulty in WORDS_DATABASE[lang]:
        return jsonify({'words': WORDS_DATABASE[lang][difficulty]})
    return jsonify({'error': 'Invalid language or difficulty'}), 400

@app.route('/recognize', methods=['POST'])
def recognize():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file'}), 400
    
    audio_file = request.files['audio']
    lang = request.form.get('lang', 'en-US')
    
    try:
        text = ar.recognize_audio(audio_file, lang)
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)