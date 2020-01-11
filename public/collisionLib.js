function checkCollision(x1, y1, x2, y2, cx, cy, r) {
  var inside1 = collidePointCircle(x1, y1, cx, cy, r);
  var inside2 = collidePointCircle(x2, y2, cx, cy, r);
  if (inside1 || inside2) {
    return true
  }
  var distX = x1 - x2;
  var distY = y1 - y2;
  var len = Math.sqrt((distX * distX) + (distY * distY));
  var dot = ((((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / Math.pow(len, 2));

  // find the closest point on the line
  var closestX = x1 + (dot * (x2 - x1));
  var closestY = y1 + (dot * (y2 - y1));

  var onSegment = collidePointLine(closestX, closestY, x1, y1, x2, y2);
  if (!onSegment) {
    return false;
  }
  // get distance to closest point
  distX = closestX - cx;
  distY = closestY - cy;
  var distance = Math.sqrt((distX * distX) + (distY * distY));

  if (distance <= r) {
    return true;
  }
  else {
    return false;
  }
}

function collidePointCircle(x, y, cx, cy, r) {
  return (Math.pow(r, 2) > (Math.pow((x - cx), 2) + Math.pow((y - cy), 2)))
}


function collidePointLine(px, py, x1, y1, x2, y2) {
  var buffer = 0.05
  var d1 = Math.sqrt(Math.pow((px - x1), 2) + Math.pow((py - y1), 2))
  var d2 = Math.sqrt(Math.pow((px - x2), 2) + Math.pow((py - y2), 2))
  var dl = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
  return (d1 + d2 >= dl - buffer && d1 + d2 <= dl + buffer)
}


function collideCircleCircle(px, py, pr, ex, ey, er) {
  return ((pr + er) <= (Math.sqrt(Math.pow((px - ex), 2) + Math.pow((py - ey), 2))))
}
