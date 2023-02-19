import React from "react";

import styles from "./Projects.module.css";
import Carousel from "nuka-carousel/lib/carousel";
import { Typography } from "@mui/material";


const files = [
  "job0",
  "job1",
  "job3",
  "job3",
  "job4",
  "job5"
];

const defaultControlsConfig = {
  nextButtonText: ">",
  prevButtonText: "<"
};

const Projects = props => {
  const slideHeight = props.size[1];
  const slideWidth = slideHeight * 16/9;
  const placeholderAmount = Math.max((props.size[0] - 20) / slideWidth, 1);
  const slidesAmount = Math.max((props.size[0] - 5 * placeholderAmount) / slideWidth, 1);
  const slideStyle = {
    width: `${slideWidth}px`,
    height: `${slideHeight}px`
  };
  const slidesToScroll = Math.round(slidesAmount / 2);
  console.log(slidesAmount, slidesToScroll);
  return (
    <div className={styles.container}>
      <Carousel autoplay wrapAround enableKeyboardControls withoutControls
        slidesToScroll={slidesToScroll} dragThreshold={0.25}
        slidesToShow={slidesAmount} autoplayInterval={5000} cellAlign="center"
        defaultControlsConfig={defaultControlsConfig}>
        {files.map(file =>
          <div key={file} className={styles.slide} style={slideStyle}>
            <div className={styles.overlay}>
              <Typography variant="body2" align="center" className={styles.text}>
                white_claw_pack_animation_e060059
              </Typography>
            </div>
            <video muted loop autoPlay className={styles.video} src={`media/jobs/${file}.mp4`} />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default Projects;
