// ---------------------------------------------
// Global Settings
// ---------------------------------------------
var ss = SpreadsheetApp.getActiveSpreadsheet();
var user_sheet = ss.getSheetByName("user_status");
var log_sheet = ss.getSheetByName("log");
var setting_sheet = ss.getSheetByName("setting");

var channel_access_token = setting_sheet.getRange(1, 2).getValue();
var gemini_api = setting_sheet.getRange(3, 2).getValue();
var google_drive_id = setting_sheet.getRange(8, 2).getValue();

/**
 * Entry point for LINE webhook (POST).
 * Accepts only image messages and triggers receipt processing.
 * @param {Object} e - Webhook request payload from LINE.
 */
function doPost(e) {
  var payloadObj = JSON.parse(e.postData.contents);
  var eventObj = payloadObj.events[0];
  var userId = eventObj.source.userId;

  if (eventObj.type === "message" && eventObj.message.type === "image") {
    processReceiptImage(eventObj, userId);
  }
}

/**
 * Full receipt flow:
 * 1) Download image from LINE
 * 2) Save to Drive
 * 3) Resize
 * 4) Parse by Gemini Vision → JSON
 * 5) Append to Spreadsheet
 * 6) Reply to user
 * 7) Post to Calendar
 * 8) Trash original file
 * @param {Object} eventObj - LINE event object
 * @param {string} userId - LINE user id
 */
function processReceiptImage(eventObj, userId) {
  try {
    // 1) Download image
    var contentUrl = 'https://api-data.line.me/v2/bot/message/' + eventObj.message.id + '/content';
    var imageResp = UrlFetchApp.fetch(contentUrl, {
      headers: { Authorization: 'Bearer ' + channel_access_token },
      method: 'get'
    });

    // 2) Save to Drive
    var imageName = Date.now() + '.png';
    var imageBlob = imageResp.getBlob().getAs('image/png').setName(imageName);
    var driveFile = DriveApp.getFolderById(google_drive_id).createFile(imageBlob);
    var fileId = driveFile.getId();

    // 3) Resize to width 500px (library or stub)
    var resizedObj = ImgApp.doResize(fileId, 500); // { blob: Blob }
    var resizedBlob = resizedObj.blob || imageBlob;

    // 4) OCR + parse by Gemini
    var receiptJson = extractReceiptFromImage(resizedBlob);

    // 5) Append to monthly sheet
    var addrStr = appendReceiptData(receiptJson);

    // 6) Build reply
    var replyText = formatReceiptReply(receiptJson);
    replyToUser(eventObj.replyToken, replyText);

    // 7) Post to Calendar
    formatCalendarPost(receiptJson, addrStr, replyText);

    // 8) Trash source
    DriveApp.getFileById(fileId).setTrashed(true);
  } catch (err) {
    replyToUser(eventObj.replyToken, "エラーが発生しました: " + err.message);
  }
}

/**
 * Send image + prompt to Gemini Vision and return parsed JSON.
 * @param {Blob} imageBlob - Image binary.
 * @return {Object} Parsed receipt JSON.
 */
function extractReceiptFromImage(imageBlob) {
  var promptText = '以下の画像はレシートです。\n' +
    '次の構造のJSONとして返してください。コードブロック記号は不要です。日時はおそらく2025年です。\n' +
    'store_nameには、地域名などの情報を積極的に含めてください。（例：無印良品 ビーンズ中山）\n' +
    'categoryには、「食材費」など、以下から選択したものを1つ入れてください。\n' +
    '項目例:食材費 (スーパーでの食料品の買い物），\n' +
    'お昼代（外食，コンビニ），\n' +
    '晩御飯代（飲み代），\n' +
    '日用品費 (洗剤、トイレットペーパー、ティッシュなど)、\n' +
    '交通費 (電車代、バス代、タクシー代、ガソリン代など)、\n' +
    '医療費 (薬代、通院費、入院費など)、\n' +
    '交際費 (飲み会代、プレゼント代、レジャー代など)、\n' +
    '被服費 (洋服代、クリーニング代、美容院代など)、\n' +
    '娯楽費 (映画代、コンサート代、旅行代など)、\n' +
    '雑費 (その他諸費用)、\n' +
    '{\n' +
    '  "store_name": "",\n' +
    '  "store_address": "" or "unknown",\n' +
    '  "phone_number": "" or "unknown",\n' +
    '  "year": "yyyy",\n' +
    '  "month": "mm",\n' +
    '  "day": "dd",\n' +
    '  "time": "mm:ss",\n' +
    '  "receipt_number": "",\n' +
    '  "items": [\n' +
    '    {"name": "","price": 数値,"quantity": 数値}\n' +
    '  ],\n' +
    '  "subtotal": 数値,\n' +
    '  "tax": 数値,\n' +
    '  "total": 数値,\n' +
    '  "payment_method": "現金"or"クレジット",\n' +
    '  "change": 数値,\n' +
    '  "category": 項目\n' +
    '}\n' +
    '\n空欄でも構いません。構造は必ず守ってください。';

  var body = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: "image/png",
              data: Utilities.base64Encode(imageBlob.getBytes())
            }
          }
        ]
      }
    ]
  };

  var httpOpts = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body)
  };

  var resp = UrlFetchApp.fetch(
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=" + gemini_api,
    httpOpts
  );

  var result = JSON.parse(resp.getContentText());
  var rawText = result && result.candidates && result.candidates[0] &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts[0].text
                ? result.candidates[0].content.parts[0].text
                : "{}";

  // Strip code fences if any
  var cleaned = rawText.replace(/```(?:json)?\s*/g, "").replace(/```$/g, "").trim();

  // Fallback to empty object on parse error
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return {};
  }
}

/**
 * Append receipt rows to a monthly sheet named "YYYY_MM".
 * Creates the sheet with headers if not present.
 * @param {Object} dataObj - Receipt JSON object.
 * @return {string} Address string written to the sheet.
 */
function appendReceiptData(dataObj) {
  var now = new Date();
  var y = now.getFullYear();
  var m = ("0" + (now.getMonth() + 1)).slice(-2);
  var sheetName = y + "_" + m;
  var target = ss.getSheetByName(sheetName);

  if (!target) {
    target = ss.insertSheet(sheetName);
    target.appendRow([
      "Timestamp","Store Name","Store Address","Phone Number",
      "Year","Manth","Day","Time","Receipt Number","Item Name",
      "Quantity","Price","Subtotal","Tax","Total",
      "Payment Method","Change","category","lat","lon"
    ]);
  }

  if (!dataObj.items || !Array.isArray(dataObj.items)) {
    throw new Error("Invalid receipt data format: 'items' field is missing or malformed.");
  }

  var stamp = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss");

  var geo = getGeocodeFacility((dataObj.store_address || "") + "" + (dataObj.store_name || ""));

  // write summary line to 「変数」 sheet
  summaryReceiptSheet(dataObj, geo);

  dataObj.items.forEach(function (it) {
    target.appendRow([
      stamp,
      dataObj.store_name || "",
      geo.address || dataObj.store_address || "",
      dataObj.phone_number || "",
      dataObj.year || "",
      dataObj.month || "",
      dataObj.day || "",
      dataObj.time || "12:30",
      dataObj.receipt_number || "",
      it.name || "",
      it.quantity || 1,
      it.price || 0,
      dataObj.subtotal || "",
      dataObj.tax || "",
      dataObj.total || "",
      dataObj.payment_method || "",
      dataObj.change || "",
      dataObj.category || "",
      geo.latitude || "",
      geo.longitude || ""
    ]);
  });

  return geo.address || dataObj.store_address || "";
}

/**
 * Build a Calendar event key and call registration helper.
 * @param {Object} dataObj - Receipt JSON.
 * @param {string} addressStr - Store address.
 * @param {string} descriptionStr - Event description.
 */
function formatCalendarPost(dataObj, addressStr, descriptionStr) {
  var eventKey = (dataObj.year || "2025") + "-" + (dataObj.month || "01") + "-" + (dataObj.day || "01") +
                 " " + (dataObj.time || "12:30") + ":00";
  registerCalendarEvent(dataObj.store_name || "購入", eventKey, addressStr || "", descriptionStr || "");
}

/**
 * Create a LINE reply message from receipt JSON.
 * @param {Object} dataObj - Receipt JSON.
 * @return {string} Reply message text.
 */
function formatReceiptReply(dataObj) {
  if (!dataObj.store_name || !dataObj.total) return "レシートの内容を保存しました。";

  var itemsStr = "";
  if (Array.isArray(dataObj.items)) {
    itemsStr = dataObj.items.map(function (it) {
      return "・" + (it.name || "") + " x" + (it.quantity || 1) + "：¥" + (it.price || 0);
    }).join("\n");
  }

  var msg = "📍店舗名：" + dataObj.store_name + "\n" +
            "🧾日付：" + (dataObj.year || "") + "年" + (dataObj.month || "") + "月" + (dataObj.day || "") + "日　時間：" + (dataObj.time || "") + "\n\n" +
            "🛍購入品：\n" + itemsStr + "\n\n" +
            "💰合計金額：¥" + (dataObj.total || 0) + "\n" +
            "💳支払い方法：" + (dataObj.payment_method || "") + "\n";
  return msg;
}

/**
 * Append one-line summary into sheet named 「変数」.
 * Creates the sheet with headers if missing.
 * Columns: [Store Name, Store Address, date, Total, category, lat, lon]
 * @param {Object} dataObj - Receipt JSON.
 * @param {Object} geoObj - {address, latitude, longitude}
 * @return {string|null} Short summary string or null.
 */
function summaryReceiptSheet(dataObj, geoObj) {
  if (!dataObj || !dataObj.store_name || !dataObj.total) return null;

  var summarySheet = ss.getSheetByName("変数");
  if (!summarySheet) {
    summarySheet = ss.insertSheet("変数");
    summarySheet.appendRow(["Store Name","Store Address","date","Total","category","lat","lon"]);
  }

  var dateStr = (dataObj.year && dataObj.month && dataObj.day)
    ? Utilities.formatString('%04d/%02d/%02d', dataObj.year, dataObj.month, dataObj.day)
    : "";

  summarySheet.appendRow([
    dataObj.store_name,
    geoObj.address || dataObj.store_address || "",
    dateStr,
    dataObj.total,
    dataObj.category || "",
    geoObj.latitude || "",
    geoObj.longitude || ""
  ]);

  return dataObj.store_name + "\n" + dateStr + "\n¥" + dataObj.total + "\n" + (dataObj.category || "");
}

/**
 * Send a LINE reply message.
 * @param {string} replyToken - LINE reply token.
 * @param {string} text - Message body.
 */
function replyToUser(replyToken, text) {
  var payload = {
    replyToken: replyToken,
    messages: [{ type: "text", text: text }]
  };

  var reqOpts = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + channel_access_token
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", reqOpts);
}

/* -------------------------------------------------------
 * Safe stubs (only if missing) to avoid runtime errors.
 * Replace with real implementations if available.
 * -----------------------------------------------------*/
if (typeof ImgApp === 'undefined') {
  var ImgApp = {
    /**
     * Dummy resize. Returns the original file blob.
     * @param {string} fileId
     * @param {number} width
     * @return {{blob:Blob}}
     */
    doResize: function (fileId, width) {
      return { blob: DriveApp.getFileById(fileId).getBlob() };
    }
  };
}

if (typeof getGeocodeFacility === 'undefined') {
  /**
   * Dummy geocoder returning empty fields.
   * @param {string} query
   * @return {{address:string, latitude:string, longitude:string}}
   */
  function getGeocodeFacility(query) {
    return { address: "", latitude: "", longitude: "" };
  }
}

if (typeof registerCalendarEvent === 'undefined') {
  /**
   * Dummy calendar registrar. No-op.
   * @param {string} title
   * @param {string} dateTimeStr
   * @param {string} location
   * @param {string} description
   */
  function registerCalendarEvent(title, dateTimeStr, location, description) {
    return;
  }
}
