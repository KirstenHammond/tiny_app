//Tiny App

//Create a website and server that reduces long urls to short urls. Users must be logged in, after which they will gain acess to their database of shortened URLs

//---------------------------------------------------------------------------------------------------------------------
//SETUP

const express = require("express");
const cookieParser = require('cookie-parser'); //installed npm install cookie-parser
const app = express();
app.set("view engine", "ejs"); //setting the EJS view engine to recognise the views folder
const PORT = 8080; // default port 8080


//------------------------------------------------------------------------------------------------------------
//GLOBAL FUNCTIONS

//Function to create short URL
const randomString = () => {
  result = "";
  var options = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  options.split(',').map(function () {
    for (let i = 0; i < 6; i++) {
      result += options.charAt(Math.floor(Math.random() * options.length));
    }
  })
  return result;
}

const getUserByEmail = (emailProvided) => {
  let userObjectByEmail = {};
  for (let existingIDs in users) {
    //console.log("users[existingIDs].email", users[existingIDs].email);
    if (users[existingIDs].email === emailProvided) {
      //console.log("users[existingIDs]", users[existingIDs]);
      userObjectByEmail = users[existingIDs];
    } else {
      userObjectByEmail = null;
    }
  }
  return userObjectByEmail;
}
//-----------------------------------------------------------------------------------------------------------------------------
//MIDDLEWARE

app.use(cookieParser());//calling the cookie parser function within express()
app.use(express.urlencoded({ extended: true })); //MIDDLEWARE converting the server response body from buffer to encoded readable language
app.use((req, res, next) => { //MIDDLEWARE
  console.log(`reqmethod= ${req.method}  requrl= ${req.url}`); //for every request, do this
  next(); //starts a chain of callbacks thatll run with every request
})


//---------------------------------------------------------------------------------------------------------------------
//DATABASES

//URL Database
const urlDatabase = { //presumably this will be refactored from a database and not hard coded
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "5we8aY": "http://www.guardian.co.uk"
};


//User Database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//------------------------------------------------------------------------------------------------------------------
//ROUTES


//Main Page
app.get("/urls", (req, res) => { //main table housing historical conversions when signed in
  //console.log(users);//logs to server not client side so we can track movements on databases
  const user_id = req.cookies["user_id"];
  let userObject = {};
  for (let existingID in users) {
    if (existingID === user_id) {
      userObject = users[existingID];
    }
  }
  const templateVars = {
    userObject,  //adding access to the cookie user_id in the header template
    urls: urlDatabase,
    dateCreated: new Date().toLocaleDateString()///stretch project
  };
  res.render("urls_index", templateVars);
})


//Login

//GET Login
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  let userObject = {};
  for (let existingID in users) {
    if (existingID === user_id) {
      userObject = users[existingID];
    }
  }
  const templateVars = {
    userObject //adding access to the cookie user_id in the header template
  }
  res.render("login", templateVars);
});


//POST login
app.post("/login", (req, res) => {
  console.log("req.body", req.body);
  
  //const loginId = randomString(); //using the same shortURL helper function
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  let userObjectLogin = getUserByEmail(loginEmail);
  console.log("userobjectlogin", userObjectLogin);

  if (userObjectLogin && (userObjectLogin.password === loginPassword)) {
    res.cookie("user_id", userObjectLogin.id, { encode: String });
    res.redirect('urls');
  } else {
    res.sendStatus(403)
  }
});

//Logout
app.post("/logout", (req, res) => {//when user_id cookie is truthy
  //console.log("logout", req.cookies.user_id);//checking
  res.clearCookie("user_id");//upon clicking logout, the cookie called user_id is cleared
  res.redirect("/login");//redirected to home page, now condition is falsey so login option appears
});


//Register. Adds to users database
app.get("/register", (req, res) => { //rendering for /register page where users submit their email and password to create a new user
  const user_id = req.cookies["user_id"];
  let userObject = {};
  for (let existingID in users) {
    if (existingID === user_id) {
      userObject = users[existingID];
    }
  }
  const templateVars = {
    userObject //adding access to the cookie user_id in the header template
  }
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {//event handler for submissions of email and password- adds them to the users database
  const id = randomString(); //using the same shortURL helper function
  const email = req.body.email;
  const password = req.body.password;

  let registerUserObject = getUserByEmail(email);//returning an object that matches the ID, if it exists
  if (registerUserObject === null && (password !== "" || email !== "")) {//if the user isnt already in the database and on the condition that the fields arent empty
    users[id] = { id, email, password }; //add the user to the user database
    res.cookie("user_id", `${id}`, { encode: String });
    res.redirect('/urls');
  } else {
    res.sendStatus(400);
  }
  //console.log("registerUserObject", registerUserObject); //checking the value of the id object, if it doesnt exists = null
  //console.log("users database reg", users); //checking they havent been added on twice
});


//New URL shortener
app.get("/urls/new", (req, res) => {// creating a new submission. It has a linked POST request.
  const user_id = req.cookies["user_id"];
  let userObject = {};
  for (let existingID in users) {
    if (existingID === user_id) {
      userObject = users[existingID];
    }
  }
  const templateVars = {
    userObject //adding access to the cookie user_id in the header template
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { //POST request for when user submits long url from /urls/new. 
  const shortURL = randomString();//short url generator for each post
  const newEntry = `http://${req.body.longURL}`;//making the format readable when redirecting
  urlDatabase[shortURL] = newEntry; //adding the new short url and provided long url to database
  res.redirect(`/urls/${shortURL}`);// eg urls_show = redirect to a page displaying long url and shortened URL as a hyperlink (see below)
})

//Redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];//getting the longURL from the post above as it has been saved to the database
  if (urlDatabase.hasOwnProperty(shortURL)) {//checking if shortURL is truthy in urlDatabase.
    return res.redirect(longURL);//when u/shortURL is visited, it redirects to the long URL
  }
  else {
    res.render('404');
  }
});


//Edit/show each short URL
app.get("/urls/:shortURL", (req, res) => { //URL specific page detailing the long and short URL and rendering urls_show

  const user_id = req.cookies["user_id"];
  let userObject = {};
  for (let existingID in users) {
    if (existingID === user_id) {
      userObject = users[existingID];
    }
  }
  const templateVars = {
    userObject, //adding access to the cookie user_id in the header template
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    dateCreated: new Date().toLocaleDateString()///stretch projet
  };
  if (urlDatabase.hasOwnProperty(templateVars.shortURL)) { //cheking that the id that has been requested exists in the database
    res.render("urls_show", templateVars); //if it does then proceed with rendering urls/show
  }
  else {
    res.render('404');
  }
});

app.post('/urls/:shortURL', (req, res) => {//POST handler for when the edit button is clicked in urls_show. It takes the longURL submitted and updated the database
  const editedURL = `http://${req.body.longURL}`;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = editedURL;//updating the database with the new submission
  res.redirect('/urls');
});


//Delete
app.post('/urls/:shortURL/delete', (req, res) => { //the POST handler for when the delete button is clicked next to the long URL in /urls
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]; //delete keyword to remove item from database, accessed by the key
  res.redirect('/urls');
});




//------------------------------------------------------------------------------------------------------------------
//ERROR HANDLING
//At the bottom so every other route gets filtered through before triggering this render
app.get("/*", (req, res) => {
  res.render('404'); // // where 404 is a file path with ejs view.Currently only working on /
});


//--------------------------------------------------------------------------------------------------------------------------
//LISTEN
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}!`);
});
