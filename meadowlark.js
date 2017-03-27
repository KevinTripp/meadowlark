var express = require('express');
var fortune = require('./lib/fortune.js');
var formidable = require('formidable');

var app = express();


// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

var credentials = require('./credentials.js')

app.use(express.static(__dirname + "/public"));
app.use(require('body-parser')());
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
  resave:false,
  saveUninitialized: false,
  secret:credentials.cookieSecret,
}));


app.use(function(req, res, next){
  res.locals.showTests = app.get('env') !== 'production' && req.query.test == '1';
  next();
});





app.use( function (req, res, next){
  //  if there's a flash message, transfer it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

app.get('/', function(req, res){
  res.cookie('monster','nom nom');
  res.cookie('signed_monster','nom nom',{singed:true});
  req.session.userName = 'Anonymous';
  var colorScheme = req.session.colorScheme || 'dark';
  res.render('home');
});

app.get('/about', function(req, res){
  res.render('about', {
        fortune: fortune.getFortune()
      , pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/hood-river', function(req, res){
  res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function(req, res){
  res.render('tours/request-group-rate');
});

app.get('/newsletter',function(req, res){
  res.render('newsletter',{csrf:'csrf token goes here'});
});

var VALID_EMAIL_REGEX = new RegExp('^[ a-zA-Z0-9.!# $%&\'* +\/ =? ^_ `{ |} ~-] +@'
  + '[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{ 0,61}[ a-zA-Z0-9])?'
  + '(?:\.[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{ 0,61}[ a-zA-Z0-9])?) + $');

app.post('/newsletter',function(req, res){
  var name = req.body.name || "", email = req.body.email || '';
  //input calidation
  if(!email.match(VALID_EMAIL_REGEX)){
    if(req.xhr) return res.json({error:'Invalid name email address.'});
    req.session.flash = {
      type:'danger',
      intro: 'Validation Error!',
      message: 'The email address you entered was not valid',
    };
    return res.redirect(303,'/newsletter/archive');
  }
  new NewsLetterSignUp({ name:name, email, email}).save(function(err){
    if(err){
      if (req.xhr) return res.json({error: ' Database Error.'});
      req.session.flash = {
        type:'danger',
        intro: 'Database Error!',
        message: 'There was a database error; please try again later',
      }
      return res.redirection(303, '/newsletter/archive');
    }
      if (req.xhr) return res.json({success: true});
      req.session.flash = {
        type:'success',
        intro: 'Thank you! bob',
        message: 'You have now been signed up for the newsletter',
      };
      return res.redirect(303,'/newsletter/archive');
  });

});

app.get('/contest/vacation-photo', function(req, res){
    var now = new Date();
    res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth() });
});
app.post('/contest/vacation-photo/:year/:month', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');
        console.log('received fields:');
        console.log(fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303, '/thank-you');
    });
});

app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
        // if there were an error, we would send { error: 'error description' }
        res.send({ success: true });
    } else {
        // if there were an error, we would redirect to an error page
        res.redirect(303, '/thank-you');
    }
});

// 404 catch all handler(middleware)
app.use(function(req, res, next){
  res.status('404');
  res.render('404');
});

//custom 500
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status('500');
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; Termenate with Crtl + C');
});
