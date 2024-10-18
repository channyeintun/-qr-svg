type GetPath = (x: number, y: number, getNeighbor?: GetNeighbor) => string;
type GetNeighbor = (xOffset: number, yOffset: number) => boolean;
type Corner = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
type Corners = Record<Corner, string>;
type Side = "top" | "right" | "bottom" | "left";
type Sides = Record<Side, string>;
type Shape = "circle" | "square" | "rounded";
type BodyShapes = Record<Shape, GetPath>;

export const bodyShapes: BodyShapes = {
  circle,
  square,
  rounded,
};

export const eyeballShapes = {
  rounded: `M ${
    2 + 2
  },${2}h-1a1,1,0,0,0,-1,1v1a1,1,0,0,0,1,1h1a1,1,0,0,0,1,-1v-1a1,1,0,0,0,-1,-1z`,
};

export const eyeframeShapes = {
  rounded: `M ${0},${
    0 + 2
  }a2,2,0,0,1,2,-2h3a2,2,0,0,1,2,2v3a2,2,0,0,1,-2,2h-3a2,2,0,0,1,-2,-2v-3zm2,-1a1,1,0,0,0,-1,1v3a1,1,0,0,0,1,1h3a1,1,0,0,0,1,-1v-3a1,1,0,0,0,-1,-1h-3z`,
};

function circle(x: number, y: number) {
  const r = 0.45;
  return `M ${x + r * 2}, ${y + r} 
          a ${r},${r} 45 1,0 -${r * 2},0,
          a ${r},${r} 45 1,0 ${r * 2},0`;
}

function square(x: number, y: number) {
  return `M ${x} ${y} h 1 v 1 h -1 v -1`;
}

function rounded(x: number, y: number, getNeighbor?: GetNeighbor) {
  const leftNeighbor = getNeighbor ? +getNeighbor(-1, 0) : 0;
  const rightNeighbor = getNeighbor ? +getNeighbor(1, 0) : 0;
  const topNeighbor = getNeighbor ? +getNeighbor(0, -1) : 0;
  const bottomNeighbor = getNeighbor ? +getNeighbor(0, 1) : 0;

  const neighborsCount = leftNeighbor + rightNeighbor + topNeighbor +
    bottomNeighbor;

  if (neighborsCount === 0) {
    return circle(x, y);
  }

  if (
    neighborsCount > 2 || (leftNeighbor && rightNeighbor) ||
    (topNeighbor && bottomNeighbor)
  ) {
    return square(x, y);
  }

  if (neighborsCount === 2) {
    let corner: Corner = "topRight";

    if (leftNeighbor && topNeighbor) {
      corner = "bottomRight";
    } else if (topNeighbor && rightNeighbor) {
      corner = "bottomLeft";
    } else if (rightNeighbor && bottomNeighbor) {
      corner = "topLeft";
    }

    return cornerRounded(x, y, corner);
  }

  if (neighborsCount === 1) {
    let side: Side = "right";

    if (topNeighbor) {
      side = "bottom";
    } else if (rightNeighbor) {
      side = "left";
    } else if (bottomNeighbor) {
      side = "top";
    }

    return sideRounded(x, y, side);
  }
  return "";
}

function cornerRounded(x: number, y: number, corner: Corner) {
  const corners: Corners = {
    topLeft: `M ${
      x + 1
    } ${y} h -0.5 a 0.5 0.5 0 0 0 -0.5 0.5 v 0.5 h 1 v -1 h -0.5`,
    topRight:
      `M ${x} ${y} h 0 v 1 h 1 v -0.5 a 0.5 0.5 0 0 0, -0.5 -0.5 h -0.5`,
    bottomRight: `M ${x} ${y} h 1 v 0.5 a 0.5 0.5, 0, 0 1, -0.5 0.5 h -0.5`,
    bottomLeft: `M ${x} ${y} h 1 v 1 h -0.5 a 0.5 0.5 0 0 1 -0.5 -0.5`,
  };
  return corners[corner];
}

function sideRounded(x: number, y: number, side: Side) {
  const sides: Sides = {
    left: `M ${x + 0.5} ${y} h 0.5 v 1 h -0.5 a 0.5 0.5 0 0 1 0 -1`,
    right: `M ${x} ${y}v 1h 0.5a 0.5 0.5, 0, 0, 0, 0 -1`,
    top: `M ${x} ${y + 0.5} v 0.5 h 1 v -0.5 a 0.5 0.5 0 0 0 -1 0`,
    bottom: `M ${x} ${y} h 1 v 0.5 a 0.5 0.5 0 0 1 -1 0`,
  };
  return sides[side];
}
