import React, { Component } from "react";
import styled from "styled-components";
import {
  Bound,
  CanvasSpace,
  Create,
  Pt,
  Group,
  Const,
  Num,
  Line,
  Shaping,
  Circle
} from "pts";
import colors from "../../materials/Colors";
import Layout from "../../elements/Layout";
import { viewport } from "../../materials/Sizes";

const Canvas = styled.canvas`
  width: ${viewport.width}%;
  height: ${viewport.height}%;
`;

const noise2DRange = (p, min, max) =>
  Num.mapToRange(Num.clamp(p.noise2D(), -0.5, 0.5), -0.5, 0.5, min, max);

class VectorField extends Component {
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
    let grid = [];
    let gridPts = [];
    let noiseGrid2 = [];

    let cellW;
    let cellH;

    this.space.add({
      start: () => {
        let follower = this.space.center;

        const gridCellSize = 40;

        const margins = new Pt(20, 20);

        const paddedBounds = new Bound(
          ...this.space.innerBound
          // .scale(0.8).add(margins)
        );
        cellW = Math.floor(paddedBounds.width / gridCellSize);
        cellH = Math.floor(paddedBounds.width / gridCellSize);

        console.log("cellW: ", cellW);
        grid = Create.gridCells(paddedBounds, cellW, cellH);
        gridPts = Create.gridPts(paddedBounds, cellW, cellH);

        noiseGrid = Create.noisePts(gridPts, 0.2, 0.1, cellW, cellH);
        noiseGrid2 = Create.noisePts(gridPts, -0.05, 0.01, cellW, cellH);

        follower = this.space.center;
      },
      // render
      animate: time => {
        follower = follower.add(
          this.space.pointer.$subtract(follower).divide(20)
        );

        let radius = Num.cycle((time % 1000) / 1000) * 10;

        noiseGrid.forEach((p, i) => {
          const p2 = noiseGrid2[i];
          p.step(0.01, 0.01);
          p2.step(0.01, 0.01);

          const mask = noise2DRange(p2, 1, 10);
          const noise1 = noise2DRange(p, 1, mask);

          this.form
            .stroke(false)
            // colors.dots
            .fill("rgba(255, " + mask * 25 + ", 0,1)", 1)
            .point(p.$add(noise1), noise1, "circle");
        });

        if (this.props.showArrows)
          noiseGrid.forEach((p, i) => {
            const p2 = noiseGrid2[i];
            // p.step(0.01, 0.01);
            // p2.step(0.01, 0.08);
            // this.form.fillOnly("#09f").point(p, 1 + Math.abs(p.noise2D() * 20));

            let mSize = new Pt(2, 5);

            const ln = Line.fromAngle(
              p,
              Const.one_degree * 180 + p.noise2D() * 3,
              noise2DRange(p2, 1, cellH)
            );

            let headMark = Line.marker(ln, mSize, "arrow", false);

            this.form.stroke("red").line(ln);
            this.form.polygon(headMark);
          });

        follower = follower.add(
          this.space.pointer.$subtract(follower).divide(20)
        );
        this.form.fillOnly("#baf").point(follower, radius, "circle");
      },
      // Mouse or touch action
      action: (type, x, y) => {
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
  }

  // When data is updated, re-render by playing animate() once
  componentDidUpdate() {}

  render() {
    return (
      <Layout className="pts-chart">
        <Canvas
          innerRef={canvas => {
            this.ptsCanvas = canvas;
          }}
        />
      </Layout>
    );
  }
}

export default VectorField;
