var globe = globe || {};

globe.db = {
  initDb: function() {
    var db = Titanium.Database.open(config.db);
    var sql = "";
    sql += "CREATE TABLE IF NOT EXISTS articles (";
    sql += "	article_id TEXT PRIMARY KEY,";
    sql += "	date	TEXT,";
    sql += "	last_updated	TEXT,";
    sql += "	title	TEXT,";
    sql += "	data	TEXT,";
    sql += "	old	INTEGER DEFAULT 0,";
    sql += "	keeper	INTEGER DEFAULT 0,";
    sql += "	saved	INTEGER DEFAULT 0,";
    sql += "	read	INTEGER DEFAULT 0";
    sql += ");";
    db.execute(sql);

    sql = "";
    sql += "CREATE TABLE IF NOT EXISTS sections (";
    sql += "	url TEXT PRIMARY KEY,";
    sql += "	name	TEXT,";
    sql += "	id	TEXT,";
    sql += "	created_at	TEXT,";
    sql += "	last_date	TEXT,";
    sql += "	position	INTEGER DEFAULT 0";
    sql += ");";
    db.execute(sql);

    sql =  "";
    sql += "CREATE TABLE IF NOT EXISTS article_section_map (";
    sql += "	article_id TEXT,";
    sql += "	url	TEXT,";
    sql += "    PRIMARY KEY (article_id, url)";
    sql += ");";
    db.execute(sql);

    var rows = db.execute("SELECT * FROM sections;");
    var count = rows.getRowCount();

    db.close();

    if (count == 0) {
      globe.sections.initSections();
    }

  },
  clearDb: function() {
    var db = Titanium.Database.open(config.db);

    var sql = "";
    sql = "DROP TABLE IF EXISTS articles;";
    db.execute(sql);

    sql = "DROP TABLE IF EXISTS sections;";
    db.execute(sql);

    sql = "DROP TABLE IF EXISTS article_section_map;";
    db.execute(sql);

    db.close();
    globe.db.initDb();
  }
};

globe.articles = {
  downloadAll: function() {
    var sections = globe.sections.get();

    for (var i = 0; i < sections.length; ++i) {
      globe.articles.downloadForSection(sections[i]);
    }
  },
  downloadForSection: function(section, callback) {
    var url = config.server + "/articles/section/" + section.id + "?limit=10";
    if (section.last_date != null) {
      url += "&last=" + section.last_date;
    }
    globe.articles.download(url, function(response) {
      var last = response.last;
      var db = Titanium.Database.open(config.db);
      db.execute('UPDATE sections SET last_date = ? WHERE url = ?', last, section.url);
      db.close();
      if (callback) {
        callback(response);
      }
    });
  },
  download: function(url, callback) {
    // mark all as old
    ra.ajax.call({
      url: url,
      success: function (text, status, xhr) {
        var response = JSON.parse(text);
        var articles = response.articles;
        for (var i = 0; i < articles.length; ++i) {
          globe.articles.store(articles[i]);
        }
        callback(response);
      }
    });
  },
  store: function(article) {
    var db = Titanium.Database.open(config.db);
    db.execute('INSERT OR REPLACE INTO articles  (article_id, date, last_updated, title, data)' +
      ' VALUES (?,?,?,?,?);',
      article.id, ra.date.db(article.date), ra.date.db(article.last_updated), article.title, JSON.stringify(article));

    for (var i = 0; i < article.section_urls.length; i++) {
      db.execute('INSERT OR IGNORE INTO article_section_map (article_id, url) VALUES (?,?)',
        article.id, article.section_urls[i]);
    }
    db.close();
  },
  markAllOld: function() {
    var db = Titanium.Database.open(config.db);
    db.execute('UPDATE OR IGNORE articles SET OLD = ?', 1);
    db.close();
  },
  markRead: function(id) {
    var db = Titanium.Database.open(config.db);
    db.execute('UPDATE articles SET READ = ?, OLD = ? WHERE article_id = ?', 1, 1, id);
    db.close();
  },
  makeArticle: function(row) {
    var article = JSON.parse(row.fieldByName('data'));
    article.read = row.fieldByName('read');
    article.old = row.fieldByName('old');
    article.saved = row.fieldByName('saved');
    article.keeper = row.fieldByName('keeper');
    return article;
  },
  forSection: function(section) {
    var db = Titanium.Database.open(config.db);

    var articles = [];
    var sql = "";
    sql += "SELECT * FROM articles WHERE article_id IN (" +
      "SELECT article_id FROM article_section_map WHERE url = ?" +
      ") " +
      "ORDER BY date DESC " +
      "LIMIT 20";

    var rows = db.execute(sql, section);

    while (rows.isValidRow()) {
      articles.push(globe.articles.makeArticle(rows));
      rows.next();
    }

    Ti.API.info("Num articles: " + articles.length);
    rows.close();
    db.close();
    return articles;
  },
  html: function(article) {
    var author = "";
    if (article.author != "") {
      author = '<div style="font-family:Georgia; text-transform:uppercase; padding: 5px"> ' + article.author  + '</div>';
    }

    var line = "<div class='line' style='padding: 5px; font-size:.8em;'>" +
      (article.placeline != "" ? "<span class='placeline' style='color: #FF0000;'>" + article.placeline + "</span>" : "") +
      (article.placeline != "" ? " -- " : "") +
      (article.creditline != "" ? "<span class='creditline'>" + article.creditline + "</span>" : "") +
      "</div>";


    var image = "";
    if (article.images.iphone_image != undefined && article.image64 != "" && online) {
      image = '<div style="font-family:Georgia; padding: 5px"> <img src="' + article.images.iphone_image.url + '" /> </div>';
    }
    return '<html>' +
           '<head>' +
           '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
           //'<script type="text/javascript" src="jquery.js"></script>' +
           // '<script type="text/javascript" src="scroll.js"></script>' +
           '</head>' +
           '<body>' +
           '<div style="font-size:1.3em; font-family:Georgia; padding: 5px; padding-bottom: 2px;">' + article.title  + '</div>' +
           '<div style="font-family:Georgia; padding: 5px; padding-top: 0px;">' + ra.date.full_date(ra.date.date(article.date))  + '</div>' +
           line +
           author +
           image +
           '<div style="font-family:Verdana; padding: 5px; text-align: left;">' + article.full_text  + '</div>' +
           '</body></html>';
  },
  tableRow: function(article) {
    var row_bg_color = 'white';
    if (article.read == 1) {
      row_bg_color = '#EFEFEF';
    }
    var h = 'auto';
    if (Titanium.Platform.name == 'android') {
      h = 85;
    }
    var row = Ti.UI.createTableViewRow({backgroundColor: row_bg_color, className: article.id, // hasChild: true,
      height:h});

    var image_item = Ti.UI.createImageView({
      image: 'd.png',
      backgroundColor:'#6F6F6F',
      left:10,
      top:10,
      width:50,
      height:50
    });
    if (Ti.Platform.name != 'android') {
      image_item.bottom = 10;
    }
    if (article.image64 != null) {
      image_item.image = Ti.Utils.base64decode(article.image64);
      //globe.articles.load_image(article, image_item);
    }

    row.add(image_item);

    var message_label = Ti.UI.createLabel({
      color:'white',
      backgroundColor:'#6F6F6F',
      text:'NEW',
      textAlign:'center',
      width: '40',
      height: '20',
      right: 0,
      top: 0,
      font:{fontFamily: 'Helvetica Neue', fontSize:10, fontWeight: 'bold'}
    });
    message_label.hide();
    if (article.old == 0) {
      row.message_label = message_label;
      row.add(message_label);
      message_label.show();
    }

    var label = Ti.UI.createLabel({
      color:'black',
      text:article.title,
      textAlign:'left',
      height: 'auto',
      left:80,
      right: 40,
      top: 10,
      bottom: 25,
      font:{fontFamily:'Georgia', fontSize:14}
    });

    row.add(label);

    var date_label = Ti.UI.createLabel({
      color:'#9F9F9F',
      text:ra.date.pretty(ra.date.date(article.date)),
      textAlign:'right',
      height: 'auto',
      right: 10,
      bottom: 5,
      font:{fontFamily:'Georgia', fontSize:14}
    });

    row.add(date_label);
    return row;
  }
};

globe.sections = {
  initSections: function() {
    var rawData = '{"last":"2010-09-04T16:15:22-04:00","sections":[{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:01-04:00","name":"National","position":10,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/news/national/","id":"4c2abbbcdf20bf607e000001"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:02-04:00","name":"Business","position":20,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/report-on-business/","id":"4c2abbbcdf20bf607e000002"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:04-04:00","name":"Politics","position":30,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/news/politics/","id":"4c2abbbcdf20bf607e000003"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:15:04-04:00","name":"World","position":40,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/news/world/","id":"4c2abbbcdf20bf607e000004"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:30:03-04:00","name":"Sports","position":50,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/sports/","id":"4c2abbbcdf20bf607e000005"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:03-04:00","name":"Technology","position":60,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/news/technology/","id":"4c2abbbcdf20bf607e000006"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:04-04:00","name":"Arts","position":70,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/news/arts/","id":"4c2abbbcdf20bf607e000007"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:05-04:00","name":"Life","position":80,"show":true,"updated_at":"2010-09-04T16:15:22-04:00","url":"/life/","id":"4c2abbbcdf20bf607e000008"},{"created_at":"2010-06-29T23:36:28-04:00","last_loaded":"2010-09-04T12:45:06-04:00","name":"Top Stories","position":1,"show":true,"updated_at":"2010-09-04T16:17:16-04:00","url":"/?feed=topstories","id":"4c2abbbcdf20bf607e000009"}]}';
    var sections = JSON.parse(rawData).sections;

    for (var i = 0; i < sections.length; ++i) {
      globe.sections.replaceSection(sections[i]);
    }
  },
  replaceSection: function(section) {
    var sql = "";
    sql += "INSERT OR REPLACE INTO sections (id, url, name, created_at, position) ";
    sql += "VALUES (?, ?, ?, ?, ?);";

    var db = Titanium.Database.open(config.db);
    db.execute(sql, section.id, section.url, section.name, section.created_at, section.position);
    db.close();
  },
  get: function() {
    var db = Titanium.Database.open(config.db);
    var rows = db.execute('SELECT * FROM sections ORDER BY position');
    var sections = [];

    while (rows.isValidRow()) {
      sections.push(globe.sections.makeSection(rows));
      rows.next();
    }

    return sections;
  },
  makeSection: function(row) {
    var section = {};
    var fields = ['id', 'url', 'name', 'created_at', 'position', 'last_date'];

    for (var i = 0; i < fields.length; ++i) {
      section[fields[i]] = row.fieldByName(fields[i]);
    }

    return section;
  }
};

