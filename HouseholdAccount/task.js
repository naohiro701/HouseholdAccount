/******************************************************/

function taskMoney(message) {
    Debug.getRange(3, 1).setValue("01");
    const [target_row, _] = getLastValue(); // Check the next empty row
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1; // JavaScriptの月は0から始まるため
    var day = today.getDate();
    Debug.getRange(3, 2).setValue("01");
    Sheet.getRange(target_row + 1, 4).setValue(message.text);
    Sheet.getRange(target_row + 1, 1).setValue(year);
    Sheet.getRange(target_row + 1, 2).setValue(month);
    Sheet.getRange(target_row + 1, 3).setValue(day);
    Debug.getRange(3, 3).setValue("01");
    return;
}

/******************************************************/

function taskLocation(lat, lon, address, shopName) {
    Debug.getRange(4, 1).setValue("01");
    const [target_row, _] = getLastValue(); // Check the next empty row
    Debug.getRange(4, 2).setValue("01");
    // save
    Sheet.getRange(target_row, 5).setValue(shopName);
    Sheet.getRange(target_row, 9).setValue(address);
    Sheet.getRange(target_row, 10).setValue(lat);
    Sheet.getRange(target_row, 11).setValue(lon);

    return;
}

/******************************************************/

function taskItem1(message) {
    const [target_row, _] = getLastValue();
    Sheet.getRange(target_row, 6).setValue(message.text);
}

/******************************************************/

function taskItem2(message) {
    const [target_row, _] = getLastValue();
    // save
    Sheet.getRange(target_row, 7).setValue(message.text);
}

function taskItem3(message) {
    const [target_row, _] = getLastValue();
    // save
    Sheet.getRange(target_row, 8).setValue(message.text);
}

/******************************************************/

// フレックスメッセージを作成
function createFlexMessage(categories) {
    var flexContents = categories.map(function (category) {
        return {
            type: "button",
            action: {
                type: "message",
                label: category,
                text: category,
            },
            style: "link",
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
                    body: {
                        type: "box",
                        layout: "vertical",
                        contents: [content],
                    },
                };
            }),
        },
    };
}

// テキストメッセージを処理
function handleTextMessage(messagen) {
    return { type: "text", text: messagen };
}
