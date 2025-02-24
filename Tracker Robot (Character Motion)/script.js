window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 800;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  class Robot {
    constructor(canvas) {
      this.canvas = canvas;
      this.x = this.canvas.width / 2;
      this.y = this.canvas.height / 2;
      this.radius = 80;
      this.angle = 0;
      this.centerX = this.x;
      this.centerY = this.y;
      this.bodyImage = document.getElementById("body");
      this.bodySprite = document.getElementById("bodySprite");
      this.spriteWidth = 370;
      this.spriteHeight = 393;
      this.frameX = 0;
      this.maxFrame = 75;
      this.eye1Image = document.getElementById("eye1");
      this.eye2Image = document.getElementById("eye2");
      this.eye1Radius = this.radius * 0.4;
      this.eye2Radius = this.radius * 0.6;
      this.eye1Distance = this.eye1Radius;
      this.eye2Distance = this.eye2Radius;
      this.tracking = false;
      this.reflectionImage = document.getElementById("reflection");
      this.detectorLightImgae = document.getElementById("detectorLight");
      this.movementAngle = 0;
      this.mouse = {
        x: 0,
        y: 0,
      };

      this.canvas.addEventListener("mousemove", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;
        this.tracking = true;
      });
      this.canvas.addEventListener("mouseleave", (e) => {
        this.tracking = false;
      });
    }
    draw(context) {
      // bedeni
      context.drawImage(
        this.bodySprite,
        this.frameX * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x - this.bodyImage.width / 2 + 65,
        this.y - this.bodyImage.height / 2 - 53,
        this.spriteHeight,
        this.spriteWidth
      );

      // 1 ci goz
      context.drawImage(
        this.eye1Image,
        this.x +
          Math.cos(this.angle) * this.eye1Radius -
          this.eye1Image.width / 2,
        this.y +
          Math.sin(this.angle) * this.eye1Radius -
          this.eye1Image.height / 2
      );

      // 2 ci goz
      context.drawImage(
        this.eye2Image,
        this.x +
          Math.cos(this.angle) * this.eye2Radius -
          this.eye2Image.width / 2,
        this.y +
          Math.sin(this.angle) * this.eye2Radius -
          this.eye2Image.height / 2
      );
      // yansitma (gercekcilik qatsin deye)
      context.drawImage(
        this.reflectionImage,
        this.x - this.reflectionImage.width / 2,
        this.y - this.reflectionImage.height / 2
      );

      //   dedektr

      if (this.tracking)
        [
          context.drawImage(
            this.detectorLightImgae,
            this.x - this.detectorLightImgae.width / 2,
            this.y - this.detectorLightImgae.height / 2 - 195
          ),
        ];
    }

    update() {
      const dx = this.mouse.x - this.x;
      const dy = this.mouse.y - this.y;
      const distance = Math.hypot(dx, dy);

      if (distance <= this.eye1Distance * 2.5) {
        this.eye1Radius = distance * 0.4;
        this.eye2Radius = distance * 0.6;
      } else if (this.tracking) {
        this.eye1Radius = this.eye1Distance;
        this.eye2Radius = this.eye2Distance;
      } else {
        this.eye1Radius = this.eye1Distance * Math.cos(this.movementAngle);
        this.eye2Radius = this.eye2Distance * Math.cos(this.movementAngle);
      }

      this.angle = Math.atan2(dy, dx);

      if (this.frameX >= this.maxFrame) this.frameX = 0;
      else {
        this.frameX++;
      }
      this.movementAngle += 0.005;

      this.x = this.centerX + Math.cos(this.movementAngle * 3) * 80;
      this.y = this.centerY + Math.sin(this.movementAngle * 0.5) * 150;

      if (this.movementAngle > Math.PI * 4) {
        this.movementAngle = 0;
      }
    }
  }
  const robot = new Robot(canvas);

  function aniamte() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    robot.draw(ctx);

    robot.update();

    requestAnimationFrame(aniamte);
  }

  aniamte();
});
