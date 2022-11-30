
//Using Express to create a server on port 8080

const express = require("express");
const cookieParser = require('cookie-parser'); //installed npm install cookie-parser
const app = express();
app.use(cookieParser());//calling the cookie parser function within express()
const PORT = 8080; // default port 8080

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

//console.log(randomString());//testing

app.set("view engine", "ejs"); //setting the EJS view engine to recognise the views folder
app.use(express.urlencoded({ extended: true })); //MIDDLEWARE converting the server response body from buffer to encoded readable language
app.use((req, res, next) => { //MIDDLEWARE
  console.log(`reqmethod= ${req.method}  requrl= ${req.url}`); //for every request, do this
  next(); //starts a chain of callbacks thatll run with every request
})



const urlDatabase = { //presumably this will be refactored from a database and not hard coded
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "5we8aY": "http://www.guardian.co.uk"
};

app.get("/urls", (req, res) => { //main table housing historical conversions when signed in
  //console.log(urlDatabase);//logs to server not client side so we can track movements on database
  //console.log("req.cookies[username]", req.cookies["username"]);///testing
  const templateVars = { 
    urls: urlDatabase,
    username : req.cookies["username"],  //adding access to the cookie username in the header template
    dateCreated: new Date().toLocaleDateString()///stretch project
  };
  res.render("urls_index", templateVars);
})

app.post("/urls", (req, res) => { //POST request for when user submits long url from /urls/new. 
  const id = randomString();//short url generator for each post
  const newEntry = `http://${req.body.longURL}`;//making the format readable when redirecting
  urlDatabase[id] = newEntry; //adding the new short url and provided long url to database
  res.redirect(`/urls/${id}`);// eg urls_show = redirect to a page displaying long url and shortened URL as a hyperlink (see below)
})

app.post("/login", (req, res) => { //event handler for clicking login button with submitted username
  //console.log("req.body=", req.body.username); //testing. the string that was passed in
  res.cookie("username", `${req.body.username}`, {encode: String}); //setting a cookie named username to the value of the encoded string passed in
  res.redirect("/urls"); //redirecting to the home page. Header has conditional to check if a username cookie is truthy
})

app.post("/logout", (req, res) => {//when username cookie is truthy, a form appears notifying the user of their username and providing an option to sign out
  //console.log("logout", req.cookies.username);//checking
  res.clearCookie("username");//upon clicking logout, the cookie called username is cleared
  res.redirect("/urls");//redirected to home page, now condition is falsey so login option appears
});


app.get("/urls/new", (req, res) => {// creating a new submission. It has a linked POST request.
  const templateVars = {
    username: req.cookies.username //adding access to the cookie username in the header template
  }
  res.render("urls_new", templateVars);
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];//getting the longURL from the post above as it has been saved to the database
  //console.log(longURL); testing
  if (urlDatabase.hasOwnProperty(id)) {//checking if id is truthy in urlDatabase.
  return res.redirect(longURL);//when u/shortURL is visited, it redirects to the long URL
  }
  else {
    res.render('404');
  }
});

app.get("/urls/:id", (req, res) => { //URL specific page detailing the long and short URL and rendering urls_show
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username, //adding access to the cookie username in the header template
    dateCreated: new Date().toLocaleDateString()///stretch projet
  };
  if(urlDatabase.hasOwnProperty(templateVars.id)) { //cheking that the id that has been requested exists in the database
  res.render("urls_show", templateVars); //if it does then proceed with rendering urls/show
  }
  else {
    res.render('404');
  }
});

app.post('/urls/:id/delete', (req, res) => { //the POST handler for when the delete button is clicked next to the long URL in /urls
  const id = req.params.id;
  delete urlDatabase[id]; //delete keyword to remove item from database, accessed by the key
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {//POST handler for when the edit button is clicked in urls_show. It takes the longURL submitted and updated the database
  //console.log(req.body);//testing
  const editedURL = `http://${req.body.longURL}`;
  const id = req.params.id;
  urlDatabase[id] = editedURL;
  res.redirect('/urls');
});

//At the bottom so every other route gets filtered through before triggering this render
app.get("/*", (req, res) => {
  res.render('404'); // // where 404 is a file path with ejs view.Currently only working on /
});


app.listen(PORT, () => {
  console.log(`Server running on ${PORT}!`);
});
