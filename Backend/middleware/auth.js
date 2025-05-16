    const jwt = require("jsonwebtoken");
    require("dotenv").config();

    const auth = (req, res, next) => {
    const token = req.cookies.accesstoken;
    // console.log(accesstoken,"12345678999")
    if (!token) {
        return res.status(401).json({ message: "Token not found" });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
        }

        req.user_id = decoded.id;
        req.user_role = decoded.role;
        next();
    });
    };

    module.exports = { auth };
