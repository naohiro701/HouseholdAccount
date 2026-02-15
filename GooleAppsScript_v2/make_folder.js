/**
 * 画像保存用の Google Drive フォルダを作成し、設定シートへ URL/ID を保存する。
 * 目的: レシート画像の保存先をワンクリックで初期化できるようにする。
 */
function foldercreate() {
  var folderCheck = SettingSheet.getRange(7, 2).getValue();
  if (folderCheck !== "") {
    Browser.msgBox("すでにフォルダーが設定されております。ご確認ください。");
    return;
  }

  var folder = DriveApp.createFolder("Gemini画像保存用");
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  SettingSheet.getRange(7, 2).setValue("https://drive.google.com/drive/u/0/folders/" + folder.getId());
  SettingSheet.getRange(8, 2).setValue(folder.getId());

  Browser.msgBox(
    "フォルダーが作成されました。B7セルに記載されているフォルダ内に画像が保存されていきます。\\n" +
    "※このフォルダは『このリンクを知っているインターネット上の全員が閲覧できます』で作成されています。"
  );
}
