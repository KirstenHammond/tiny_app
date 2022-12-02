//Module holding URL database and USER database

const bcrypt = require("bcryptjs"); //password encryption

//URL Database
const urlDatabase = {
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
};

//User Database
const userDatabase = {
  "12345": {
    id: "12345",
    email: "m@m.com",
    password: bcrypt.hashSync("123", 10)
  },
  "67890": {
    id: "67890",
    email: "k@k.com",
    password: bcrypt.hashSync("123", 10)
  },
  abcd: {
    id: "abcd",
    email: "n@n.com",
    password: bcrypt.hashSync("567", 10)
  }
};

module.exports = {urlDatabase, userDatabase};