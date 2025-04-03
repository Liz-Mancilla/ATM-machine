import axios from "axios";
import React, { useState, useEffect } from "react";
import { Button, Form, Input } from "semantic-ui-react";

import "./ATM.css"; // Custom styles for ATM-like UI

interface Account {
  id: string;
  balance: number;
  name: string;
}

const ATM = () => {
  const [state, setState] = useState<
    "login" | "mainMenu" | "withdraw" | "deposit" | null
  >(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [pin, setPin] = useState<string>(undefined);
  const [amount, setAmount] = useState<number>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [content, setContent] = useState<React.ReactNode>();
  const [actionLabels, setActionLabels] = useState<React.ReactNode>();
  const [isBalanceShowed, showBalance] = useState<boolean>();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      if (!accountId || !pin) {
        setError("All fields are required");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/login`,
        {
          accountId,
          pin,
        }
      );
      setAccount(response.data);

      setLoading(false);
      setAccountId(accountId);
      setPin(undefined);
      setState("mainMenu");
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    setAccountId(null);
    setAccount(null);
    setPin(undefined);
    setError(null);
    setSuccess(null);
    setState(null);
  };

  useEffect(() => {
    setError(null);
    setSuccess(null);

    if (!state) {
      setContent(
        <p className="content" style={{ fontSize: "24px" }}>
          Welcome to the ATM
        </p>
      );
      setActionLabels(
        <p style={{ display: "flex", justifyContent: "end", width: "100%" }}>
          Enter PIN-
        </p>
      );
    } else if (state === "login") {
      setContent(
        <>
          <div className="content">
            <p style={{ fontSize: "20px" }}>
              Enter your account id and your PIN
            </p>
            <p>
              Account Id:
              <Input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              />
            </p>
            <p>
              PIN:
              <Input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </p>
          </div>
        </>
      );
      setActionLabels(
        <div className="actions">
          <div>
            <p>-Exit</p>
            <p>Enter—</p>
          </div>
        </div>
      );
    } else if (["mainMenu"].includes(state) && !!account) {
      setContent(
        <p style={{ fontSize: "14px", marginTop: "10px" }} className="content">
          {isBalanceShowed
            ? `${account.name} your current balance is: ${account.balance}`
            : `Welcome ${account.name}! Please make a choice...`}
        </p>
      );
      setActionLabels(
        <div className="actions">
          <p style={{ alignSelf: "end" }}>Exit-</p>
          <div>
            <p>-Withdraw</p>
            <p>Balance-</p>
          </div>
          <div>
            <p>-Deposit</p>
            <p>Re-Enter PIN—</p>
          </div>
        </div>
      );
    } else if (["withdraw", "deposit"].includes(state)) {
      setContent(
        <div className="content">
          <p>Current balance is: {account.balance}</p>
          <p>
            Amount to {state}:
            <Form.Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              required
            />
          </p>
        </div>
      );
      setActionLabels(
        <div className="actions">
          <div>
            <p>-Go to main menu</p>
            <p>{state}—</p>
          </div>
        </div>
      );
    }
  }, [account, accountId, amount, isBalanceShowed, pin, state]);

  const handleTransaction = async (type: "withdraw" | "deposit") => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!amount || amount <= 0) {
        setError("Please enter a valid amount");
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transactions`,
        {
          accountId,
          amount: amount,
          type,
        }
      );

      setAccount(response.data.account);
      setSuccess(
        `Successfully ${
          type === "withdraw" ? "withdrew" : "deposited"
        } $${amount}`
      );
      setAmount(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Transaction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="atm-container">
      <div className="atm-header-container">
        <img
          src={require("../assets/atm_sign.png")}
          alt="ATM Machine"
          className="atm-header"
        />
        <img
          src={require("../assets/graffiti.png")}
          alt="graffiti"
          className="graffiti-image"
        />
      </div>
      <img
        src={require("../assets/creditcard_sprite.png")}
        alt="credit cards"
        className="credit-cards-image"
      />
      <div className="screen-container">
        <div className="column-buttons">
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => {
              if (state === "mainMenu") {
                setState("withdraw");
                showBalance(true);
              }
            }}
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => {
              if (state === "login") handleLogout();
              if (state === "mainMenu") {
                setState("deposit");
                showBalance(true);
              }
              if (["withdraw", "deposit"].includes(state)) setState("mainMenu");
            }}
          />
        </div>
        <div className="atm-screen">
          <div className="atm-content">
            {content}
            <p style={{ textAlign: "center", color: "red" }}>{error}</p>
            <p style={{ textAlign: "center", color: "green" }}>{success}</p>
            {actionLabels}
          </div>
          <img
            src={require("../assets/systems.png")}
            alt="systems"
            className="systems-image"
          />
        </div>
        <div className="column-buttons">
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => {
              if (state === "mainMenu") handleLogout();
            }}
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => {
              if (state === "mainMenu") showBalance(true);
            }}
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => {
              if (!state) setState("login");
              else if (state === "login") handleLogin();
              else if (state === "withdraw") handleTransaction("withdraw");
              else if (state === "deposit") handleTransaction("deposit");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ATM;
