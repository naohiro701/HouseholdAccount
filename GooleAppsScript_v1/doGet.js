function doGet(e){
    var data = Sheet.getDataRange().getValues();
    var output = [];

    // 住所から緯度経度への変換（Geocoding）とサイズデータの取得
    for (var i = 1; i < data.length; i++) {
        var size = data[i][3]; // サイズ
        var lat = data[i][9]; // 住所
        var lng = data[i][10]; // 住所
        var year = data[i][0]
        var month = data[i][1]
        var day = data[i][2]
        var dateString = year+"-"+month+"-"+day
        var date = new Date(dateString);
        var description = data[i][4]+"\n金額:"+data[i][3]+"円\n日付:"+dateString
        //
        output.push({lat: lat, lng: lng, size: size, description: description, date:dateString});
        }
    // return output

    // JSON形式で返す
    return ContentService.createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON);
}