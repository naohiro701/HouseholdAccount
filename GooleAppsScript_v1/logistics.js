/**
 * 指定行の家計データをオブジェクトとして返す。
 * 目的: 呼び出し側が列番号を意識せずに値を扱えるようにする。
 */
function getCellData(targetRow) {
  return {
    year: Sheet.getRange(targetRow, 1).getValue(),
    month: Sheet.getRange(targetRow, 2).getValue(),
    day: Sheet.getRange(targetRow, 3).getValue(),
    payment: Sheet.getRange(targetRow, 4).getValue(),
    shopName: Sheet.getRange(targetRow, 5).getValue(),
    mainTerm: Sheet.getRange(targetRow, 6).getValue(),
    subTerm: Sheet.getRange(targetRow, 7).getValue(),
    address: Sheet.getRange(targetRow, 8).getValue(),
    lat: Sheet.getRange(targetRow, 9).getValue(),
    lon: Sheet.getRange(targetRow, 10).getValue(),
    memo: Sheet.getRange(targetRow, 11).getValue()
  };
}

/**
 * シートの最終行・最終列を返すユーティリティ。
 * 目的: 追記位置の計算を一箇所に集約する。
 */
function getLastValue() {
  return [Sheet.getLastRow(), Sheet.getLastColumn()];
}

/**
 * 店舗名(または住所文字列)をジオコーディングして住所と座標を返す。
 * 見つからない場合は null を返す。
 */
function getGeocodeFacility(facilityName) {
  var geocoder = Maps.newGeocoder();
  geocoder.setLanguage('ja');
  var response = geocoder.geocode(facilityName);

  if (response.results && response.results[0]) {
    var location = response.results[0].geometry.location;
    return {
      address: response.results[0].formatted_address,
      latitude: location.lat,
      longitude: location.lng
    };
  }

  return null;
}
