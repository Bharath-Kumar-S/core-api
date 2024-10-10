import  jwt  from 'jsonwebtoken';
import express, { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import verifyToken from "../middleware/auth.middleware";

const router = express.Router();

router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Invalid Credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password as string);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid Credentials" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET_KEY as string,
        {
          expiresIn: "1d", // 1 day expiration time
        }
      );

      return res
        .cookie("auth_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000, // 1 day expiration time in milliseconds
        })
        .status(200)
        .json({ userId: user._id });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).json({ userId: req.userId });
});

router.post("/logout", (req: Request, res: Response) => {
  res
    .cookie("auth_token", "", { expires: new Date(0) })
    .status(200)
    .json({ message: "Logged out" });
});

export const authRouter = router;
