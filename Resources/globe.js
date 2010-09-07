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
    var fields = ['id', 'url', 'name', 'created_at', 'position'];

    for (var i = 0; i < fields.length; ++i) {
      section[fields[i]] = row.fieldByName(fields[i]);
    }

    return section;
  }
};

