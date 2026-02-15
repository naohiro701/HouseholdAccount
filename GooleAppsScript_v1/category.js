/**
 * 家計カテゴリのマスターデータ。
 * 目的: LINE の選択肢と保存値を一貫させる。
 */
const ITEM = {
  "生活費(食住)": {
    "食費": ["食料品", "外食", "朝ご飯", "昼ご飯", "夜ご飯"],
    "日用品": ["日用品", "子育て用品", "ドラッグストア"],
    "住宅": ["住宅家賃・地代", "ローン返済", "管理費・積立金"],
    "水道・光熱費": ["光熱費", "電気代", "ガス・灯油代", "水道代"],
    "通信費": ["携帯電話", "固定電話", "インターネット"],
    "その他出費": ["仕送り", "事業経費", "事業原価"]
  },
  "もの支出(娯楽・自己投資)": {
    "交際費": ["お土産", "飲み会", "プレゼント", "冠婚葬祭", "その他"],
    "教養・教育": ["新聞・雑誌", "習いごと", "学費"],
    "衣服": ["衣服", "クリーニング"]
  },
  "こと支出(移動等)": {
    "身体関連": ["フィットネス", "医療費", "ボデイケア", "美容院・理髪"],
    "趣味・娯楽": ["アウトドア", "ゴルフ", "スポーツ", "映画・音楽・ゲーム"],
    "移動費": ["ホテル", "電車", "バス", "タクシー", "飛行機"],
    "特別な支出": ["家具・家電", "住宅・リフォーム"]
  }
};

/**
 * 指定階層の候補一覧を平坦化して返す。
 * level=1: 大分類, level=2: 中分類, level=3: 小分類。
 */
function extractItems(data, level) {
  var items = [];

  switch (level) {
    case 1:
      for (var category in data) items.push(category);
      break;
    case 2:
      for (var category2 in data) {
        for (var subCategory in data[category2]) items.push(subCategory);
      }
      break;
    case 3:
      for (var category3 in data) {
        for (var subCategory2 in data[category3]) {
          items = items.concat(data[category3][subCategory2]);
        }
      }
      break;
    default:
      throw new Error("Invalid level");
  }

  return items;
}

// LINE 返信で使う各階層の選択肢を事前計算しておく。
var ITEM_1 = extractItems(ITEM, 1);
var ITEM_2 = extractItems(ITEM, 2);
var ITEM_3 = extractItems(ITEM, 3);

/**
 * 指定キーの次階層候補を返す。
 * - キーが中間ノードなら子キー配列
 * - キーが末端ノードなら値配列
 */
function findSubcategories(data, key) {
  function searchSubcategories(currentData, currentKey) {
    for (var k in currentData) {
      if (k === currentKey) {
        if (Array.isArray(currentData[k])) return currentData[k];
        if (typeof currentData[k] === 'object' && currentData[k] !== null) {
          return Object.keys(currentData[k]);
        }
      } else if (typeof currentData[k] === 'object' && currentData[k] !== null) {
        var found = searchSubcategories(currentData[k], currentKey);
        if (found) return found;
      }
    }
    return null;
  }

  var result = searchSubcategories(data, key);
  if (result === null) throw new Error("Key not found");
  return result;
}
