/******************************************************/

function debug() {
console.log(createFlexMessage(TERM["食費"]));
}

/******************************************************/

var replyToken = "";

function doPost(e) {
    const eventData = JSON.parse(e.postData.contents).events[0];
    const replyToken = eventData.replyToken;
    const userMessage = eventData.message;
    const url = "https://api.line.me/v2/bot/message/reply";

    const messages = [];
    messages.push(Main(userMessage));

    const payload = {
        replyToken: replyToken,
        messages: messages,
    };

    //HTTPSのPOST時のオプションパラメータを設定する
    const options = {
        payload: JSON.stringify(payload),
        myamethod: "POST",
        headers: { Authorization: "Bearer " + LINE_TOKEN },
        contentType: "application/json",
    };

    UrlFetchApp.fetch(url, options);
}

/******************************************************/

function Main(message) {
Debug.getRange(2, 1).setValue("01");
let flagToDo = CheckSteps(message);
Debug.getRange(2, 2).setValue(flagToDo);
let sendMessage = "null";

switch (flagToDo) {
    case "number":
    Debug.getRange(2, 3).setValue("01");
    taskMoney(message);
    Debug.getRange(2, 4).setValue("01");
    sendMessage = createFlexMessage(ITEM_1);
    Debug.getRange(2, 10).setValue("01");
    break;

    case "location":
    Debug.getRange(2, 5).setValue("01");
    var lat = message.latitude;
    var lon = message.longitude;
    var address = message.address;
    taskLocation(lat, lon, address, "");
    sendMessage = handleTextMessage("位置情報を追加しました。");
    break;

    case "text":
    Debug.getRange(2, 6).setValue("01");
    var geocodeData = getGeocodeFacility(message.text);
    address = geocodeData["address"];
    lat = geocodeData["latitude"];
    lon = geocodeData["longitude"];
    Debug.getRange(2, 7).setValue("01");
    taskLocation(lat, lon, address, message.text);
    Debug.getRange(2, 8).setValue("01");
    sendMessage = handleTextMessage("住所：" + address);
    break;

    case "item1":
    taskItem1(message);
    sendMessage = createFlexMessage(findSubcategories(ITEM, message.text));
    break;

    case "item2":
    sendMessage = "subTerm";
    taskItem2(message);
    sendMessage = createFlexMessage(findSubcategories(ITEM, message.text));
    break;

    case "item3":
    sendMessage = "subTerm";
    taskItem3(message);
    sendMessage = handleTextMessage("登録いたしました。");
    break;

    case "sticker":
    sendMessage = "sticker";
    break;

    case "image":
    sendMessage = "image";
    break;

    case "video":
    sendMessage = "video";
    break;

    case "audio":
    sendMessage = "audio";
    break;

    case "file":
    sendMessage = "file";
    break;

    default:
    sendMessage = "other";
}

Debug.getRange(2, 10).setValue("01");
return sendMessage;
}

/******************************************************/

function CheckSteps(userMessage) {
const messageType = userMessage.type;
const messageText = userMessage.text;
Debug.getRange(3, 1).setValue("01");
if (messageType === "sticker") {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return "sticker";
}
if (messageType === "image") {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return "image";
}
if (messageType === "video") {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return "video";
}
if (messageType === "audio") {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return "audio";
}
if (messageType === "file") {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return "file";
}
if (messageType === "location") {
    // メッセージ以外(スタンプや画像など)が送られてきた場合
    return "location";
}
// if message type is int
if (messageType === "text") {
    Debug.getRange(3, 2).setValue("01");
    if (isOnlyNumbers(messageText)) {
    Debug.getRange(3, 3).setValue("01");
    return "number";
    }
    // if message is in the list of folling words
    if (ITEM_1.includes(messageText)) {
    Debug.getRange(3, 4).setValue("01");
    return "item1";
    }
    if (ITEM_2.includes(messageText)) {
    Debug.getRange(3, 5).setValue("01");
    return "item2";
    }
    if (ITEM_3.includes(messageText)) {
    Debug.getRange(3, 5).setValue("01");
    return "item3";
    }
    Debug.getRange(3, 6).setValue("01");
    return "text";
}
Debug.getRange(3, 7).setValue("01");
return "other";
}

function isOnlyNumbers(str) {
Debug.getRange(3, 8).setValue("01");
return /^\d+$/.test(str);
}

/******************************************************/
