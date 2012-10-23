var     fs     		= require('fs'), // core filesys in node.js se http://nodejs.org/api/fs.html
    		mongoose 	= require('mongoose'), // ORM'is for MongoDb se http://mongoosejs.com/
    		Schema 		= mongoose.Schema; // .. short map Schema to mongoose.Schema

var db = mongoose.createConnection("mongodb://dbu:alpine66@ds035997.mongolab.com:35997/b_computers");
var express = require("express");
var app = express();





   db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
      console.log("dbOpen");
    });

  var computerUsers = new mongoose.Schema({ 
    name: String, 
    CreateDate: Date 
  });
  var compSchema = new mongoose.Schema({
      cMan: String,
      cModel: String,
      cSN: String,
      cName: String,
      cComment: String,
      cUser: [computerUsers]

  });

var ComputerModel = db.model('ComputerModeln', compSchema);
var ComputerUserModel = db.model('ComputerUserModeln', computerUsers);



app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.locals.pretty = true;

//  app.use(express.methodOverride());
//  app.use(express.cookieParser());
//  app.use(express.session({ secret: 'your secret here' }));
//  app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});


app.get('/new', function(req, res){

    res.render(__dirname + '/views/newComp.jade', {title: 'Recept', ost: ''});
    console.log(__dirname);

});



app.get('/', function(req, res){

    res.render(__dirname + '/views/index.jade', {title: 'Recept', ost: ''});
    console.log(__dirname);

});

app.post('/computers', function(req, res){
  var uUser = req.body.nameOfUser;
  var compID = req.body.compID;

  var newUser = new ComputerUserModel();

  var DateNow = new Date()

  newUser.name = uUser;
  newUser.CreateDate = DateNow;


    ComputerModel.findOne('_id:' + compID , function(err, doc){
      if (err) res.send(404);

      console.log(doc);
      doc.cUser.push(newUser);

      doc.save;

      console.log(doc);
      //res.render(__dirname + '/views/Comps.jade', {title: 'Datorer', comps: doc});


 

    });
      //res.render(__dirname + '/views/Comps.jade', {title: 'Datorer', comps: doc});


    
//YourSchema.virtual('date')
//  .get(function() {
//    return this._id.generationTime;
  });





app.post('/new', function(req, res){

    var uMan = req.body.uMan;
    var uModel = req.body.uModel;
    var uSn = req.body.uSn;
    var uName = req.body.uName;
    var uComment = req.body.uComment;

    var newComputer = new ComputerModel();

    newComputer.cMan = uMan;
    newComputer.cModel = uModel;
    newComputer.cSN = uSn;
    newComputer.cName = uName;
    newComputer.cComment = uComment;

    newComputer.save(function(err){
      if (err) res.send(err);
      res.send('All data is saved with id'+ newComputer._id);
    });


    console.log("__dirname");
    res.send( uName);
});

// parameters and query strings
// surf to /test/kalle?phone=0123456789
app.get('/:name', function(req, res){
  if (req.params.name.toString() == "computers"){

    ComputerModel.find(function(err, doc){
      if (err) res.send(404);

      res.render(__dirname + '/views/Comps.jade', {title: 'Datorer', comps: doc});


    });
    //res.render(__dirname + '/views/Comps.jade', {title: 'Recept', ost: ''});
  }

});


app.listen(3000);
console.log('Listening on port 3000');