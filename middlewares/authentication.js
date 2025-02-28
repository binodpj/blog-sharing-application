const { validatetoken } = require("../services/authentication");

const checkForAuthenticationCookie = (cookieName) => {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayLoad = validatetoken(tokenCookieValue);
      req.user = userPayLoad;
    } catch (error) {}
    return next();
  };
};

module.exports = checkForAuthenticationCookie;
