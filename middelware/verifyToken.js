const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided", type:'error' });
        }

        const token = authHeader.split(" ")[1];

        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);

        console.log(data)
        req.user = data;
        req.token = token;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token", type:'error' });
    }
};

module.exports = verifyToken;
