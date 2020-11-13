const express = require("express");
var cookieParser = require('cookie-parser');
var app = express()
app.use(cookieParser())
const PORT = 8080; 
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8) ;
}
function fetchUserById(users, id) {
  for ( const userId in users) {
    if (userId === id) {
      return users[userId];
    }
  }
  return null;
}
function fetchUserByEmail(users, email) {
  for ( const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}
function authenticateUser(email, password){
  for(var key in users){
    if((users[key].email===email) && (password=== users[key].password)){
      return users[key];
    }
  }
  return null;
};

app.get("/urls", (req, res) => {
  const user= req.cookies;
  const templateVars = { urls: urlDatabase, user : user};
  res.render('urls_index', templateVars);
});
app.post("/urls", (req, res) => {
  console.log('hello'); 
  shortURL = generateRandomString();
  longURL = req.body.longURL;
  urlDatabase[shortURL]=longURL;
  res.cookie("userId", req.cookies.id);
  res.redirect("/urls");

});
app.get("/login", (req, res) => {
  const user = {userId : null};
 const templateVars = { error :null, user: user};
 res.render('login', templateVars);
});
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  const user =fetchUserByEmail(users, email); 
  console.log('hne', user)
 if (user) {
   if (user.password === password) {
    res.cookie("userId", user.id);
    res.redirect('/urls');
   }   else {
    res.status(403).send('this password is incorrect');
   }
  }
   else {
 res.status(403).send('this email does not exist');
  }
});
app.get('/logout', (req, res) => {
const user = req.cookies;
res.render('logout', user);
});
app.post("/logout", (req, res) => {
  console.log('logout process');
 console.log(res.clearCookie('userId')) ;
  res.redirect('/urls')
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars); 
});

app.post("/urls/:shortURL", (req, res) =>{

  urlDatabase[req.params.shortURL]= req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
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

  if (longURL) {
    res.redirect(longURL);
  } 
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})
app.post("/urls/new", (req, res) => {
  console.log('we re trying to send data');
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});
app.get("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = {email, password};
  console.log(user);
  const templateVars = { urls: urlDatabase , user : email, password };
  res.render('register', templateVars);
  });
app.post("/register", (req, res) => {
  const id = Math.floor(Math.random() * 100); 
  const email = req.body.email;
  const password = req.body.password;

  if (email === "" || password ==="") {
    res.status(400);
    res.send('your email or your password is empty');
    res.end();
  }
  console.log(fetchUserByEmail(users, email));
  if (fetchUserByEmail(users, email)) {
    res.status(400);
    res.send('Sorry but this email already exists');
    res.end();
  }
  else {
    const newUser ={id, email, password};
    users[id]= newUser;
    res.cookie("userId", email);
    console.log(users);
    res.redirect('/urls');
  }
  
    });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
