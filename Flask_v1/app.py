"""GAS の家計データを取得して地図テンプレートへ渡す最小 Flask アプリ。"""

from flask import Flask, render_template
import requests

app = Flask(__name__)


@app.route('/')
def home():
    """GAS の JSON を取得し、`index.html` に埋め込んで表示する。"""
    url = ''  # Google Apps Script の Web アプリ URL
    response = requests.get(url, timeout=10)
    data_json = response.json()
    return render_template('index.html', data=data_json)


if __name__ == '__main__':
    app.run(debug=True)
