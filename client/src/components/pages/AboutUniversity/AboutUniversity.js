import React from "react";
import Header from "../../common/Header/Header";
import {
  Card,
  CardContent,
  CardMedia,
  Container,
  Grid,
  Typography,
} from "@material-ui/core";
import "./AboutUniversity.css";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

export const AboutUniversity = () => {
  return (
    <div className="home">
      <Header />
      <div className="container" id="aboutContainer">
        <Grid container justify="center">
          <Grid item xs={10}>
            <Card variant="outlined">
              <Grid
                container
                justify="center"
                alignItems="flex-start"
                className="p-3 "
              >
                <Grid item xs={8} md={4}>
                  <Grid container justify="center" alignContent="center">
                    <CardMedia
                      component="img"
                      style={{ maxWidth: "150px" }}
                      image="vitb.jpeg"
                      label={"Logo"}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} md={12}>
                  <Grid container justify="center">
                    <CardContent className="text-center">
                      <Typography gutterBottom variant="h3" component="h2">
                        {""}
                      </Typography>
                      <Typography gutterBottom variant="subtitle1">
                        <a
                          href="https://vitbhopal.ac.in/"
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {"Official University Website"}
                          <OpenInNewIcon fontSize="small" />
                        </a>
                      </Typography>
                    </CardContent>
                  </Grid>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
        <Grid container justify="center" className="my-3">
          <Grid item xs={10}>
            <Card variant="outlined">
              <Container className="px-5 py-4">
                <Typography variant="h4" className="text-center pb-3">
                  About University
                </Typography>
                <Typography variant="body2">
                  {
                    "VIT Bhopal University, also known as Vellore Institute of Technology, Bhopal or VIT University, Bhopal, is a private university in Kothri Kalan in Sehore district, Madhya Pradesh, India."
                  }
                </Typography>
                <br />
              </Container>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
