import React, {useContext} from "react";

import styles from "./Projects.module.css";
import Carousel from "nuka-carousel/lib/carousel";
import {Typography} from "@mui/material";
import {DataContext} from "../../contexts/DataContext";


const Projects = props => {
  const {reels} = useContext(DataContext);

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
        {reels.map(file =>
          <div key={file} className={styles.slide} style={slideStyle}>
            <div className={styles.overlay}>
              <Typography variant="body2" align="center"
                className={styles.text}>
                {file.split("/").at(-1).split(".")[0]}
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
