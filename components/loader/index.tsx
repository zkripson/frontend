"use client";
import React from "react";
import "./index.css";

const KPBattleshipLoader = () => {
  return (
    <div className="radar-loader">
      <div className="sweep" />
      <div className="pulse" />
      <div className="rings">
        <div className="radar-ring radar-ring-1" />
        <div className="radar-ring radar-ring-2" />
        <div className="radar-ring radar-ring-3" />
      </div>
      <div className="blips">
        <div className="blip" style={{ top: "20%", left: "60%" }} />
        <div className="blip" style={{ top: "70%", left: "40%" }} />
        <div className="blip" style={{ top: "35%", left: "25%" }} />
      </div>
    </div>
  );
};

export default KPBattleshipLoader;
