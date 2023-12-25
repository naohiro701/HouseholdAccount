/******************************************************/

const ITEM = {
    "基本的な生活費(衣食住)": {
    "食費": ["食料品", "外食", "朝ご飯", "昼ご飯", "夜ご飯"],
    "日用品": ["日用品", "子育て用品", "ドラッグストア"],
    "住宅": ["住宅家賃・地代", "ローン返済", "管理費・積立金"],
    "水道・光熱費": ["光熱費", "電気代", "ガス・灯油代", "水道代"]
    },
    "個人的な支出(娯楽・自己投資)": {
    "趣味・娯楽": ["アウトドア", "ゴルフ", "スポーツ", "映画・音楽・ゲーム"],
    "教養・教育": ["新聞・雑誌", "習いごと", "学費"],
    "衣服・美容": ["衣服", "クリーニング", "美容院・理髪"],
    "健康・医療": ["フィットネス", "医療費", "ボデイケア"]
    },
    "その他の支出(交通・通信・特別な支出)": {
    "交通費": ["電車", "バス", "タクシー", "飛行機"],
    "通信費": ["携帯電話", "固定電話", "インターネット"],
    "特別な支出": ["家具・家電", "住宅・リフォーム"],
    "その他": ["仕送り", "事業経費", "事業原価"]
    }
}

/******************************************************/

function extractItems(data, level) {
var items = [];

// 階層に応じて項目を抽出
switch(level) {
    case 1: // 最上位のカテゴリー
    for (var category in data) {
        items.push(category);
    }
    break;
    case 2: // 中間のカテゴリー
    for (var category in data) {
        for (var subCategory in data[category]) {
        items.push(subCategory);
        }
    }
    break;
    case 3: // 最下位の項目
    for (var category in data) {
        for (var subCategory in data[category]) {
        items = items.concat(data[category][subCategory]);
        }
    }
    break;
    default:
    throw new Error("Invalid level");
}

return items;
}


/******************************************************/


// 第N階層の項目を取り出す
var ITEM_1 = extractItems(ITEM, 1);
var ITEM_2 = extractItems(ITEM, 2);
var ITEM_3 = extractItems(ITEM, 3);

/******************************************************/

function findSubcategories(data, key) {
    var result = [];

    // ヘルパー関数：再帰的にサブカテゴリーを検索
    function searchSubcategories(currentData, currentKey) {
        for (var k in currentData) {
            if (k === currentKey) {
                // 最下層のリストを直接返す
                if (Array.isArray(currentData[k])) {
                return currentData[k];
                }
                // 中間の階層のキーを返す
                if (typeof currentData[k] === 'object' && currentData[k] !== null) {
                return Object.keys(currentData[k]);
                } 
            } else if (typeof currentData[k] === 'object' && currentData[k] !== null) {
                // 再帰的に検索
                var found = searchSubcategories(currentData[k], currentKey);
                if (found) return found;
            }
        }
        return null;
    }

    // キーに基づいてサブカテゴリーを検索
    result = searchSubcategories(data, key);
    if (result === null) throw new Error("Key not found");
    return result;
}

