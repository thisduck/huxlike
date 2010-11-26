// This is the sections tab window
var win = Ti.UI.currentWindow;

var winHeader = Ti.UI.createView({
  top: 0,
  left: 0,
  height: 20,
  width: 'auto',
  backgroundColor: '#474747'
});

var winHeaderImage = Ti.UI.createImageView({
  top: 0,
  left: 0,
  height: 20,
  image: 'tgam-logo20.png'
});

winHeader.add(winHeaderImage);
win.add(winHeader);

