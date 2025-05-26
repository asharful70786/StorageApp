import express from "express";
import checkAuth, {  roleBaseAccessMiddleware } from "../middlewares/authMiddleware.js";
import {
  deleteUserByAdmin,
  getAllUsers,
  getCurrentUser,
  login,
  logout,
  logoutAll,
  register,
  roleBaseActionPerform,
} from "../controllers/userController.js";


const router = express.Router();

router.post("/user/register", register);

router.post("/user/login", login);

router.get("/user/", checkAuth, getCurrentUser);


router.post("/user/logout", logout);
router.post("/user/logout-all", checkAuth, logoutAll);

router.get("/users", checkAuth,roleBaseAccessMiddleware, getAllUsers);

router.post("/user/role-base-action", checkAuth, roleBaseAccessMiddleware, roleBaseActionPerform);
router.post("/user/delete-users", checkAuth, roleBaseAccessMiddleware ,  deleteUserByAdmin);

export default router;
