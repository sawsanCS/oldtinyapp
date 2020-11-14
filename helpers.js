const getUserByEmail = (usersdb, email) => {
  for (let user in usersdb) {
    if (usersdb[user].email === email) {
      return user;
    }
  }
};
module.exports = getUserByEmail;