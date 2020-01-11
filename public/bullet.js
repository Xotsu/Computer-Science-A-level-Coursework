class Bullet {

  constructor(location, timeFired) {
    this.position = {
      x:location.x,
      y:location.y-5,
      xv:0,
      yv:0
    }
    this.point = {
      x: mouseX,
      y: mouseY
    }
    this.radius = timeFired
    this.rotation = Math.atan2(this.point.y - this.position.y, this.point.x - this.position.x) / Math.PI * 180;
    this.speed = 160 / this.radius
  }
  display() {
    push()
    stroke(102, 153, 0)
    fill(204, 255, 51)
    ellipse(this.position.x, this.position.y, this.radius)
    pop()
  }
  update() {
    this.position.xv = (Math.cos(this.rotation / 180 * Math.PI) * this.speed)
    this.position.yv = (Math.sin(this.rotation / 180 * Math.PI) * this.speed)
    this.position.x += this.position.xv //(Math.cos(this.rotation / 180 * Math.PI) * this.speed)
    this.position.y += this.position.yv //(Math.sin(this.rotation / 180 * Math.PI) * this.speed)
    //DRAW THIS IN CLIENT

    //DRAW THIS IN CLIENT
    if (this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height) {
      bullets.splice(bullets.indexOf(this), 1)
    }
  }
}
