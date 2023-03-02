import { Divider, Link, Typography } from "@mui/material";
import React from "react";

import styles from "./Support.module.css";


const SECTIONS = [
  {
    description: "Internal network page to raise support tickets of any topic.",
    name: "ETC Helpdesk",
    icon: "external.png",
    url: "http://helpdesk.etc.com/"
  },
  {
    description: "Engineering support",
    name: "#support-eng",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C02563EEUDV",
    url: "https://etcvfx.slack.com/archives/C02563EEUDV"
  },
  {
    description: "Volt support",
    name: "#support-volt",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C024TPB1HV5",
    url: "https://etcvfx.slack.com/archives/C024TPB1HV5"
  },
  {
    description: "Rendering support",
    name: "#support-rendering",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C025HQMEGLD",
    url: "https://etcvfx.slack.com/archives/C025HQMEGLD"
  },
  {
    description: "Licenses support",
    name: "#support-licenses",
    icon: "apps/slack.png",
    slack_url: "slack://channel?team=TUHQE0DPH&id=C02H6354ULW",
    url: "https://etcvfx.slack.com/archives/C02H6354ULW"
  },
];

const Support = () => {

  const getSections = () => {
    const amount = SECTIONS.length;
    return SECTIONS.map((section, index) => {
      return (
        <div key={index}
          className={styles.sectionContainer}
          onClick={() => window.services.open_url(section.slack_url || section.url)}
        >
          <div className={styles.text}>
            <Typography color="lightskyblue" variant="h6">{section.name}</Typography>
            <Typography color="lightgrey" variant="subtitle1">
              {section.description}
            </Typography>
          </div>
          <img
            alt="link icon"
            src={`media/${section.icon}`}
            className={styles.icon}
          />
        </div>
      );
    });
  };

  return (
    <div className={styles.container}>
      {getSections()}
    </div>
  );
};

export default Support;
