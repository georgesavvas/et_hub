import LogoImg from "../assets/logo.png";
import React from "react";
import styles from "./Logo.module.css";

const Logo = () => {
  return (
    <div>
      <img className={styles.img} src={LogoImg} alt="Hub Logo" />
    </div>
  );
};

export default Logo;
