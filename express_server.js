const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set('view engine', 'ejs');
//app.set("views", "path/to/views");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8) ;
}


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.post("/urls/:shortURL/delete", (req, res) =>{
  console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  if (delete urlDatabase[req.params.shortURL]) {
    console.log('successfully deleted')
  };
  console.log(urlDatabase);
  res.redirect('/urls');
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  console.log(shortURL, longURL);
  //const longURL = req.body.longURL;
  //console.log(req.body);
  if (longURL) {
    res.redirect(longURL);
  } 
});


/*app.get("/urls/:shortURL/delete", (req, res) =>{
  //console.log(req.params.shortURL);
  const shURL = req.params.shortURL;
  const lURL = urlDatabase[req.params.shortURL];
  //console.log(lURL);
  const templateVars = {shURL : lURL };
  res.redirect('/urls/')
});*/


app.post("/urls", (req, res) => {
  console.log('hello'); 
  shortURL = generateRandomString();
  longURL = req.body.longURL;
  urlDatabase[shortURL]=longURL;
  
  res.redirect("/urls/");

});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})
app.post("/urls/new", (req, res) => {
  console.log('we re trying to send data');
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//console.log(generateRandomString());


  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL]
    };
    res.render("urls_show", templateVars); 
  });
 
  
  
/*app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });*/
 


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
