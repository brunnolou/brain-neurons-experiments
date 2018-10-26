import React, { Component } from "react";
import {
  Bound,
  CanvasSpace,
  Create,
  Pt,
  Group,
  Num,
  Line,
} from "pts";
import { distance, interpolate, steps } from "@popmotion/popcorn";
import MouseSpeed from "mouse-speed";

import colors from "../../materials/Colors";
import Layout from "../../elements/Layout";
import Canvas from "../../elements/Canvas";
import { clamp, fadeTo } from "../../helpers/math";

const speed = new MouseSpeed();
let speedX;
let speedY;

speed.init(function() {
  speedX = speed.speedX;
  speedY = speed.speedY;
});

const noise2DRange = (p, min, max) =>
  Num.mapToRange(Num.clamp(p.noise2D(), -0.5, 0.5), -0.5, 0.5, min, max);
const mouseRadius = 90;

class Game extends Component {
  static defaultProps = {
    mode: "dots"
  };

  createChart() {
    // Create Space and Form
    // pass the ref canvas element directly into CanvasSpace
    this.space = new CanvasSpace(this.ptsCanvas).setup({
      bgcolor: colors.black,
      resize: true,
      retina: true
    });
    this.form = this.space.getForm();

    let follower = new Pt();
    let noiseGrid = [];
    let gridPts = [];
    const gridCellSize = 50;

    let cellW;
    let cellH;

    let dist = 0;
    let isMouseDown = false;

    let widthInter;

    this.space.add({
      start: () => {
        follower = this.space.center;

        const paddedBounds = new Bound(
          ...this.space.innerBound
        );
        cellW = Math.floor(paddedBounds.width / gridCellSize);
        cellH = Math.floor(paddedBounds.height / gridCellSize);

        gridPts = Create.gridPts(paddedBounds, cellW, cellH);

        noiseGrid = Create.noisePts(gridPts, 0.12, 0.12, cellW, cellH);

        follower = this.space.center;
        widthInter = interpolate([0, this.space.width], [1, 0]);
      },
      // render
      animate: time => {
        follower = follower.add(this.space.pointer.$subtract(follower));

        let radius = 30;
        follower = follower.add(
          this.space.pointer.$subtract(follower).divide(1.5)
        );

        noiseGrid.forEach((p, i) => {
          let backAndForward = Num.cycle((time % 3000) / 3000);
          let backAndForwardAlphaBin = 0;

          if (this.props.mode === "self-motion") {
            backAndForwardAlphaBin = 0.1 + widthInter(p.x);

            p.step(0.05 * backAndForward, 0.0);
          } else {
            p.step(0.005, 0.0);
          }

          const noiseAlpha =
            0.2 + clamp(1 - (noise2DRange(p, 0, 1) % 4) * 4, 0, 1);

          p.mouseAlpha = fadeTo(
            p,
            isMouseDown && p.dist < mouseRadius
              ? 0.5 + (mouseRadius - dist) / mouseRadius
              : 0,
            0,
            this.props.mode === "vector" ? 0.03 : undefined
          );
          const noiseAlphaBin = Math.round(noiseAlpha * 2) / 2;

          const alpha =
            0.2 + (this.props.mode === "cursor" ? noiseAlphaBin : p.mouseAlpha);

          if (this.props.mode === "dots" || this.props.mode === "cursor")
            this.form
              .stroke(false)
              .fill("rgba(255,255,255, " + alpha + ")", 1)
              .point(p, 10, "circle");

          if (this.props.mode === "self-motion")
            this.form
              .stroke(false)
              .fill("rgba(255,255,255, " + backAndForwardAlphaBin + ")", 1)
              .point(p, 10, "circle");
        });

        if (this.props.mode === "vector") {
          noiseGrid.forEach((p, i) => {
            // p.step(0.01, 0.01);
            // p2.step(0.01, 0.08);
            // this.form.fillOnly("#09f").point(p, 1 + Math.abs(p.noise2D() * 20));

            // const ln = Line.fromAngle(
            //   p,
            //   Const.one_degree * 180 + p.noise2D() * 3,
            //   noise2DRange(p2, 1, cellH * 3)
            // );
            const clampedSpeed = p.speed / gridCellSize;

            const ln = new Group(
              p.$add(
                new Pt(
                  p.mouseAlpha > 0.5 ? p.speedX : 0,
                  p.mouseAlpha > 0.5 ? p.speedY : 0
                )
              ),
              p
            );
            const mSize = new Pt(5, 15).$multiply(
              new Pt(0.1 + clampedSpeed, 0.1 + clampedSpeed)
            );

            const headMark = Line.marker(ln, mSize, "arrow", false);

            this.form
              .stroke("rgba(255,255,255, " + (0.3 + clampedSpeed) + ")", 2)
              .line(ln);
            this.form
              .fill("rgba(255,255,255, " + (0.3 + clampedSpeed) + ")", 1)
              .polygon(headMark);

            this.form
              .stroke(false)
              .fill("rgba(255,255,255, 0.4)", 2)
              .point(p, 2, "circle");
          });
        }

        if (this.props.mode === "cursor")
          this.form.fillOnly("#f00").point(follower, radius, "circle");
      },
      // Mouse or touch action
      action: (type, x, y) => {
        switch (type) {
          case "down": {
            isMouseDown = true;
            break;
          }
          case "out":
          case "up": {
            isMouseDown = false;
            break;
          }
          case "move": {
            noiseGrid.forEach((p, i) => {
              p.dist = distance(
                { x: p.x, y: p.y },
                {
                  x: this.space.pointer.x,
                  y: this.space.pointer.y
                }
              );
            });

            if (isMouseDown)
              noiseGrid.forEach((p, i) => {
                if (p.dist < mouseRadius) {
                  p.speedX = clamp(
                    speedX,
                    -gridCellSize * 0.8,
                    gridCellSize * 0.8
                  );
                  p.speedY = clamp(
                    speedY,
                    -gridCellSize * 0.8,
                    gridCellSize * 0.8
                  );
                  p.speed = Math.max(Math.abs(p.speedX), Math.abs(p.speedY));
                }
              });
          }
          default:
            return;
        }

        // this.space.clear(); // since we're not animating continuously, manually clear canvas and re-render chart
        // this.animate();
      },

      resize: bound => {
        if (this.form.ready) {
          this.space.clear();
          // this.animate();
        }
      }
    });

    // bind mouse and touch
    this.space.bindMouse().bindTouch();

    // Only animate once initially, no need to continuously animate if chart is not changing
    this.space.play();
  }

  // Create chart on mount
  componentDidMount() {
    this.createChart();
    console.log("this.props: ", this.props);
  }

  // When data is updated, re-render by playing animate() once
  componentDidUpdate() {}

  render() {
    return (
      <Layout>
        <Canvas
          innerRef={canvas => {
            this.ptsCanvas = canvas;
          }}
        />
      </Layout>
    );
  }
}

export default Game;
