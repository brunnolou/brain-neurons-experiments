import React, { Component } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  cursor: none;
`;

class Layout extends Component {
  render() {
    return (
      <Wrapper>
        {this.props.children}
      </Wrapper>
    );
  }
}

export default Layout;
