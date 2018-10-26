import React, { Component } from "react";
import { CanvasSpace, Pt, Num } from "pts";
import { pointFromVector } from "@popmotion/popcorn";

import { canvas } from "../../materials/Sizes";
import Particles from "./particles";

import Layout from "../../elements/Layout";
import Canvas from "../../elements/Canvas";

import colors from "../../materials/Colors";

class ParticlesDemo extends Component {
  canvasNode = null;

  componentDidMount() {
    if (!this.canvasNode) return;

    this.particleSystem = new Particles(this.canvasNode, {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      speed: 2,
      globalMotion: this.props.globalMotion,
      globalMotionAngle: this.props.globalMotionAngle
    });

    this.space = new CanvasSpace(this.canvasNode).setup({
      bgcolor: colors.black,
      resize: true,
      retina: true
    });
    this.form = this.space.getForm();
    let follower = new Pt();

    this.space.add({
      start: () => {
        follower = this.space.center;
      },
      // render
      animate: time => {
        const t = Num.cycle((time % 10000) / 10000);

        const rotation = pointFromVector(
          this.space.center,
          360 * 3 * t - 80,
          250
        );
        const rotationPoint = new Pt(rotation);

        follower = follower.add(
          this.space.pointer.$subtract(follower).divide(1)
        );
        const radius = 30;

        this.particleSystem.particles.forEach((particle, i) => {
          let radius = 10;

          // if (!i) console.log("radius: ", radius);

          if (this.props.mode === "spatial") {
            const tSpatial = (Num.cycle((time % 20000) / 20000) - 0.5) * 10;

            particle.vy = 0;
            particle.vx = tSpatial;
          }

          this.form
            .fillOnly(
              this.props.globalMotion &&
              particle.hasGlobalMotion &&
              this.isMouseDown
                ? colors.red
                : colors.gray
            )
            .point(new Pt(particle), radius, "circle");
        });

        if (this.isMouseDown && !this.props.globalMotion)
          this.form.fillOnly(colors.red).point(rotationPoint, radius, "circle");
      },

      // Mouse or touch action
      action: (type, x, y) => {
        switch (type) {
          case "down": {
            this.isMouseDown = !this.isMouseDown;
            break;
          }
          case "out":
          case "up": {
            // this.isMouseDown = false;
            break;
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

  render() {
    return (
      <Layout>
        <Canvas
          innerRef={canvas => {
            this.canvasNode = canvas;
          }}
        />
      </Layout>
    );
  }
}

export default ParticlesDemo;
