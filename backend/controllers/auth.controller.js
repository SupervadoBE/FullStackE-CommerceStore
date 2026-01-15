import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross-site scripting attack
    maxAge: 15 * 60 * 1000, // 15 minute (Access Token expire time)
    SameSite: "strict", // prevents CSRF attack, cross-site request forgery
    secure: isProduction,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross-site scripting attack
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7day (Access Token expire time)
    SameSite: "strict", // prevents CSRF attack, cross-site request forgery
    secure: isProduction,
  });
};

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await User.findOne({ email }).exec();

    if (userExists) {
      console.log("User aready exists");
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    // authenticate
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // Güvenlik için hashlenmiş parolayı asla geri döndürme
        // timestamps ve role gibi diğer alanları da istersen ekleyebilirsin
      },
    });
  } catch (error) {
    console.log("Error in signup controller: ", error.message);
    return res.status(500).json({ message: "Internal server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    const isMatch = await user.comparePassword(password);

    if (user && isMatch) {
      const { accessToken, refreshToken } = generateTokens(user._id);

      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "An internal server error occurred." });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// this will referesh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // prevent XSS attacks, cross-site scripting attack
      maxAge: 15 * 60 * 1000, // 15 minute (Access Token expire time)
      SameSite: "strict", // prevents CSRF attack, cross-site request forgery
      secure: process.env.NODE_ENV === "production",
    });

    res.json({ message: "Token refresh successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in getProfile controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
