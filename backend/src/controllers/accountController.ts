import { Request, Response } from "express";
import { db } from "../db";

interface Account {
  id: string;
  name: string;
  balance: number;
  pin: string;
}

interface Transaction {
  id: string;
  account_id: string;
  type: "withdraw" | "deposit";
  amount: number;
  date: Date;
}

export const login = async (req: Request, res: Response) => {
  const { accountId, pin } = req.body;

  if (!accountId || !pin) {
    return res.status(400).json({ message: "Account ID and PIN are required" });
  }

  try {
    const result = await db.query("SELECT * FROM accounts WHERE id = $1", [
      accountId,
    ]);

    const account = result.rows[0];

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.pin !== pin) {
      return res.status(401).json({ message: "Invalid PIN" });
    }

    const { pin: _, ...accountWithoutPin } = account;

    return res.json(accountWithoutPin);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const newPin = async (req: Request, res: Response) => {
  const { accountId, pin, newPin } = req.body;

  if (!accountId || !pin || !newPin) {
    return res
      .status(400)
      .json({ message: "Account ID, PIN and new PIN are required" });
  }

  if (!pin !== newPin) {
    return res
      .status(400)
      .json({ message: "Account ID, PIN and new PIN are required" });
  }

  try {
    await db.query("BEGIN");
    const result = await db.query("SELECT * FROM accounts WHERE id = $1", [
      accountId,
    ]);

    const account = result.rows[0];

    if (!account) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.pin !== pin) {
      await db.query("ROLLBACK");
      return res.status(401).json({ message: "Invalid PIN" });
    }

    await db.query("UPDATE accounts SET pin = $1 WHERE id = $2", [
      newPin,
      accountId,
    ]);

    await db.query("COMMIT");

    const { pin: _, ...accountWithoutPin } = account;

    return res.json(accountWithoutPin);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Change PIN error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  const { accountId, amount, type } = req.body;

  if (!accountId || !amount || !type) {
    return res.status(400).json({ message: "Amount required" });
  }

  if (type !== "withdraw" && type !== "deposit") {
    return res
      .status(400)
      .json({ message: "Type must be withdraw or deposit" });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  try {
    await db.query("BEGIN");

    const accountResult = await db.query(
      "SELECT * FROM accounts WHERE id = $1 FOR UPDATE",
      [accountId]
    );

    const account: Account = accountResult.rows[0];

    if (!account) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Account not found" });
    }

    let newBalance: number;

    if (type === "withdraw") {
      if (account.balance < amount) {
        await db.query("ROLLBACK");
        return res.status(400).json({ message: "Insufficient funds" });
      }
      newBalance =
        (account.balance * 100 - Math.round(parseFloat(amount) * 100)) / 100;
    } else {
      newBalance =
        (account.balance * 100 + Math.round(parseFloat(amount) * 100)) / 100;
    }

    await db.query("UPDATE accounts SET balance = $1 WHERE id = $2", [
      newBalance,
      accountId,
    ]);

    const transactionResult = await db.query(
      "INSERT INTO transactions (account_id, type, amount) VALUES ($1, $2, $3) RETURNING *",
      [accountId, type, amount]
    );

    await db.query("COMMIT");

    const updatedAccountResult = await db.query(
      "SELECT id, name, balance, card_type FROM accounts WHERE id = $1",
      [accountId]
    );

    return res.json({
      transaction: transactionResult.rows[0],
      account: updatedAccountResult.rows[0],
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Transaction error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
