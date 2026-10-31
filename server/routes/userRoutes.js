import express from "express";
import { WrapAsync } from "../utils/WrapAsync.js";
import userAuth from "../middleware/userAuth.js";
import { getUserData, deleteUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/get-user-data", userAuth, WrapAsync(getUserData));
userRouter.delete("/delete-user", userAuth, WrapAsync(deleteUser));

export default userRouter;
