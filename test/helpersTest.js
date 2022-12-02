//Mocha Chai testing for helperFunctions.js

const { assert } = require('chai');

const { getUserByEmail } = require('../helperFunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user object when provided a valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null if passed in an email that does not exist in the database', function () {
    const user = getUserByEmail("k@k.com", testUsers)
    const expectedFailure = null;
    assert.strictEqual(user, null);
  });
});