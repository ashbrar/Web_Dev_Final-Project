const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
    try {
        // 1. Get the token from the header
        const jwtToken = req.header("token");

        if (!jwtToken) {
            return res.status(403).json("Not Authorized");
        }

        // 2. Verify the token
        const payload = jwt.verify(jwtToken, process.env.JWT_SECRET);

        // 3. Add user ID to the request so we can use it later
        req.user = payload;
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(403).json("Not Authorized");
    }
};