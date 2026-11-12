(function (g) {
  function project(initialVelocity, decelerationRate = 0.998) {
    return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
  }

  function rubberband(overshoot, dimension, constant = 0.55) {
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  }

  function shouldCommit(offsetX, velocityX, width, threshold = 0.35) {
    return Math.abs(offsetX + project(velocityX)) > width * threshold;
  }

  const api = { project, rubberband, shouldCommit };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  g.oniroPhysics = api;
})(globalThis);
