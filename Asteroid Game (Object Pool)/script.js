window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 800;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;

  class Asteroid {
    // Game klassini qebul edir
    constructor(game) {
      // Asteroid icinde game classina referans olaraq game deyiskenini yaradiriq
      this.game = game;
      //   Cekilen circle in radiusu
      this.radius = 75;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
      this.image = document.getElementById("asteroid");
      this.spriteWidth = 150;
      this.spriteHeight = 155;
      // her frame de astreoidin nece piksel hereket edeceyini gosterir
      this.speed = Math.random() * 1.5 + 0.1;
      //   Asteroidin free olub olmadigini yoxlayir
      this.free = true;
    }

    draw(context) {
      if (!this.free) {
        // imgSrc, x koordianti, y kooridnati, (width, height) optionaldi width ve height
        context.drawImage(
          this.image,
          //  Bu hisse asteroidi circle merkezine getirmek ucundu
          this.x - this.spriteWidth / 2,
          this.y - this.spriteHeight / 2,
          this.spriteWidth,
          this.spriteHeight
        );
      }
    }
    update() {
      if (!this.free) {
        this.x += this.speed;
        // Ekrandan cixanda asteroidi free olaraq isareleyir
        if (this.x > this.game.width + this.radius) {
          this.reset();
        }
      }
    }

    reset() {
      this.free = true;
    }
    start() {
      this.free = false;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;
    }
  }

  class Game {
    constructor(widthArg, heightArg) {
      this.width = widthArg;
      this.height = heightArg;
      //   Object Pool ile isleyirik ki her defe yeni asteroid yaradanda yeni object yaratmasin ve memoryde yer tutmasin
      //   Bir nov C dilindeki malloc ve free funksiyalarina benzer bir mentqiden istifade edeceyik
      this.asteroidPool = [];
      this.max = 30;
      this.asteroidTimer = 0;
      //   her 1 saniyede bir asteroid yaradir
      this.asteroidInterval = 1000;
      this.createAstroidPool();
    }

    createAstroidPool() {
      for (let i = 0; i < this.max; i++) {
        // 10 dene asteroid yaradir ve asteroidPool arrayine push edirik. argument olan this vasitsiyle parent class olan Game in referansinida otururk ki access ede bilek.
        this.asteroidPool.push(new Asteroid(this));
      }
    }

    // AsteroidPool arrayinden free olan ilk asteroidi tapir ve onu return edir
    // Daha murekkeb object poollarda linkedlist kimi data strucutres istifade edilebiler
    getElement() {
      for (let i = 0; i < this.asteroidPool.length; i++) {
        if (this.asteroidPool[i].free) {
          return this.asteroidPool[i];
        }
      }
    }

    render(context, deltaTime) {
      if (this.asteroidTimer > this.asteroidInterval) {
        const asteroid = this.getElement();
        // Pool icinde free olan asteroid varsa onu start edir, if qoymasaydiq 4 cu asteroid yarananda partliyacagdi kod cunki getElement null qaytacagdi ve null.start() deye birshey yoxdur
        if (asteroid) {
          asteroid.start();
        }
        // this.asteroidPool.push(new Asteroid(this));
        this.asteroidTimer = 0;
      } else {
        this.asteroidTimer += deltaTime;
      }
      this.asteroidPool.forEach((asteroid) => {
        asteroid.draw(context);
        asteroid.update();
      });
    }
  }
  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;
  // Render funskiyasi her defe cagirilanda bir frame yaradir ve asteroidleri cizir
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    // Arxasinda kohne animasyinanin frameleri qalirdi, onu silmek ucun clearRect funksiyasindan istifade edirik
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    // ! Bunun ne oldugun ARASTIR
    requestAnimationFrame(animate);
  }
  animate(0);
});
