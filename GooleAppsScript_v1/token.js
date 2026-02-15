// --- 外部サービスの接続情報 ---
// 目的: 機密値をコード本体から分離し、設定箇所を明確にする。

// Google カレンダー ID
let CALENDAR_ID = '';

// LINE Messaging API チャネルアクセストークン
const LINE_TOKEN = '';

// Mapbox Access Token
const MAPBOX_TOKEN = '';

// --- スプレッドシート参照 ---
const ss = SpreadsheetApp.getActiveSpreadsheet();
const Sheet = ss.getSheetByName('');
const Debug = ss.getSheetByName('');
