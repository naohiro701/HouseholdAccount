/******************************************************/

function getCellData(targetRow){
    // 最後のセルの値を取得
    const year = Sheet.getRange(targetRow, 1).getValue();
    const month = Sheet.getRange(targetRow, 2).getValue();
    const day = Sheet.getRange(targetRow, 3).getValue();
    const payment = Sheet.getRange(targetRow, 4).getValue();
    const shopName = Sheet.getRange(targetRow, 5).getValue();
    const mainTerm = Sheet.getRange(targetRow, 6).getValue();
    const subTerm = Sheet.getRange(targetRow, 7).getValue();
    const address = Sheet.getRange(targetRow, 8).getValue();
    const lat = Sheet.getRange(targetRow, 9).getValue();
    const lon = Sheet.getRange(targetRow, 10).getValue();
    const memo = Sheet.getRange(targetRow, 11).getValue();

    return {"year": year,
            "month": month,
            "day": day,
            "payment": payment,
            "shopName": shopName,
            "mainTerm": mainTerm,
            "subTerm": subTerm,
            "address": address,
            "lat": lat,
            "lon": lon,
            "memo": memo
        }
}

/******************************************************/

function getLastValue(){
    const lastRow = Sheet.getLastRow();
    const lastColumn = Sheet.getLastColumn();
    return [lastRow, lastColumn];
}

/******************************************************/

/**
 * 指定された店舗名に基づいて、その住所、緯度、経度を返す関数。
 * @param {string} facilityName - ジオコーディングする店舗の名前。
 * @return {Object|null} ジオコーディングの結果（住所、緯度、経度）を含むオブジェクト、または店舗が見つからない場合はnull。
 */
function getGeocodeFacility(facilityName) {
    // Google Maps APIのジオコーダーを初期化
    var geocoder = Maps.newGeocoder();
    geocoder.setLanguage('ja'); // 言語を日本語に設定

    // 指定された店舗名でジオコーディングを実行
    var response = geocoder.geocode(facilityName);

    // ジオコーディングの結果が存在するかチェック
    if (response['results'][0] != null) {
        // 緯度と経度を取得
        var location = response['results'][0]['geometry']['location'];
        // 住所を取得
        var address = response['results'][0]['formatted_address'];

        // 住所、緯度、経度を含むオブジェクトを返す
        return {
        "address": address,
        "latitude": location['lat'],
        "longitude": location['lng']
        };
    } else {
        // 結果がない場合はnullを返す
        return null;
    }
}

/******************************************************/