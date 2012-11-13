var     fs     		= require('fs'), // core filesys in node.js se http://nodejs.org/api/fs.html
    		mongoose 	= require('mongoose'), // ORM'is for MongoDb se http://mongoosejs.com/
        ObjectId = require('mongoose').Types.ObjectId,
    		Schema 		= mongoose.Schema, // .. short map Schema to mongoose.Schema
        express   = require("express"),
        ldapjs    = require("ldapjs"),
        parseDN   = require("ldapjs").parseDN,
        parseFilter = require('ldapjs').parseFilter,
        config    = require("./config.js")

var db = mongoose.createConnection(config.mongoLab.conString);
var app = express();



var assert = require('assert');
var sprintf = require('util').format;
var ldap = require('ldapjs');


function searchAD(inSearchString, callback){
  var client = ldapjs.createClient({
    url: config.AD.Url

  });

  

  client.bind(config.AD.User, config.AD.Pass, function (err) {
      assert.ifError(err);


      var base = 'dc=edita, dc=sverige';
      var opts = {
          scope: 'sub',
          //ou: "Konsulter", 
          //filter:  'sAMAccountName=valakj'
          //filter: marvin
          //(&(email=*@bar.com)(l=Seattle))
          //parseFilter
          //filter: parseFilter('(&(sAMAccountName=' + inSearchString + '*)(ou=_JG Communications))')
          //filter:  '(sAMAccountName=' + inSearchString + '*)(ou=_JG Communications)'
         filter:  '(cn=*' + inSearchString + '*)'
      };

      client.search(base, opts, function (err, res) {
          assert.ifError(err);
          var result = [];
          var dn;
          res.on('searchEntry', function (entry) {

              dn = parseDN(entry.objectName);
              console.log(dn);
              //console.log(dn.rdns[0].cn);
              result.push(dn.rdns[0].cn.replace("\\", ""));

              //console.log(result);

              /*
              dn.rdns.forEach(function(item) {
                if (item.type == "cn")
                  console.log(item.cn);
              })
              */

          });

          res.on('end', function () {
                            callback(result);
              if (!dn) return;
           });

           res.on('error', function (err) {
                console.error('search error: ' + err.toString());
                process.exit(1);
           });

       });

  });  
}

   db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
      console.log("dbOpen");
    });

  var computerUsers = new mongoose.Schema({ 
    Name: String, 
    CreateDate: Date,
    ReturnDate: Date,
    Returned: String
  });

  var compSchema = new mongoose.Schema({
      cMan: String,
      cModel: String,
      cSN: String,
      cName: String,
      cComment: String,
      cCreated: Date,
      cUser: [computerUsers]

  });

var ComputerModel = db.model('ComputerModel', compSchema);
var ComputerUserModel = db.model('ComputerUserModel', computerUsers);



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



app.get('/autocomplete.ashx', function(req, res){
  
    searchAD(req.query["query"], function(result){
        var strSearchRes =
        {
          query:req.query["query"],
          suggestions:result
        };
          res.send(strSearchRes);
    });

});

app.post('/computers', function(req, res){
  var uUser = req.body.nameOfUser;
  var compID = req.body.compID;



  var newUser = new ComputerUserModel();

  var DateNow = new Date();

  newUser.Name = uUser;
  newUser.CreateDate = DateNow;


  var query = ComputerModel.findOne({'_id': compID.toString()});
    //ComputerModel.findOne({'_id': compID}, function(err, doc){

    query.exec(function (err, ComputerModel) {

      ComputerModel.cUser.push(newUser);
      ComputerModel.save();
      res.redirect('/computers');
      
    })


      //res.render(__dirname + '/views/Comps.jade', {title: 'Datorer', comps: doc});


 

    //});
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
    var DateNow = new Date()

    newComputer.cMan = uMan;
    newComputer.cModel = uModel;
    newComputer.cSN = uSn;
    newComputer.cName = uName;
    newComputer.cComment = uComment;
    newComputer.cCreated = DateNow;

    newComputer.save(function(err){
      if (err) res.send(err);
      res.send('All data is saved with id'+ newComputer._id);
    });


    console.log("__dirname");
    res.send( uName);
});

app.get('/', function(req, res)
{
        res.render(__dirname + '/views/index.jade', {title: 'Datorer'});
});

app.get('/:name', function(req, res){
  if (req.params.name.toString() == "computers"){


    ComputerModel.find(null,null,{ sort: { _id: -1}  },  function(err, doc){
      if (err) res.send(404);

      res.render(__dirname + '/views/Comps.jade', {title: 'Datorer', comps: doc});
    });
    //res.render(__dirname + '/views/Comps.jade', {title: 'Recept', ost: ''});
    
  }

console.log(req.params.name.toString());

  if (req.params.name.toString() == "home"){
        res.render(__dirname + '/views/index.jade', {title: 'Datorer'});

  };

});


app.listen(3000);
console.log('Listening on port 3000');