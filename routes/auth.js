import express from "express";
import {register, login, logout, changeAvatar, deleteAvatar} from "../controllers/auth.js";

const router = express.Router();
import {upload} from "../Middleware/upload.js";
import {verifyToken} from "../utils/validate.js";

router.post("/register",upload.single('img') ,register);
router.put("/change-avatar/:userId",upload.single('img'),verifyToken,changeAvatar)
router.post("/login", login);
router.post("/logout",verifyToken,logout);
router.delete("/delete-avatar/:userId",verifyToken,deleteAvatar);

export default router;