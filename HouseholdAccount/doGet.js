
function doGet() {
    Logger.log(Session.getActiveUser());
    const htmlOutput = HtmlService.createTemplateFromFile("index").evaluate();
    htmlOutput.setTitle('家計簿×地図');
    return htmlOutput;
}

function getData() {
    var data = Sheet.getDataRange().getValues();
    var output = [];

    // 住所から緯度経度への変換（Geocoding）とサイズデータの取得
    for (var i = 1; i < data.length; i++) {
    var size = data[i][3]; // サイズ
    var lat = data[i][9]; // 住所
    var lng = data[i][10]; // 住所
    var description = data[i][4]
    output.push({lat: lat, lng: lng, size: size, description: description});
    }
    return output

    // JSON形式で返す
    // return ContentService.createTextOutput(JSON.stringify(output))
    //   .setMimeType(ContentService.MimeType.JSON);
}