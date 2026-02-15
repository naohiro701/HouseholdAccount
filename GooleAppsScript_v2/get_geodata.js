/**
 * 店舗名(住所文字列)をジオコーディングして、住所と座標を返す。
 * 目的: レシートから取得した店舗情報を地図・台帳に再利用できる形へ変換する。
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

  // 見つからないケースも戻り値の形を固定して扱いやすくする。
  return {
    address: "unknown",
    latitude: "unknown",
    longitude: "unknown"
  };
}
