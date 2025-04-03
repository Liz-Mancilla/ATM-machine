import express from "express";
import {
  login,
  createTransaction,
  newPin,
} from "../controllers/accountController";

const router = express.Router();

router.post("/login", login);
router.post("/transactions", createTransaction);
router.post("/newPin", newPin);

export default router;
