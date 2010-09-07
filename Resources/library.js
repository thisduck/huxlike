var online = Ti.Network.online;
var ra = ra ||{};

ra.ajax = {
  // type, url, data, success, error
  call: function(options) {
    Ti.API.debug("ra.ajax.call: --" + JSON.stringify(options));
    var xhr = Ti.Network.createHTTPClient();
    xhr.open(options.type || "GET", options.url);
    xhr.setRequestHeader('Accept', "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");


    xhr.onerror = function() {
      Ti.API.debug("ra.ajax.call: -- in onerror");
      Ti.API.debug("ERROR on XHR:" + this.status);
      Ti.API.debug("ERROR on XHR:" + this.responseText);
      Ti.API.debug("ERROR on XHR:" + JSON.stringify(this));
      if (options.error) {
        options.error(this.responseText, this.status, this);
      }
    };

    xhr.onload = function() {
      Ti.API.debug("ra.ajax.call: -- in onload");
      if (options.success) {
        options.success(this.responseText, this.status, this);
      }
    };

    Ti.API.debug("ra.ajax.call: -- sending request");
    xhr.send(options.data || null);
  }
};

ra.file = {
  write: function(file_name, data) {
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, file_name);
    file.write(data);
    return file;
  },
  
  del: function(file_name) {
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, file_name);
    file.deleteFile();
  },

  read: function(file_name) {
    var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, file_name);
    return file.read().text;
  },
  file: function(file_name) {
    return Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, file_name);
  }
};

ra.date = {
  MONTH_NAMES: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  WEEKDAY_NAMES: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  date:function(time) {
    return new Date((time || "").replace(/-\d\d:\d\d$/, '').replace(/-/g,"/").replace(/[TZ]/g," "));
  },
  db:function(time) {
    return (time || "").replace(/-\d\d:\d\d$/, '').replace(/[TZ]/g," ");
  },
  full_date: function(date) {
    return ra.date.WEEKDAY_NAMES[date.getDay()] + ", " + ra.date.MONTH_NAMES[date.getMonth()] + " " + date.getDate() + " " + date.getFullYear();
  },
  pretty: function(date) {
    var diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) {
      return;
    }
    return day_diff == 0 && (
        diff < 60 && "just now" ||
        diff < 120 && "1 minute ago" ||
        diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
        diff < 7200 && "1 hour ago" ||
        diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
      day_diff == 1 && "Yesterday" ||
      day_diff < 7 && day_diff + " days ago" ||
      day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
  }
};

