import { Typography } from "@mui/material";
import React from "react";

import styles from "./Logo.module.css";


const Logo = () => {
  return (
    <div>
      <img className={styles.img} src="media/logo.png" alt="Hub Logo" />
    </div>
  );
};

export default Logo;
