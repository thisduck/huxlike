// This is the sections tab window
var win = Ti.UI.currentWindow;
win.orientationModes = [
  Titanium.UI.PORTRAIT
];

Ti.include('config.js');
Ti.include('library.js');
Ti.include('globe.js');

// Get the sections from the store and display in a table view
var sections = globe.sections.get();
Ti.API.debug("in sections.js -- " + JSON.stringify(sections));

var section = Ti.UI.createTableViewSection();
section.headerView = win.tableHeaderView || Ti.UI.createView();

var data = [];

data[0] = section;
var len = sections.length;
for (var i = 0; i < len; ++i) {
  var row = sections[i];
  data[i + 1] = Ti.UI.createTableViewRow({hasChild: true, height:'auto', name: row.name});
  var label = Ti.UI.createLabel({
    color:'black',
    text:row.name,
    textAlign:'left',
    left:10,
    right:10,
    font:{fontFamily:'Georgia', fontSize:16}
  });
  data[i + 1].add(label);
}


var tableview = Ti.UI.createTableView({
  data: data
});

tableview.addEventListener('click', function(e) {
  Ti.API.info(e);
  var news_win = Ti.UI.createWindow({
//    url:'stories_view.js',
    title:e.rowData.name,
    section: sections[e.index].url
  });
  news_win.tableHeaderView = win.tableHeaderView;
  win.tab.open(news_win, {animated:true});
});

win.add(tableview);
