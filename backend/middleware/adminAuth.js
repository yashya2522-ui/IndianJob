const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Admin login required."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Admin access only"
            });
        }

        req.admin = decoded;
        next();

    } catch (err) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
};