/**
 * Web アプリ GET エンドポイント。
 * スプレッドシートの家計データを地図描画向け JSON に変換して返す。
 */
function doGet(e) {
  var data = Sheet.getDataRange().getValues();
  var output = [];

  // 1行目はヘッダー想定のため 2行目から処理する。
  for (var i = 1; i < data.length; i++) {
    var year = data[i][0];
    var month = data[i][1];
    var day = data[i][2];
    var amount = data[i][3];
    var shop = data[i][4];
    var lat = data[i][9];
    var lng = data[i][10];

    // フロントエンドが使いやすい 1 レコード形式へ整形する。
    var dateString = year + "-" + month + "-" + day;
    var description = shop + "\n金額:" + amount + "円\n日付:" + dateString;

    output.push({
      year: year,
      month: month,
      day: day,
      lat: lat,
      lng: lng,
      size: amount,
      shop: shop,
      description: description,
      date: dateString
    });
  }

  // JSON で返して、Flask 側からそのまま読み取れるようにする。
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}
