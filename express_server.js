let getUserByEmail = require('./helpers');
const express = require("express");
//var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
let cookieSession = require('cookie-session');
const app = express();
//app.use(cookieParser())
const PORT = 8080;
app.set('view engine', 'ejs');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
};
const urlsForUser = function(id, urlSearch) {
  for (const url in urlDatabase) {
    console.log('I entered the loop');
    if (urlDatabase[url].userID === id && url === urlSearch) {
      return true;
    }
  }
  return false;
};
const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};
/*const fetchUserById = function(users, id) {
  for (const userId in users) {
    if (userId === id) {
      return users[userId];
    }
  }
  return null;
}; */

/*const authenticateUser = function(email, password) {

  let userId;
  for (let u in users) {
    if ((users[u].email === email) && (bcrypt.compareSync(password, users[u].password))) {
      userId = u;
      break;
    }
  }
  return userId;
};*/
app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;
  let user = users[userId];
  let templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render("urls_new", templateVars);
});
app.post('/urls/new', (req, res) => {
  const newLongURL = req.body.longURL;
  const newShortURL = generateRandomString();
  const userId = req.session.user_id;
  if (userId === null || userId === undefined) {
    res.redirect("/login");
  } else {
    urlDatabase[newShortURL] = {longURL: newLongURL, userID: userId};
    console.log(urlDatabase);
    res.redirect("/urls");
  }
});
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userId = req.session.user_id;
  const user = users [userId];
  if (urlsForUser(userId, shortURL)) {
    let templateVars = {
      shortURL : shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: user
    };
    res.render("urls_show", templateVars);
  } else {
    res.send('you only have the right to edit your urls.');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  let userId = req.session.user_id;
  console.log(userId);
  if (userId !== "") {
    urlDatabase[req.params.shortURL] =  { longURL: req.body.longURL, userID: userId};
    res.redirect('/urls');
  } else {
    res.status(400).send('You need to login first');
  }
});
   
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  let user = users[userId];
  
  if (userId) {
    let templateVars = {
      urls: urlDatabase,
      user: user
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post("/urls", (req, res) => {
  const newLongURL = req.body["longURL"];
  const newShortURL = generateRandomString();
    
  const userId = req.session.user_id;
    
  if (userId === null || userId === undefined) {
    res.redirect("/login");
  } else {
    if (newLongURL !== "") {
      urlDatabase[newShortURL].longURL = newLongURL;
      res.redirect(`/urls/${newShortURL}`);
    } else {
      console.log(' no urls for you');
    }
  }
});
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  res.render("login", {user: user});
});
app.post("/login", (req, res) => {
  const thisEmail = req.body.email;
  const thisPassword = req.body.password;
  if (thisEmail === "" || thisPassword === "") {
    res.send('your fields can not be empty');
  } else {
    let foundUser = false;
    for (let u in users) {
      if (users[u].email === thisEmail) {
        if (bcrypt.compareSync(thisPassword,users[u].password)) {
          foundUser = true;
          req.session.user_id = u;
          res.redirect("/urls");
        }
      }
    }
    if (!foundUser) {
      res.status(400).send("Login or password is incorrect!");
    }
  }
});
app.get('/logout', (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVals = {user : user};
  res.render('logout', templateVals);
});
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});
app.post("/urls/:shortURL/delete", (req, res) =>{
  console.log(req.params.shortURL);
  if (urlsForUser(req.session.user_id, req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    console.log('successfully deleted');
  } else {
    res.send('you only have the right to delete your urls');
  }
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


app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
    if (userId) {
    res.redirect('/urls');
  } else {
    res.render("register", {user : user});
  }
});
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let pwd = req.body.password;
  console.log('show me my pwd', pwd);
  const hashedPassword = bcrypt.hashSync(pwd, 10);
  let newUser = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  //if email or password is blank set and render 400 status
  if (req.body.email === "" || pwd === "") {
    res.status(400).send('You need to enter your email and password');
  //if email sent = email in db set and render 400 status
  } else if (getUserByEmail(users, req.body.email)) {
    res.status(400).send('there is already a user with this email');
  } else {
    // insert userVars into database
    users[userID] = newUser;
    req.session.user_id = userID;
    // res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
