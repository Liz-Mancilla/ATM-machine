import React from "react";
import { Container } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import ATM from "./components/ATM";

const App = () => {
  return (
    <Container style={{ height: "100%" }}>
      <ATM />
    </Container>
  );
};

export default App;
