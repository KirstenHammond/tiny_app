//Tiny App

//Create a website and server that reduces long urls to short urls. Users must be logged in, after which they will gain acess to their database of shortened URLs

//---------------------------------------------------------------------------------------------------------------------
//SETUP

const express = require("express");
const cookieParser = require('cookie-parser'); //installed npm install cookie-parser
const app = express();
app.set("view engine", "ejs"); //setting the EJS view engine to recognise the views folder
const PORT = 8080; // default port 8080

//-----------------------------------------------------------------------------------------------------------------------------
//MIDDLEWARE

app.use(cookieParser());//calling the cookie parser function within express()
app.use(express.urlencoded({ extended: true })); //MIDDLEWARE converting the server response body from buffer to encoded readable language
app.use((req, res, next) => { //MIDDLEWARE
  console.log(`reqmethod= ${req.method}  requrl= ${req.url}`); //for every request, do this
  next(); //starts a chain of callbacks thatll run with every request
})

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

const getUserByEmail = emailProvided => {
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

const isLoggedIn = cookie => { //for determing logged in status when logged in and attempting to access login or register page
  if (cookie) {
    return true;
  } return false;
}

const urlsForUser = user_id => {
  let filteredURLS = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      filteredURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLS;
}


//---------------------------------------------------------------------------------------------------------------------
//DATABASES

//URL Database
const urlDatabase = { //presumably this will be refactored from a database and not hard coded
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "12345"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "12345"
  },
  "5we8aY": {
    longURL: "http://www.guardian.co.uk",
    userID: "67890"
  },
  "s8Q3Ho": {
    longURL: "http://www.facebook.com",
    userID: "67890"
  }
}
const unfilteredDatabase = urlDatabase;
//User Database
const users = {
  "67890": {
    id: "67890",
    email: "k@k.com",
    password: "123",
  },
  "12345": {
    id: "12345",
    email: "l@l.com",
    password: "123"
  }

};

//------------------------------------------------------------------------------------------------------------------
//ROUTES


//GET (URL)
// Root Dir--------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => {
  const user_id = req.cookies["user_id"];
  const loginStatus = isLoggedIn(user_id);
  if (!loginStatus) {
    res.redirect("/login");
  } 
    res.redirect("/urls")

});


//Main Page----------------------------------------------------------------------------------------------------
app.get("/urls", (req, res) => { //main table housing historical conversions when signed in
  //console.log(users);//logs to server not client side so we can track movements on databases
  const user_id = req.cookies["user_id"];

  const loginStatus = isLoggedIn(user_id);
  if (!loginStatus) {
    res.send("<p> Please login or register to view your URLS</p>");
  } else {
    let userObject = {};
    for (let existingID in users) {
      if (existingID === user_id) {
        userObject = users[existingID];
      }
    }
    let filteredURLS = urlsForUser(user_id);
    console.log("filteredURLS", filteredURLS);
    const templateVars = {
      userObject,  //adding access to the cookie user_id in the header template
      filteredURLS,
      dateCreated: new Date().toLocaleDateString()///stretch project
    };
    res.render("urls_index", templateVars);
  }
  console.log("urldatabase", urlDatabase);
});


//New URL shortener-----------------------------------------------------------------------------------------
app.get("/urls/new", (req, res) => {// creating a new submission. It has a linked POST request.
  const user_id = req.cookies["user_id"];

  const loginStatus = isLoggedIn(user_id);
  console.log("loginStatus", loginStatus);

  if (!loginStatus) {
    res.redirect("/login")
  } else {
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
  }
});


//Edit/show each short URL------------------------------------------------------------------------------------------------------
app.get("/urls/:shortURL", (req, res) => { //URL specific page detailing the long and short URL and rendering urls_show
  //console.log("urlDatabase before show", urlDatabase);
  const user_id = req.cookies["user_id"];
  const shortURLRequested = req.params.shortURL;
  const loginStatus = isLoggedIn(user_id);
  //console.log("loginStatus", loginStatus);
  let filteredURLS = urlsForUser(user_id);
  //console.log("filteredURLS", filteredURLS);
  if (!urlDatabase[shortURLRequested]) {
    res.send("<p>That URL does not exist on our database</p>")
  } else if (!loginStatus) {
    res.send("<p>Please login to show individual URL pages</p>")
  } else if (!filteredURLS[shortURLRequested]) {
    res.send("<p>You dont have authorisation to show this URL</p>")
  } else {
    let userObject = {};
    for (let existingID in users) {
      if (existingID === user_id) {
        userObject = users[existingID];
      }
    }
    const templateVars = {
      userObject, //adding access to the cookie user_id in the header template
      longURL: filteredURLS[shortURLRequested].longURL,
      shortURLRequested,
      dateCreated: new Date().toLocaleDateString()///stretch projet
    };
    res.render("urls_show", templateVars); //if it does then proceed with rendering urls/show
  }
  //console.log("urlDatabase after show", urlDatabase);
});

//Redirect to long URL whether signed in or not------------------------------------------------------------------------------------------------------
app.get("/u/:shortURL", (req, res) => {
  //console.log("urlDatabase on longurl click", urlDatabase);
  const shortURLRequested = req.params.shortURL;
  if (urlDatabase[shortURLRequested]) { //if the short URL exists in our full database
    let redirLongURL = urlDatabase[shortURLRequested].longURL; //getting the longURL from the post above as it has been saved to the database
    res.redirect(redirLongURL);//when u/shortURL is visited, it redirects to the long URL
  } else {
    res.send("<p>That short URL doesnt exist in our database</p>")
  }
});



//POST (URL)

//POST New URL-----------------------------------------------------------------------------------------------------------------
app.post("/urls", (req, res) => { //POST request for when user submits long url from /urls/new and returns to homepage. 
  const user_id = req.cookies["user_id"];
  const loginStatus = isLoggedIn(user_id);
  console.log("loginStatus", loginStatus);
  console.log("req.body", req.body);

  if (!loginStatus) {
    res.redirect("404");//if logged out and accessing path via curl, redirect. Safety issue.
  } else {
    const shortURL = randomString();//short url generator for each post
    const longURL = `http://${req.body.longURL}`;//making the format readable when redirecting
    urlDatabase[shortURL] = { longURL, userID: user_id }; //adding the new short url and provided long url to database
    res.redirect(`/urls/${shortURL}`);// eg urls_show = redirect to a page displaying long url and shortened URL as a hyperlink (see below)

  }
  //console.log("url database after new database changes", urlDatabase);
});


//POST for edit longURL-----------------------------------------------------------------------------------------------------------------------------
app.post('/urls/:shortURL', (req, res) => {//POST handler for when the edit button is clicked in urls_show. It takes the longURL submitted and updated the database
  const editedURL = `http://${req.body.longURL}`;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = editedURL;//updating the database with the new submission
  res.redirect('/urls');
});



//Delete----------------------------------------------------------------------------------------------------------------------------------------
app.post('/urls/:shortURL/delete', (req, res) => { //the POST handler for when the delete button is clicked next to the long URL in /urls
  const user_id = req.cookies["user_id"];
  const loginStatus = isLoggedIn(user_id);
  const shortURLRequested = req.params.shortURL;
  console.log("short url", shortURLRequested);
  let filteredURLS = urlsForUser(user_id);

  if (!urlDatabase[shortURLRequested]) {
    res.send("<p>That URL does not exist on our database</p>")
  } else if (!loginStatus) {
    res.send("<p>Please login to delete this URL </p>")
  } else if (!filteredURLS[shortURLRequested]) {
    res.send("<p>You dont have authorisation to delete this URL</p>")
  }
  delete urlDatabase[shortURLRequested]; //delete keyword to remove item from database, accessed by the key
  res.redirect('/urls');
});


//GET (USER)

//GET Login---------------------------------------------------------------------------------------------------------
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];

  const loginStatus = isLoggedIn(user_id); //boolean value- true if logged in, false if not.
  //console.log("loginStatus", loginStatus);

  if (loginStatus) {
    res.redirect("/urls")
  } else { //if not already logged in, then render the login page
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
  }

});


//Get Register-------------------------------------------------------------------------------------------------------------------------------
app.get("/register", (req, res) => { //rendering for /register page where users submit their email and password to create a new user
  const user_id = req.cookies["user_id"];

  const loginStatus = isLoggedIn(user_id);
  //console.log("loginStatus", loginStatus);

  if (loginStatus) {
    res.redirect("/urls")
  } else {
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
  }
});

//POST (USER)

//Post login details-----------------------------------------------------------------------------------------------------------------------------------
app.post("/login", (req, res) => {
  //console.log("req.body", req.body);

  const loginEmail = req.body.email;
  const loginPassword = req.body.password;

  let userObjectLogin = getUserByEmail(loginEmail);
  //console.log("userobjectlogin", userObjectLogin);

  if (userObjectLogin && (userObjectLogin.password === loginPassword)) {
    res.cookie("user_id", userObjectLogin.id, { encode: String });
    res.redirect('urls');
  } else {
    res.sendStatus(403)
  }
});

//POST register details------------------------------------------------------------------------------------------------------------
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


//Logout---------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/logout", (req, res) => {//when user_id cookie is truthy
  //console.log("logout", req.cookies.user_id);//checking
  res.clearCookie("user_id");//upon clicking logout, the cookie called user_id is cleared
  res.redirect("/login");//redirected to home page, now condition is falsey so login option appears
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
