// Module for helper functions- imported into express_server.js.
// All functions global and not dependent on static databases.

// Takes in an email and a database and returns an object eg {id: "gdg4B3", email : k@k.com, password: [encrypted]}.
const getUserByEmail = (emailProvided, database) => {
  for (let existingID in database) {
    if (database[existingID].email === emailProvided) {
      return database[existingID]; // Returns the object as soon as it finds it in the loop.
    }
  }
  return null;
};


// Returns userObject when given user_id and userDatabase
const getUserObject = (userID, database) => {
  for (let existingID in database) {
    if (existingID === userID) {
      return database[existingID];
    }
  }
};



// Function to create unique TinyURL and user ID.
const randomString = () => {
  let result = "";
  const options = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  options.split(',').map(function () {
    for (let i = 0; i < 6; i++) { // Setting loop to stop at 6 iterations, ie 6 characters long.
      result += options.charAt(Math.floor(Math.random() * options.length)); // Using Math.random to select a random number and then add that corresponding character to the string.
    }
  });
  return result;
};


// For determing logged in status.
const isLoggedIn = cookie => {
  return cookie ? true : false;
};


// Takes in a userID and database and returns an object of objects containing URLS owned by that user.
const urlsForUser = (user_id, database) => {
  let filteredURLS = {};
  for (let tinyURL in database) {
    if (database[tinyURL].userID === user_id) {
      filteredURLS[tinyURL] = database[tinyURL]; // Populating an object of objects containing the users URL details
    }
  }
  return filteredURLS;
};

/*
Stretch Project for session views, unfinished
const count = () => {
  req.session.views = (req.session.views || 0) + 1;
  let visits= res.end(req.session.views);
  console.log("visits", visits);
}
 */

module.exports = { getUserByEmail, getUserObject, randomString, isLoggedIn, urlsForUser };