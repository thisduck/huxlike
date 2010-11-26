// This is the top stories tab window
var win = Ti.UI.currentWindow;
win.orientationModes = [
  Titanium.UI.PORTRAIT,
  Titanium.UI.LANDSCAPE_LEFT,
  Titanium.UI.LANDSCAPE_RIGHT
];

Ti.include('config.js');
Ti.include('library.js');
Ti.include('globe.js');
Ti.include('header.js');

var articles = globe.articles.forSection(win.section);
var webview = Ti.UI.createWebView({
  top: 21
});

var len = articles.length;

var data = [];

for (var i = 0; i < articles.length; ++i) {
  var article = articles[i];
  data[i] = globe.articles.tableRow(article);
}

Ti.API.info("Done loading " + data.length);

var tableview = Ti.UI.createTableView({
  backgroundColor:'white',
  top: 21,
  data: data
});

// create table view event listener
tableview.addEventListener('click', function(e) {
  var rowdata = e.rowData;
  var article = articles[e.index];
  Ti.API.debug("Inside the click: " + article.title);
  globe.articles.markRead(article.id);
  article.read = 1;
  article.old = 1;
  if (rowdata.message_label) {
    rowdata.message_label.hide();
  }
  e.row.backgroundColor = '#EFEFEF';

  Ti.API.debug("right before create window");
  var w = Ti.UI.createWindow();
  w.orientationModes = [
    Titanium.UI.PORTRAIT
  ];

  webview.html = globe.articles.html(article);

  w.add(winHeader);
  w.add(webview);
  w.barColor = 'black';
  win.tab.open(w);
});

win.add(tableview);
