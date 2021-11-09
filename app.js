//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const fs = require("fs");
const multer = require('multer');

const homeStartingContent = "\xa0\xa0\xa0\xa0 Hei! Bine ai venit pe site-ul nostru! Aici, în spațiu sigur pe care încercăm să îl creăm și să îl conservăm, tehnologia e mâna în mâna cu literatură. Echipa noastră e constituită dintr-o tânăra îndrăgostită de lectură și pasionată de discuții pe teme literare și de un tânăr informatician ambițios și mai mult decât priceput ce se dedică scopului ei și o susține prin digitalizarea recenziilor și mediatizarea acestora. Prin urmare, ghidați de pasiunile noastre ce se împletesc prolific vrem să avem cât mai mult acces la pasiunile și părerile tale, să îți transmitem din ardoarea noastră de a face lucrurile care ne plac și de a te încuraja să îți spui, la rândul tău, părerea unică despre lucrurile pe care le întâlnești!";
const aboutContent = "\xa0\xa0\xa0\xa0 Noi suntem Dia și Nico, doi elevi în clasa a 12-a la Colegiul Național Emil Racoviță Iași. Suntem pasionați de lectură respectiv programare și am decis să facem acest blog prin care împărtășim cu voi diferite lecturi. Ne place să călătorim, să mergem cu bicicletele, să facem puzzleuri, să gătim și nu în ultimul rând să bem cafeluță. Suntem nerăbdători să luăm carnetele și să putem merge peste tot și oriunde în călătorii de vis!";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './public/Documents');
    },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const upload = multer({storage: storage});

const jsonString = fs.readFileSync('./articles.json', 'utf-8');
let posts = JSON.parse(jsonString);

let AdminAccess = false;
let alertaSters = 0;

app.get("/", function(req, res){
  res.render("home", {
    startingContent: homeStartingContent,
    posts: posts,
    AdminAccess: AdminAccess,
    alertaSters: alertaSters
    });
    alertaSters = 0;
    console.log(posts);
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/AdminAccess", function(req, res){
  res.render("AdminAccess");
});

app.post("/AdminAccess", function(req,res){

  let user_password = req.body.AdminPassword;
  if(user_password == '<3Dia<3'){
    AdminAccess = true;
    res.redirect("/compose");
  }
  else{
    res.redirect("/AdminAccess");
  }
});

app.get("/compose", function(req, res){
  if(AdminAccess){
    res.render("compose");
  }
  else{
    res.redirect("/AdminAccess");
  }

});

app.post("/compose", upload.single('document'), function(req, res){

  const post = {
    title: req.body.postTitle,
    content: req.body.postBody,
    path: req.file.path
  };
  posts.push(post);
  
  fs.writeFile ("./articles.json", JSON.stringify(posts), function(err) {
    if (err) throw err;
    console.log('complete');
    });

  res.redirect("/");

});
app.post("/compose_logout", function(req, res){
  AdminAccess = false;
  res.redirect("/");
});

app.post("/post", function(req, res){
  let id = req.body.id;
  let permisiune = req.body.permisiune;

  if(permisiune == 'true'){

    posts.splice(id, 1);

    fs.writeFile ("./articles.json", JSON.stringify(posts), function(err) {
      if (err) throw err;
      console.log('Am sters cu succes articolul!');
      });
      alertaSters = 2;
  }
  else{
    alertaSters = 1;
  }
  res.redirect("/");
});

app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);

  posts.forEach(function(post){
    const storedTitle = _.lowerCase(post.title);
    if (storedTitle === requestedTitle) {
      let document = post.path.substring(7);
      let ID = posts.indexOf(post);
      res.render("post", {Document: document, permisiune:AdminAccess, id:ID});
    }
  });

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000 or process.env.PORT");
});
