import React, { Component } from "react";
import styled from "styled-components";
import { canvas } from "../../materials/Sizes";
console.log("canvas: ", canvas.width);

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
	padding: 5%;
`;

const Content = styled.div`
  max-width: ${canvas.width}px;
  max-height: ${canvas.height}px;
  width: 100%;
`;

class Layout extends Component {
  render() {
    return (
      <Wrapper>
        <Content>{this.props.children}</Content>
      </Wrapper>
    );
  }
}

export default Layout;
