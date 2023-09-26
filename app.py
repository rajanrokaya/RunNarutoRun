import sqlite3
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder="templates", static_url_path='/static', static_folder='static')
app.secret_key = "tH1$iz@$3cRetK€y" 
# Echt ihr Ernst? Secrets hardcoded im Quelltext?
# Wie wäre es mit einer Umgebungsvariable, die Sie mittels eines Secrets in Kubernetes setzen können?
# So (oder ähnlich) wäre ein Best Practice Ansatz!

DATABASE = 'instance/leaderboard.db'


def create_table():
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS highscores
                        (id INTEGER PRIMARY KEY, 
                        username TEXT, score INTEGER, 
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
                    ''')
    connection.commit()
    connection.close()


@app.route('/', methods=['GET'])
def index():
    create_table()
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute('SELECT username, score, timestamp FROM highscores ORDER BY score DESC, timestamp ASC LIMIT 5')
    rows = cursor.fetchall()

    ranked_rows = []
    ranking = 0
    prev_score = None

    for row in rows:
        username, score, timestamp = row

        if prev_score is None or score < prev_score:
            ranking += 1

        ranked_rows.append((ranking, username, score, timestamp))
        prev_score = score

    connection.close()
    return render_template('index.html', highscores=ranked_rows)


@app.route('/get_high_scores', methods=['GET'])
def get_high_scores():
    create_table()
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute('SELECT username, score, timestamp FROM highscores ORDER BY score DESC, timestamp ASC LIMIT 5')
    rows = cursor.fetchall()

    ranked_rows = []
    ranking = 0
    prev_score = None

    for row in rows:
        username, score, timestamp = row

        if prev_score is None or score < prev_score:
            ranking += 1

        ranked_rows.append({"ranking": ranking, "username": username, "score": score, "timestamp": timestamp})
        prev_score = score

    connection.close()
    return jsonify(highscores=ranked_rows)


@app.route('/submit_score', methods=['POST'])
def submit_score():
    name = request.form.get('playerName')
    new_score = int(request.form.get('score'))

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute('INSERT INTO highscores (username, score) VALUES (?, ?)', (name, new_score))
    connection.commit()

    cursor.execute('SELECT score FROM highscores WHERE username = ? ORDER BY score DESC', (name,))
    scores = cursor.fetchall()

    connection.close()

    return jsonify({"message": "Score submitted successfully", "scores": scores})


@app.route('/delete_score', methods=['DELETE'])
def delete_score():
    name = request.form.get('playerName')
    score_to_delete = int(request.form.get('score'))

    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    cursor.execute('SELECT id FROM highscores WHERE username = ? AND score = ?', (name, score_to_delete))
    rows_to_delete = cursor.fetchall()

    if rows_to_delete:
        lowest_id = min(rows_to_delete)[0]
        cursor.execute('DELETE FROM highscores WHERE id = ?', (lowest_id,))
        connection.commit()
        connection.close()
        return jsonify({"message": f"One occurrence of score {score_to_delete} for {name} deleted successfully."}), 200
    else:
        connection.close()
        return jsonify({
            "message": f"Either the 'SCORE': {score_to_delete} or the 'NAME': {name} is not found in the database."}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
