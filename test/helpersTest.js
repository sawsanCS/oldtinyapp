const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return an object user that has a certain email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = {id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"};
    // Write your assert statement here
  });

  it('should return null when we dont find the user with a certain email', function() {
    const user = getUserByEmail("usher@example.com", testUsers)
    const expectedOutput = null;
    assert.equal(user, expectedOutput)
  });
});