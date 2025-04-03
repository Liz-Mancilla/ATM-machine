import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, Input } from "semantic-ui-react";

import "./ATM.css";

interface Account {
  id: string;
  balance: number;
  name: string;
  card_type: string;
}

type ATMstate =
  | "welcome"
  | "login"
  | "mainMenu"
  | "withdraw"
  | "deposit"
  | "newPIN";
type TransactionType = "withdraw" | "deposit";
type ButtonType = "left3" | "left4" | "right2" | "right3" | "right4";

interface ATMdata {
  state: ATMstate;
  accountId: string;
  account: Account | null;
  pin: string;
  amount: number;
  isBalanceShowed: boolean;
}

const initialState: ATMdata = {
  state: "welcome",
  accountId: "",
  account: null,
  pin: "",
  amount: 0,
  isBalanceShowed: false,
};

const ATM = () => {
  const [atmData, setATMdata] = useState<ATMdata>(initialState);
  const [content, setContent] = useState<React.ReactNode>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>();
  const [newPin, setNewPin] = useState<string>();
  const [newPinConfirm, setNewPinConfirm] = useState<string>();

  const brandPositions = {
    star: {
      position: "0 0",
      left: "0",
      width: "75px",
    },
    pulsa: {
      position: "-80px 0",
      left: "80px",
      width: "85px",
    },
    maestro: {
      position: "-170px 0",
      left: "170px",
      width: "85px",
    },
    mastercard: {
      position: "-250px 0",
      left: "250px",
      width: "85px",
    },
    plus: {
      position: "-330px 0",
      left: "330px",
      width: "85px",
    },
    visa: {
      position: "-410px 0",
      left: "410px",
      width: "70px",
    },
  };

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async () => {
    resetMessages();
    setLoading(true);
    const { accountId, pin } = atmData;
    if (!accountId || !pin) {
      setError("All fields are required");
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/login`,
        {
          accountId,
          pin,
        }
      );

      setATMdata({
        ...atmData,
        account: response.data,
        pin: "",
        state: "mainMenu",
      });
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  const handleLogout = () => {
    resetMessages();
    setATMdata({
      ...atmData,
      account: null,
      accountId: "",
      pin: "",
      state: "welcome",
    });
  };

  const handleTransaction = async (type: TransactionType) => {
    resetMessages();
    const { accountId, amount } = atmData;
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
    }
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/transactions`,
        {
          accountId,
          amount,
          type,
        }
      );

      setSuccess(
        `Successfully ${
          type === "withdraw" ? "withdrew" : "deposited"
        } $${amount}`
      );
      setATMdata({
        ...atmData,
        account: response.data.account,
        amount: 0,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Transaction failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewPin = async () => {
    resetMessages();
    const { accountId, pin } = atmData;
    if (!pin || !newPin || !newPinConfirm) {
      setError("All fiels are required");
    }
    if (newPin !== newPinConfirm) {
      setError("New PIN should match new PIN confirmation");
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/newPin`, {
        accountId,
        pin,
        newPin,
      });

      setSuccess("Successfully PIN changed");
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (button: ButtonType) => {
    resetMessages();
    const { state } = atmData;

    switch (button) {
      case "left3":
        if (state === "mainMenu") {
          setATMdata({
            ...atmData,
            state: "withdraw",
            isBalanceShowed: true,
          });
        }
        break;
      case "left4":
        if (state === "login") handleLogout();
        else if (state === "mainMenu")
          setATMdata({
            ...atmData,
            state: "deposit",
            isBalanceShowed: true,
          });
        else if (["withdraw", "deposit", "newPIN"].includes(state)) {
          setATMdata({
            ...atmData,
            state: "mainMenu",
            amount: 0,
            pin: "",
            isBalanceShowed: false,
          });
          setNewPin("");
          setNewPinConfirm("");
        }
        break;
      case "right2":
        if (state === "mainMenu") handleLogout();
        break;
      case "right3":
        if (state === "mainMenu")
          setATMdata({
            ...atmData,
            isBalanceShowed: true,
          });
        break;
      case "right4":
        if (state === "welcome")
          setATMdata({
            ...atmData,
            state: "login",
          });
        else if (state === "login") handleLogin();
        else if (state === "withdraw") handleTransaction("withdraw");
        else if (state === "deposit") handleTransaction("deposit");
        else if (state === "newPIN") handleNewPin();
        else if (state === "mainMenu")
          setATMdata({
            ...atmData,
            state: "newPIN",
          });
    }
  };

  useEffect(() => {
    const { account, accountId, amount, isBalanceShowed, pin, state } = atmData;
    let content: React.ReactNode;
    let actionLabels: React.ReactNode;

    switch (state) {
      case "welcome":
        content = (
          <p className="content" style={{ fontSize: "24px" }}>
            Welcome to the ATM
          </p>
        );
        actionLabels = (
          <p style={{ display: "flex", justifyContent: "end", width: "100%" }}>
            Enter PIN-
          </p>
        );
        break;
      case "login":
        content = (
          <>
            <div className="content">
              <p style={{ fontSize: "20px" }}>
                Enter your account id and your PIN
              </p>
              <div>
                Account Id:
                <Input
                  type="text"
                  value={accountId}
                  onChange={(e) =>
                    setATMdata({
                      ...atmData,
                      accountId: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                PIN:
                <Input
                  type="password"
                  value={pin}
                  onChange={(e) =>
                    setATMdata({
                      ...atmData,
                      pin: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </>
        );
        actionLabels = (
          <div className="actions">
            <div>
              <p>-Exit</p>
              <p>Enter—</p>
            </div>
          </div>
        );
        break;
      case "mainMenu":
        content = (
          <p
            style={{ fontSize: "14px", marginTop: "10px" }}
            className="content"
          >
            {isBalanceShowed
              ? `${account.name} your current balance is: ${account.balance}`
              : `Welcome ${account.name}! Please make a choice...`}
          </p>
        );
        actionLabels = (
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
        break;
      case "deposit":
      case "withdraw":
        content = (
          <div className="content">
            <p>Current balance is: {account.balance}</p>
            <div>
              Amount to {state}:
              <Form.Input
                type="number"
                value={amount}
                onChange={(e) =>
                  setATMdata({
                    ...atmData,
                    amount: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>
        );
        actionLabels = (
          <div className="actions">
            <div>
              <p>-Go to main menu</p>
              <p>{state}—</p>
            </div>
          </div>
        );
        break;
      case "newPIN":
        content = (
          <div className="content">
            <div>
              Old PIN:
              <Input
                type="password"
                value={pin}
                onChange={(e) =>
                  setATMdata({
                    ...atmData,
                    pin: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              New PIN:
              <Input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                required
              />
            </div>
            <div>
              Confirm new PIN:
              <Input
                type="password"
                value={newPinConfirm}
                onChange={(e) => setNewPinConfirm(e.target.value)}
                required
              />
            </div>
          </div>
        );
        actionLabels = (
          <div className="actions">
            <div>
              <p>-Go to main menu</p>
              <p>Confirm—</p>
            </div>
          </div>
        );
        break;
    }
    setContent(
      <>
        {content}
        <p style={{ textAlign: "center", color: "red" }}>{error}</p>
        <p style={{ textAlign: "center", color: "green" }}>{success}</p>
        {actionLabels}
      </>
    );
  }, [atmData, atmData.state, error, newPin, newPinConfirm, success]);

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

      <div className="sprite-container">
        <div className="sprite-gray" />
        {atmData.account?.card_type ? (
          <div
            style={{
              backgroundPosition:
                brandPositions[atmData.account.card_type].position,
              left: brandPositions[atmData.account.card_type].left,
              width: brandPositions[atmData.account.card_type].width,
            }}
            className="sprite-brand"
          />
        ) : null}
      </div>

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
            onClick={() => handleButtonClick("left3")}
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => handleButtonClick("left4")}
          />
        </div>
        <div className="atm-screen">
          <div className="atm-content">{content}</div>
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
            onClick={() => handleButtonClick("right2")}
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => handleButtonClick("right3")}
          />
          <Button
            disabled={loading}
            fluid
            className="atm-button"
            type="button"
            onClick={() => handleButtonClick("right4")}
          />
        </div>
      </div>
      <img
        src={require("../assets/sticker_graf.png")}
        alt="sticker"
        className="sticker"
      />
    </div>
  );
};

export default ATM;
