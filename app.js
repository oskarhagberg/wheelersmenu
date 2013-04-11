
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , request = require('request')
  , htmlparser = require('htmlparser')
  , sys = require('sys');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/wheelers', function(req, res){
  
  request({
    uri: "http://extranet.sodexo.se/sv/Sites/Volvokoncernen/Utbud/Goteborg/Duetten/Matsedel-V47/?DateTime=2013-04-11",
  }, function(error, response, body) {
    if(error) {
      res.send("error menu");
    } else {
      var handler = new htmlparser.DefaultHandler(function(err, dom){
        if(err) {
          res.send("error parsing menu");
        } else {
          
          var menuTables = htmlparser.DomUtils.getElements({class: 'menu'}, dom);
          var firstMenu = menuTables[0];
          var rows = htmlparser.DomUtils.getElementsByTagName('tr', firstMenu);
          
          var parsedMenu = [];
          var currentDay = [];
          for(i = 0; i<rows.length; i++) {
            
            var row = rows[i];
            
            var headers = htmlparser.DomUtils.getElementsByTagName('th', row);
            if(headers.length > 0) {

              var header = htmlparser.DomUtils.getElementsByTagType('text', row);
              if(header.length > 0) {
                currentDay = [];
                parsedMenu.push(currentDay);
              }
            } else {
              var mealRows = htmlparser.DomUtils.getElements({class: 'mid'}, row);
              var meals = htmlparser.DomUtils.getElementsByTagType('text', mealRows);
              var meal = meals[0]['data'];
              if(meal.indexOf('Komponera din egen sallad') === -1 && meal.indexOf('erbjuder..') === -1 && meal.indexOf('Hamburgare med') === -1) {
                currentDay.push(meal);
              }
            }
          }
          
          var todaysMenu = [];
          var date = new Date();
          var weekday = date.getDay();
          switch(weekday) {
            case 0: //sunday
            case 1: //monday
            case 6: //saturday
              todaysMenu = parsedMenu[0];
              break;
            case 2: //tuesday
            case 3: //wednesday
            case 4: //thursday
            case 5: //friday
              todaysMenu = parsedMenu[weekday - 1];
              break;
          }
          
          var out = '<table id="wheelers">';
          for(i = 0; i<todaysMenu.length; i++) {
            out += '<tr><td>' + todaysMenu[i] + '</td></tr>';
          }
          out += '</table>';
                        
          
          res.send(out);
        }
      }, {verbose: false});
      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(body);
      
    }
    
    
  });

});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
