    const jwt = require("jsonwebtoken");
    require("dotenv").config();

const auth = (req, res, next) => {
    // Prefer cookie token; fallback to Authorization: Bearer <token>
    const bearer = req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const token = req.cookies.accesstoken || bearer;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, process.env.SECRET || process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        req.user_id = decoded.id;
        req.user_role = decoded.role;
        next();
    });
};

    module.exports = { auth };
