const User = require('../models/user');

exports.validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/);
};

exports.validateLength = (text, min, max) => {
  if (text.length > max || text.length < min) {
    return false;
  }
  return true;
};

exports.validateUsername = async (username) => {
  let continueCheck = false;

  do {
    let isTakenUsername = await User.findOne({ username });
    if (isTakenUsername) {
      // change username
      username += (+new Date() * Math.random()).toString().substring(0, 2);
      continueCheck = true;
    } else {
      continueCheck = false;
    }
  } while (continueCheck);

  return username;
};
