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
  console.log(props.size);
  // const view_width = props.size.width - 50;
  // const job_width = (props.size.height - 95) * (16/9);
  // let amount = Math.floor(view_width / (job_width+40));
  // amount = Math.max(amount, 1);
  // const centre = (amount !== 1);
  // console.log(view_width + " / " + job_width + " = " + amount + " " + centre);

  const slideHeight = props.size[1];
  const slideWidth = slideHeight * 19/6;
  const slidesAmount = slideWidth / props.size[0];
  const slideStyle = {
    width: `${slideWidth}px`,
    height: `${slideHeight}px`
  };
  return (
    <div className={styles.container}>
      {/* {files.map(file => <video key={file} className={styles.video} src={`media/jobs/${file}.mp4`} />)} */}
      <Carousel adaptiveHeight autoplay wrapAround slidesToShow={slidesAmount} autoplayInterval={5000} cellAlign="center">
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
