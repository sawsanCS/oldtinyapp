const express = require("express");
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
var app = express()
app.use(cookieParser())
const PORT = 8080; 
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "bcxJ48lW" }
};
function urlsForUser(id) {
  let idArray = {};
  for (const url in urlDatabase) {
    console.log('I entered the loop');
    if (urlDatabase[url].userID === id) {
      console.log('Im in the if ');
      idArray[url] = urlDatabase[url];
    }
  }
  return idArray;
}
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
      console.log(users[userId]);
      return users[userId];
      
    }
  }
  return null;
}
function authenticateUser(email, password){
  for(var key in users){
    /* this syntax for bCrypt didn't work
    if((users[key].email === email) && (bcrypt.compareSync(password, users[key].password))) {
      return key;
    } */
    if((users[key].email === email) && ( users[key].password === password)) {
      return key;
  }
}
  return null;
};
app.get("/urls/new", (req, res) => {
  console.log('hello');
  let user = req.cookies.userId;
  const newLongURL = req.body.longURL;
  const newShortURL = generateRandomString();
  console.log('the cookies', user);
  if (!user) {
    res.redirect('/login');
  }
  else {
  const templateVals = { urls: urlDatabase, user: user, longURL: newLongURL, shortURL: newShortURL};
  res.render('urls_new', templateVals);}
});
app.post('/urls/new', (req, res) => {
  const newLongURL = req.body.longURL;
  const newShortURL = generateRandomString();
  const userId = req.cookies.userId;
  if (userId === null || userId === undefined) {
    res.redirect("/login");
  } else {
    urlDatabase[newShortURL] = {newLongURL, userId};
    console.log(urlDatabase);
    res.redirect("/urls");
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: req.cookies['userId']
  };
  res.render("urls_show", templateVars); 
});

app.post("/urls/:shortURL", (req, res) =>{
  let urls = {};
  urls = urlsForUser (req.cookies.userId);
  for (const url in urls) {
    if (urls[url].longURL === urlDatabase[url].longURL) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    }
  }
  console.log(urlDatabase);
  res.redirect('/urls');
  });
   



app.get("/urls", (req, res) => {
  const user= req.cookies.userId;
  console.log(user);
  const newLongURL = req.body.longURL;
  console.log('lets see if there is an input ',urlsForUser(user));
  const templateVars = { urls: urlsForUser(user), user : user, longURL: newLongURL};
  res.render('urls_index', templateVars);
});

  app.post("/urls", (req, res) => {
    const newLongURL = req.body["longURL"];
    const newShortURL = generateRandomString();
    console.log('your cookies are',req.cookies)
    const userId = req.cookies["userId"];
    
    if (userId === null || userId === undefined) {
      res.redirect("/login");
    } else {
      if (newLongURL != "") {
        urlDatabase[newShortURL].longURL = newLongURL;
        res.redirect(`/urls/${newShortURL}`);
      }
      else {
        console.log(' no urls for you');
      }
    }

  });
app.get("/login", (req, res) => {
  const user = {id : null};
 const templateVars = { error :null, user: user};
 res.render('login', templateVars);
});
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = authenticateUser(email, password) ;
  console.log('hne', user)
 if (user === null) {
  res.status(403).send('email or password is incorrect');
   }   else {
    res.cookie("userId", user);
    res.redirect('/urls');
   
   }
 
});
app.get('/logout', (req, res) => {
const user = req.cookies['userId'];
const templateVals = {user: user}
res.render('logout', templateVals);
});
app.post("/logout", (req, res) => {
  console.log('logout process');
 console.log(res.clearCookie('userId')) ;
  res.redirect('/urls')
});

app.post("/urls/:shortURL/delete", (req, res) =>{
  console.log(req.params.shortURL);
  let urls = {};
  urls = urlsForUser (req.cookies.userId);
  for (url in urls) {
    if (url === req.params.shortURL) {
       delete urlDatabase[req.params.shortURL];
       console.log('successfully deleted')
    }
  }
  console.log(urlDatabase);
  res.redirect('/urls');
});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(shortURL, longURL);

  if (longURL) {
    res.redirect(longURL);
  } 
});


/*app.post("/urls/new", (req, res) => {
  console.log('we re trying to send data');
  console.log(req.cookies);  // Log the POST request body to the console
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});*/
app.get("/register", (req, res) => {
 
  const email = req.body.email;
  const password = req.body.password;
  const user = { email, password};
  console.log(user);
  const templateVars = { urls: urlDatabase , user : user };
  res.render('register', templateVars);
  });
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let newUser = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  if (email === "" || password ==="") {
    res.status(400).send('your email or your password is empty');
    res.end();
  }
  console.log(fetchUserByEmail(users, email));
  if (fetchUserByEmail(users, email)) {
    res.status(400).send('Sorry but this email already exists');
    res.end();
  }
  else {
    users[userID]= newUser;
    res.cookie("userId", userID);
    console.log(newUser);
    res.redirect('/urls');
  }
    });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
