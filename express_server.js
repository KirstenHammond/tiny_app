
//Using Express to create a server on port 8080

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

//console.log(randomString());

app.set("view engine", "ejs"); //setting the EJS view engine to recognise the views folder
app.use(express.urlencoded({ extended: true })); //converting the server response body from buffer to encoded readable language


const urlDatabase = { //presumably this will be refactored from a database and not hard coded
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "5we8aY": "http://www.guardian.co.uk"
};

app.get("/urls", (req, res) => { //main table housing historical conversions when signed in
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {// creating a new submission. It has a linked POST request.
  res.render("urls_new");
});


app.post("/urls", (req, res) => { //POST request for when user submits long url. 
  const id = randomString();//short url generator for each post
  const newEntry = `http://${req.body.longURL}`;//making the format readable when redirecting
  urlDatabase[id] = newEntry; //adding the new short url and provided long url to database
  res.redirect(`/urls/${id}`);// eg urls_show = redirect to a page displaying long url and shortened URL as a hyperlink (see below)
})

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];//getting the longURL from the post above as it has been saved to the database
    //console.log(longURL); testing
    return res.redirect(longURL);//when u/shortURL is visited, it redirects to the long URL
});

app.get("/urls/:id", (req, res) => { //URL specific page detailing the long and short URL and rendering urls_show
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});
//console.log(urlDatabase);//logs to server not client side

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}!`);
});