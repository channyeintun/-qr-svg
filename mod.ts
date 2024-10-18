import QRJS from "qr.js";
import { bodyShapes, eyeballShapes, eyeframeShapes } from "./shapes.ts";
import svgpath from "svgpath";

export type Excavate = {
  width: number;
  height: number;
};

export type Options = {
  data: string;
  level?: "L" | "M" | "Q" | "H";
  excavate?: Excavate;
  size?: number;
};

type ReturnSVGData = {
  path: string;
  cords: { x: number; y: number; width: string; height: string };
  length: number;
};

export function getSVGData({
  data,
  excavate,
  size,
  ...options
}: Options): ReturnSVGData {
  const $shapes = {
    body: "square",
    eyeball: "square",
    eyeframe: "square",
  } as const;
  const { modules } = QRJS(data, options) as { modules: boolean[][] };
  const newModules = excavate && size
    ? excavateModules(modules, size, excavate)
    : modules;
  const bodyPath = newModules
    .map((row, i) =>
      row
        .map((isON, j) => {
          const isEyeArea = (i < 7 && j < 7) || (i > row.length - 8 && j < 7) ||
            (i < 7 && j > row.length - 8);

          switch (true) {
            case isEyeArea:
              return "";
            case isON: {
              const getNeighbor = getNeighborHOF(i, j, modules);
              return bodyShapes[$shapes.body](i, j, getNeighbor);
            }
            default:
              return "";
          }
        })
        .join("")
    )
    .join("")
    .replace(/([\n]|[ ]{2})/g, "");

  return {
    path: bodyPath +
      `
    ${eyeballShapes.rounded} 
    ${eyeframeShapes.rounded}

    
    ${
        svgpath(eyeballShapes.rounded).matrix([1, 0, 0, -1, 0, modules.length])
          .toString()
      }
    ${
        svgpath(eyeframeShapes.rounded).matrix([1, 0, 0, -1, 0, modules.length])
          .toString()
      }

    ${
        svgpath(eyeballShapes.rounded).matrix([-1, 0, 0, 1, modules.length, 0])
          .toString()
      }
    ${
        svgpath(eyeframeShapes.rounded).matrix([-1, 0, 0, 1, modules.length, 0])
          .toString()
      } 
   
  `,
    cords: { x: 0, y: 0, width: "100%", height: "100%" },
    length: modules.length,
  };
}

function getNeighborHOF(x: number, y: number, modules: boolean[][]) {
  return function (
    xOffset: number,
    yOffset: number,
  ) {
    const count = modules.length;
    const isOn = (r: number, c: number) => modules[r] && modules[r][c];
    // if outside qr
    if (
      x + xOffset < 0 || y + yOffset < 0 || x + xOffset >= count ||
      y + yOffset >= count
    ) return false;

    return isOn(x + xOffset, y + yOffset);
  };
}

function excavateModules(
  modules: boolean[][],
  size: number,
  excavate: Excavate,
) {
  const { length } = modules;
  const scale = length / size;

  const { width, height } = excavate; // brand area
  const w = width * scale;
  const h = height * scale;
  const x = length / 2 - w / 2;
  const y = length / 2 - h / 2;

  const floorX = Math.floor(x);
  const floorY = Math.floor(y);
  const ceilW = Math.ceil(w + x - floorX);
  const ceilH = Math.ceil(h + y - floorY);

  const excavation = { x: floorX, y: floorY, w: ceilW, h: ceilH };

  return modules.slice().map((row, _y) => {
    if (_y < excavation.y || _y >= excavation.y + excavation.h) {
      return row;
    }
    return row.map((cell, _x) => {
      if (_x < excavation.x || _x >= excavation.x + excavation.w) {
        return cell;
      }
      return false;
    });
  });
}
