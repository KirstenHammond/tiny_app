//Tiny App

//TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).
//Users must register and be logged in to view and edit their database of TinyURLs.

//---------------------------------------------------------------------------------------------------------------------
//SETUP

const express = require("express");
const methodOverride = require("method-override");
const cookieSession = require('cookie-session'); // Cookie encryption.
const app = express();
app.set("view engine", "ejs"); // Setting the EJS view engine to recognise the views folder.
const bcrypt = require("bcryptjs"); // Password encryption
const PORT = 8080; // Default port 8080

//-----------------------------------------------------------------------------------------------------------------------------
//MIDDLEWARE

app.use(methodOverride('_method')); // Stretch project
app.use(cookieSession({
  name: "user_id", // Encrypted Cookie name
  keys: ['key1', 'key2']
}));
app.use(express.urlencoded({ extended: true })); // Converting the server response body from buffer to encoded readable language.
app.use((req, res, next) => { // Optional Middleware to track request.
  console.log(`reqmethod= ${req.method}  requrl= ${req.url}`);
  next(); // Starts a chain of callbacks that'll run with every request.
});

//------------------------------------------------------------------------------------------------------------
//IMPORTING HELPER FUNCTIONS

const { getUserByEmail, getUserObject, randomString, isLoggedIn, urlsForUser } = require('./helperFunctions');

//---------------------------------------------------------------------------------------------------------------------
//IMPORTING DATABASES

const { urlDatabase, userDatabase } = require('./database');

//------------------------------------------------------------------------------------------------------------------
//ROUTES

//GET (URL)

//Root Dir--------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => {
  // If user is logged in, redirect to urls page. If not logged in, redirect to login page.
  const loginStatus = isLoggedIn(req.session.user_id); // Takes in cookie value and returns Boolean value - true if logged in, false if not logged in.
  !loginStatus ? res.redirect("/login") : res.redirect("/urls");
});


//Main Page----------------------------------------------------------------------------------------------------
app.get("/urls", (req, res) => {
  // Home page displaying user specific URL conversions when signed in.
  const user_id = req.session.user_id;
  const loginStatus = isLoggedIn(user_id); // Checking if a cookie is set in order to determine logged in status. Logic repeats for several routes.
  if (!loginStatus) { // If not logged in
    res.render("error", { error: "Please login or register to view/edit your TinyURLs" });
  } else {
    let filteredURLS = urlsForUser(user_id, urlDatabase);
    const userObject = getUserObject(user_id, userDatabase);
    const templateVars = {
      filteredURLS,
      userObject,  // Allowing access to the cookie status in the header template.
      dateCreated: new Date().toLocaleDateString() // Stretch project.
    };
    res.render("urls_index", templateVars);
  }
});


//New TinyURL submission-----------------------------------------------------------------------------------------
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const loginStatus = isLoggedIn(user_id); // Checking login status, as detailed in notes above.
  if (!loginStatus) {
    res.redirect("/login");
  } else {
    res.render("urls_new", {userObject : getUserObject(user_id, userDatabase)});
  }
});


//Edit/show each TinyURL------------------------------------------------------------------------------------------------------
app.get("/urls/:tinyURL", (req, res) => {
  // TinyURL individual page detailing the longURL, date created and a form to edit/update longURL.
  const tinyURLRequested = req.params.tinyURL;
  const user_id = req.session.user_id;
  const loginStatus = isLoggedIn(user_id);
  let filteredURLS = urlsForUser(user_id, urlDatabase); // Filtering the database to only display TinyURLs owned by the user.
  if (!urlDatabase[tinyURLRequested]) {
    res.render("error", { error: "That TinyURL does not exist in the TinyApp database." });
  } else if (!loginStatus) {
    res.render("error", { error: "Please login to show individual TinyURL pages." });
  } else if (!filteredURLS[tinyURLRequested]) {
    res.render("error", { error: "You dont have authorisation to view/edit this TinyURL." });
  } else {
    const userObject = getUserObject(user_id, userDatabase);
    const templateVars = {
      tinyURLRequested,
      userObject,
      longURL: filteredURLS[tinyURLRequested].longURL,
      dateCreated: new Date().toLocaleDateString()
    };
    res.render("urls_show", templateVars);
  }
});

//Redirect to longURL------------------------------------------------------------------------------------------------------
app.get("/u/:tinyURL", (req, res) => {
  // Access/redirection always allowed whether signed in or not
  const tinyURLRequested = req.params.tinyURL;
  if (urlDatabase[tinyURLRequested]) { // If the tinyURL exists in our database.
    const redirLongURL = urlDatabase[tinyURLRequested].longURL; // Accessing the longURL from the database for redirection below.
    res.redirect(redirLongURL);
  } else {
    res.render("error", { error: "That TinyURL doesnt exist in the TinyApp database." });
  }
});



//POST (URL)

//POST New URL-----------------------------------------------------------------------------------------------------------------
app.post("/urls", (req, res) => {
  // POST request for when user enters longURL in /urls/new.
  const user_id = req.session.user_id;
  const loginStatus = isLoggedIn(user_id);
  if (!loginStatus) {
    res.redirect("error", { error: "Please login or register to create new TinyURLs." }); // If logged out and accessing path via curl, then redirect. Safety issue.
  } else {
    const tinyURL = randomString(); // TinyURL generator for each submission.
    const longURL = `http://${req.body.longURL}`; // Making the format readable by the browser when redirecting.
    urlDatabase[tinyURL] = { longURL, userID: user_id }; // Adding the new longURL and TinyURL to the database.
    res.redirect(`/urls/${tinyURL}`); // Redirect to the edit/show page.
  }
});


//POST for editing longURL-----------------------------------------------------------------------------------------------------------------------------
app.put('/urls/:tinyURL', (req, res) => {
  // POST handler for when the edit button is clicked in urls_show. It takes the longURL submitted and updates the database.
  const editedURL = `http://${req.body.longURL}`;
  const tinyURL = req.params.tinyURL;
  urlDatabase[tinyURL].longURL = editedURL; // Updating the database with the new submission.
  res.redirect('/urls');
});



//Delete----------------------------------------------------------------------------------------------------------------------------------------
app.delete('/urls/:tinyURL', (req, res) => {
  // The POST handler for when the delete button is clicked in the homepage.
  // There is no GET method for Delete. Trying to access the path in browser will not work.
  // Method Override Stretch project changes the path above and method to Delete.
  const loginStatus = isLoggedIn(req.session.user_id);
  const tinyURLRequested = req.params.tinyURL;
  let filteredURLS = urlsForUser(req.session.user_id, urlDatabase);
  if (!urlDatabase[tinyURLRequested]) {
    res.render("error", { error: "That TinyURL does not exist in the TinyApp database." });
  } else if (!loginStatus) {
    res.render("error", { error: "Please login to delete this TinyURL." });
  } else if (!filteredURLS[tinyURLRequested]) {
    res.render("error", { error: "You do not have authorisation to delete this TinyURL." });
  }
  delete urlDatabase[tinyURLRequested]; // "Delete" keyword to remove tinyURL from the database.
  res.redirect('/urls');
});


//GET (USER)

//GET Login---------------------------------------------------------------------------------------------------------
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const loginStatus = isLoggedIn(user_id);
  if (loginStatus) {
    res.redirect("/urls");
  } else {
    res.render("login", {userObject : getUserObject(user_id, userDatabase)});
  }
});


//Get Register-------------------------------------------------------------------------------------------------------------------------------
app.get("/register", (req, res) => {
  // Rendering for /register page where users submit their email and password to create a new user.
  const user_id = req.session.user_id;
  const loginStatus = isLoggedIn(user_id);
  if (loginStatus) {
    res.redirect("/urls");
  } else {
    res.render("register", {userObject : getUserObject(user_id, userDatabase)});
  }
});

//POST (USER)

//Post Login-----------------------------------------------------------------------------------------------------------------------------------
app.post("/login", (req, res) => {
  // Check values entered into email and password fields against the userDatabase and returns error messages as appropriate.
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  if (loginPassword === "" || loginEmail === "") { // First checks whether am email or password is entered
    res.render("error", { error: "Cannot login with empty email and password fields." });
  }
  const userObjectLogin = getUserByEmail(loginEmail, userDatabase); // Function that takes in an email provided and accesses the userDatabase to return an object with userID, email and encrypted password.
  if (!userObjectLogin) { // If the user object does not exist in the database
    res.render("error", { error: "TinyApp does not recognise that email on the database. Please register and try again." });
  } else { // If the user does exist, then check the password
    const doPasswordsMatchDatabase = bcrypt.compareSync(loginPassword, userObjectLogin.password); // compareSync returns Boolean value when comparing unencrypted and encrypted values.
    if (doPasswordsMatchDatabase) {
      req.session.user_id = (userObjectLogin.id); // Setting the session cookie to equal the unique userID created upon registration.
      res.redirect('/urls');
    } else {
      res.render("error", { error: "That password doesnt match the database for the email provided." });
    }
  }
});

//POST Register------------------------------------------------------------------------------------------------------------
app.post("/register", (req, res) => {
  // Creates new entries to the userDatabase and encrypts passwords.
  const id = randomString(); // Using the same TinyURL helper function.
  const registerEmail = req.body.email;
  const registerPassword = req.body.password;
  const hashedRegisterPassword = bcrypt.hashSync(registerPassword, 10); // Encrypting the password provided.
  const registerUserObject = getUserByEmail(registerEmail, userDatabase); // Checking to see if the user already exists in the database
  if (registerUserObject === null && (registerPassword !== "" || registerEmail !== "")) { // If the user isnt already in the database and on the condition that the fields arent empty.
    userDatabase[id] = { id, email: registerEmail, password: hashedRegisterPassword }; // Add the user to the database.
    req.session.user_id = id; // Setting the session cookie value equal to the random unique userID just created.
    res.redirect('/urls');
  } else {
    res.render("error", { error: "400 Bad Request" });
  }
});


//Logout---------------------------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/logout", (req, res) => {
  // Button appears when cookie value is truthy.
  req.session = null; // Upon clicking logout, the cookie session is cleared
  res.redirect("/login"); // Redirected to homepage, now condition is falsey so login/register options appear.
});



//------------------------------------------------------------------------------------------------------------------
//ERROR HANDLING

app.get("/*", (req, res) => {
  //At the bottom so every other route gets filtered through before triggering this render.
  res.render("error", { error: "404 Page Not Found" }); //
});


//--------------------------------------------------------------------------------------------------------------------------
//LISTEN
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}!`);
});
