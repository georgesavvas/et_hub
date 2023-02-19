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

const Projects = props => {
  const slideHeight = props.size[1];
  const slideWidth = slideHeight * 16/9;
  const slidesAmount = Math.max(props.size[0] / slideWidth, 1);
  const slideStyle = {
    width: `${slideWidth}px`,
    height: `${slideHeight}px`
  };
  const slidesToScroll = Math.round(slidesAmount / 2);
  console.log(slidesAmount, slidesToScroll);
  return (
    <div className={styles.container}>
      <Carousel autoplay wrapAround enableKeyboardControls
        slidesToScroll={slidesToScroll} dragThreshold={0.25}
        slidesToShow={slidesAmount} autoplayInterval={5000} cellAlign="center">
        {files.map(file =>
          <div key={file} style={slideStyle}>
            <Typography style={{position: "absolute"}} align="center">{file}</Typography>
            <video muted loop autoPlay className={styles.video} src={`media/jobs/${file}.mp4`} />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default Projects;
