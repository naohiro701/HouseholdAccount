/**
 * 金額入力を受け取り、新規行に日付と金額を保存する。
 */
function taskMoney(message) {
  Debug.getRange(3, 1).setValue("01");
  var targetRow = getLastValue()[0] + 1;
  var today = new Date();

  Sheet.getRange(targetRow, 1).setValue(today.getFullYear());
  Sheet.getRange(targetRow, 2).setValue(today.getMonth() + 1);
  Sheet.getRange(targetRow, 3).setValue(today.getDate());
  Sheet.getRange(targetRow, 4).setValue(message.text);
  Debug.getRange(3, 3).setValue("01");
}

/**
 * 店舗名・住所・座標を最新行へ保存する。
 */
function taskLocation(lat, lon, address, shopName) {
  Debug.getRange(4, 1).setValue("01");
  var targetRow = getLastValue()[0];

  Sheet.getRange(targetRow, 5).setValue(shopName);
  Sheet.getRange(targetRow, 9).setValue(address);
  Sheet.getRange(targetRow, 10).setValue(lat);
  Sheet.getRange(targetRow, 11).setValue(lon);
}

/** 大分類を保存する。 */
function taskItem1(message) {
  Sheet.getRange(getLastValue()[0], 6).setValue(message.text);
}

/** 中分類を保存する。 */
function taskItem2(message) {
  Sheet.getRange(getLastValue()[0], 7).setValue(message.text);
}

/** 小分類を保存する。 */
function taskItem3(message) {
  Sheet.getRange(getLastValue()[0], 8).setValue(message.text);
}

/**
 * LINE Flex Message (ボタン一覧) を生成する。
 */
function createFlexMessage(categories) {
  var flexContents = categories.map(function (category) {
    return {
      type: "button",
      action: { type: "message", label: category, text: category },
      style: "link"
    };
  });

  return {
    type: "flex",
    altText: "カテゴリー一覧",
    contents: {
      type: "carousel",
      contents: flexContents.map(function (content) {
        return {
          type: "bubble",
          size: "nano",
          body: { type: "box", layout: "vertical", contents: [content] }
        };
      })
    }
  };
}

/**
 * 単純なテキスト返信オブジェクトを返す。
 */
function handleTextMessage(messageText) {
  return { type: "text", text: messageText };
}
