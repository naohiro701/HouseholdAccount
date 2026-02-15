/**
 * 動作確認用: 食費カテゴリの Flex Message をログへ出す。
 */
function debug() {
  console.log(createFlexMessage(ITEM["生活費(食住)"] ? Object.keys(ITEM["生活費(食住)"]) : ITEM_1));
}

/**
 * LINE Webhook エントリーポイント。
 * 受信メッセージを解析し、返信メッセージを返す。
 */
function doPost(e) {
  var eventData = JSON.parse(e.postData.contents).events[0];
  var replyToken = eventData.replyToken;
  var userMessage = eventData.message;
  var url = "https://api.line.me/v2/bot/message/reply";

  var payload = {
    replyToken: replyToken,
    messages: [Main(userMessage)]
  };

  UrlFetchApp.fetch(url, {
    payload: JSON.stringify(payload),
    method: "POST",
    headers: { Authorization: "Bearer " + LINE_TOKEN },
    contentType: "application/json"
  });
}

/**
 * 受信メッセージの内容に応じて保存処理と返信内容を切り替える。
 */
function Main(message) {
  Debug.getRange(2, 1).setValue("01");
  var flagToDo = CheckSteps(message);
  Debug.getRange(2, 2).setValue(flagToDo);

  switch (flagToDo) {
    case "number":
      taskMoney(message);
      return createFlexMessage(ITEM_1);

    case "location":
      taskLocation(message.latitude, message.longitude, message.address, "");
      return handleTextMessage("位置情報を追加しました。");

    case "text":
      var geocodeData = getGeocodeFacility(message.text) || {
        address: "取得できませんでした",
        latitude: "",
        longitude: ""
      };
      taskLocation(geocodeData.latitude, geocodeData.longitude, geocodeData.address, message.text);
      return handleTextMessage("住所：" + geocodeData.address);

    case "item1":
      taskItem1(message);
      return createFlexMessage(findSubcategories(ITEM, message.text));

    case "item2":
      taskItem2(message);
      return createFlexMessage(findSubcategories(ITEM, message.text));

    case "item3":
      taskItem3(message);
      return handleTextMessage("登録いたしました。");

    default:
      return handleTextMessage("対応していないメッセージです。");
  }
}

/**
 * 入力メッセージの種類を判定し、処理フラグを返す。
 */
function CheckSteps(userMessage) {
  var messageType = userMessage.type;
  var messageText = userMessage.text;

  if (["sticker", "image", "video", "audio", "file", "location"].includes(messageType)) {
    return messageType;
  }

  if (messageType === "text") {
    if (isOnlyNumbers(messageText)) return "number";
    if (ITEM_1.includes(messageText)) return "item1";
    if (ITEM_2.includes(messageText)) return "item2";
    if (ITEM_3.includes(messageText)) return "item3";
    return "text";
  }

  return "other";
}

/**
 * 半角数字だけで構成された文字列か判定する。
 */
function isOnlyNumbers(str) {
  return /^\d+$/.test(str);
}
