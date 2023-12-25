from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    import requests

    url = ''  # goodle app scriptのURL
    response = requests.get(url)

    # レスポンスがJSON形式の場合、Pythonの辞書に変換
    data_json = response.json()
    return render_template("index.html", data=data_json)

if __name__ == '__main__':
    app.run(debug=True)
