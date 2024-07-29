import { P5CanvasInstance, ReactP5Wrapper } from '@p5-wrapper/react';

const sketch = (p5: P5CanvasInstance) => {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.draw = () => {
    p5.background(250);
    p5.normalMaterial();
    p5.push();
    p5.rotateZ(p5.frameCount * 0.01);
    p5.rotateX(p5.frameCount * 0.01);
    p5.rotateY(p5.frameCount * 0.01);
    p5.plane(100);
    p5.pop();
  };
};

function App() {
  return (
    <div className="p-0">
      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
}

export default App;
