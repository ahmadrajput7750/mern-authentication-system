import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in 111.",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.id) {
      req.userId = decodedToken.id; // <-- Change req.body.userId to req.userId
    } else {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please log in 222.",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please log in again 333.",
    });
  }
};

export default userAuth;
