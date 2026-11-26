import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AnimationStudio from "./animation/AnimationStudio";
import "./styles.css";

const isAnimationStudio = window.location.pathname.replace(/\\/+$/, "") === "/animation";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isAnimationStudio ? <AnimationStudio /> : <App />}
  </React.StrictMode>,
);
