import React from "react";

import styles from "./Projects.module.css";
import Carousel from "nuka-carousel/lib/carousel";
import { Typography } from "@mui/material";


const files = [
  "job0",
  "job1",
  "job2",
  "job3",
  "job4",
  "job5"
];

const Projects = () => {
  return (
    <div className={styles.container}>
      {/* {files.map(file => <video key={file} className={styles.video} src={`media/jobs/${file}.mp4`} />)} */}
      <Carousel adaptiveHeight autoplay wrapAround slidesToShow={2.5} autoplayInterval={5000} cellAlign="center">
        {files.map(file =>
          <div key={file}>
            <Typography style={{position: "absolute"}} align="center">{file}</Typography>
            <video muted loop autoPlay className={styles.video} src={`media/jobs/${file}.mp4`} />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default Projects;
