// this sets the background color of the master UIView (when there are no windows/tab groups on it)
Titanium.UI.setBackgroundColor('#000');

Ti.include('config.js');
Ti.include('library.js');
Ti.include('globe.js');

// initialize the database
globe.db.initDb();
globe.articles.downloadAll();

setInterval(function() {
  globe.articles.downloadAll();
}, 1000 * 60 * 5);

// create tab group
var tabGroup = Titanium.UI.createTabGroup({
  barColor:'#336699'
});


var headerView = Ti.UI.createView({
  top: 0,
  height: 21,
  backgroundColor: '#fff'
});

var headerLine = Ti.UI.createView({
  top: 20,
  height: 1,
  backgroundColor: '#000'
});

var headerImage = Ti.UI.createImageView({
  top: 0,
  left: 0,
  height: 20,
  width: 184,
  image: 'header.png',
  backgroundColor: '#fff'
});

headerView.add(headerImage);
headerView.add(headerLine);

//
// create base UI tab and root window
//
var win1 = Titanium.UI.createWindow({  
    title:'Sections',
    url:'sections.js',
    backgroundColor:'#fff'
});
win1.header = headerView;
var tab1 = Titanium.UI.createTab({  
    icon:'KS_nav_views.png',
    title:'Sections',
    window:win1
});

var label1 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 1',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});


//
// create controls tab and root window
//
var win2 = Titanium.UI.createWindow({  
    title:'Tab 2',
    backgroundColor:'#fff'
});
var tab2 = Titanium.UI.createTab({  
    icon:'KS_nav_ui.png',
    title:'Tab 2',
    window:win2
});

var label2 = Titanium.UI.createLabel({
	color:'#999',
	text:'I am Window 2',
	font:{fontSize:20,fontFamily:'Helvetica Neue'},
	textAlign:'center',
	width:'auto'
});

win2.add(label2);



//
//  add tabs
//
tabGroup.addTab(tab1);  
tabGroup.addTab(tab2);  


// open tab group
tabGroup.open();
