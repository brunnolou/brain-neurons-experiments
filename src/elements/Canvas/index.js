import styled, { keyframes } from "styled-components";
import { canvas } from "../../materials/Sizes";

const fadeIn = keyframes`
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
`;

const Canvas = styled.canvas.attrs({
  width: canvas.width,
  height: canvas.height
})`
  width: ${canvas.width}px;
  height: ${canvas.height}px;
  animation: ${fadeIn} 1.5s;
`;

export default Canvas;
