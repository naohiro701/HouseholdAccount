function foldercreate() {
    var folder_check = SettingSheet.getRange(7,2).getValue();
    if(folder_check !==""){
    Browser.msgBox("すでにフォルダーが設定されております。ご確認ください。");
    return
}

var folder = DriveApp.createFolder("Gemini画像保存用")
folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

SettingSheet.getRange(7,2).setValue("https://drive.google.com/drive/u/0/folders/" + folder.getId());
SettingSheet.getRange(8,2).setValue(folder.getId());


Browser.msgBox("フォルダーが作成されました。B7セルに記載されているフォルダ内に画像が保存されていきます。\\n※このフォルダは「このリンクを知っているインターネット上の全員が閲覧できます」で作成されておりますので、重要なファイルは保存しないでください。");

}