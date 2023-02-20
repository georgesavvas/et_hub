import React, {useState, useEffect} from "react";

import styles from "./Projects.module.css";
import Carousel from "nuka-carousel/lib/carousel";
import { Typography } from "@mui/material";
import serverRequest from "../../services/serverRequest";


const files = [
  "job0",
  "job1",
  "job2",
  "job3",
  "job4",
  "job5"
];
const testData = files.map(file => `media/jobs/${file}.mp4`);

const Projects = props => {
  const [loadedData, setLoadedData] = useState(testData);

  useEffect(() => {
    // serverRequest("studio_jobs").then(resp => {
    //   setLoadedData(resp.data || []);
    // });
  }, []);

  const slideHeight = props.size[1];
  const slideWidth = slideHeight * 16/9;
  const placeholderAmount = Math.max((props.size[0] - 20) / slideWidth, 1);
  const slidesAmount = Math.max((props.size[0] - 5 * placeholderAmount) / slideWidth, 1);
  const slideStyle = {
    width: `${slideWidth}px`,
    height: `${slideHeight}px`
  };
  const slidesToScroll = Math.round(slidesAmount / 2);

  return (
    <div className={styles.container}>
      <Carousel autoplay wrapAround enableKeyboardControls withoutControls
        slidesToScroll={slidesToScroll} dragThreshold={0.25}
        slidesToShow={slidesAmount} autoplayInterval={5000} cellAlign="center">
        {loadedData.map(file =>
          <div key={file} className={styles.slide} style={slideStyle}>
            <div className={styles.overlay}>
              <Typography variant="body2" align="center"
                className={styles.text}>
                white_claw_pack_animation_e060059
              </Typography>
            </div>
            <video muted loop autoPlay className={styles.video}
              src={file} />
          </div>
        )}
      </Carousel>
    </div>
  );
};

export default Projects;
