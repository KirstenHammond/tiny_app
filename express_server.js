
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
app.use(express.urlencoded({ extended: true})); //converting the server response body from buffer to encoded readable language

app.post("/urls", (req,res) => { //not sure where this needs to be in the order of routes
  console.log(req.body);
  res.send("ok");
})
const urlDatabase = { //presumably this will be refactored and not hard coded
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "5we8aY": "http://www.guardian.co.uk"
};

app.get("/urls", (req, res) => { //main table housing historical conversions when signed in
  const templateVars = {urls : urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {// creating a new submission. It has a linked POST request above.
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { //URL specific page detailing the long and short URL
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});