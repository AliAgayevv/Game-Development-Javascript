window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 800;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.font = "20px Helvetica";
  ctx.fillStyle = "red";

  class Asteroid {
    // Game klassini qebul edir
    constructor(game) {
      // Asteroid icinde game classina referans olaraq game deyiskenini yaradiriq
      this.game = game;
      //   Cekilen circle in radiusu
      this.radius = 75;
      this.x = -this.radius;
      this.y = Math.random() * this.game.height;

      this.asteroid1 = document.getElementById("asteroid1");
      this.asteroid2 = document.getElementById("asteroid2");
      this.asteroid3 = document.getElementById("asteroid3");
      this.asteroid4 = document.getElementById("asteroid4");

      this.allAsteroids = [
        this.asteroid1,
        this.asteroid2,
        this.asteroid3,
        this.asteroid4,
      ];
      this.image =
        this.allAsteroids[Math.floor(Math.random() * this.allAsteroids.length)];

      this.spriteWidth = 300;
      this.spriteHeight = 200;
      // her frame de astreoidin nece piksel hereket edeceyini gosterir
      this.speed = Math.random() * 5 + 2;
      //   Asteroidin free olub olmadigini yoxlayir
      this.free = true;
      // Her bir asteroidin rotate derecesi
      this.angle = 0;
      // velocity of angle - donme sureti
      this.va = Math.random() * 0.02 - 0.01;
    }

    draw(context) {
      if (!this.free) {
        // imgSrc, x koordianti, y kooridnati, (width, height) optionaldi width ve height
        context.save();
        // context.rotate versek birdefiye canvas rotate olur amma context.translate(this.x, this.y) istifade edende, her bir indivudual asteroidin merkezi uzerinde rotate olur
        context.translate(this.x, this.y);
        context.rotate(this.angle);
        context.drawImage(
          this.image,
          //  Bu hisse asteroidi circle merkezine getirmek ucundu
          -this.spriteWidth / 2,
          -this.spriteHeight / 2,
          this.spriteWidth,
          this.spriteHeight
        );
        context.restore();
      }
    }
    update() {
      if (!this.free) {
        this.angle += this.va;
        this.x += this.speed;
        // Ekrandan cixanda asteroidi free olaraq isareleyir
        if (this.x > this.game.width - this.radius && this.game.hearths > 0) {
          this.game.hearths--;
          this.reset();
          const explosion = this.game.getExplosion();
          if (explosion) {
            explosion.start(this.x, this.y, 0);
          }
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
  class Explosion {
    constructor(gameArg) {
      this.game = gameArg;
      this.x = 0;
      this.y = 0;
      this.speed = 0;
      this.image = document.getElementById("explosions");
      // Spritedaki her bir explosionun width ve heightini aliriq ki onlari sirayla gezek ve animasiya effekti yaradaq
      this.spriteWidth = 300;
      this.spriteHeight = 300;
      this.free = true;
      this.frameX = 0;
      // 3 dene partlama effekti y ekseni ustunde duzulub, x eksenleri onlarin timeline-di yeni goturek 1 ci partlama effektinin 1 ci frame i partlamanin baslamasi 2 animasyiasi 3 de pik halidi, biz y ekseninden random olaraq 1 denesin gotururk ki unique olsun her partlama, hamsi ucun 1 dene partlama effekti istifade etsek bayagi gorunecek.
      this.frameY = Math.floor(Math.random() * 3);
      this.maxFrame = 22;

      this.animationtimer = 0;
      this.animationInterval = 1000 / 25;

      this.sound =
        this.game.allExplosionSounds[
          Math.floor(Math.random() * this.game.allExplosionSounds.length)
        ];
    }
    draw(context) {
      if (!this.free) {
        context.drawImage(
          this.image,
          this.spriteWidth * this.frameX,
          this.spriteHeight * this.frameY,
          this.spriteWidth,
          this.spriteHeight,
          this.x - this.spriteWidth / 2,
          this.y - this.spriteHeight / 2,
          this.spriteWidth,
          this.spriteHeight
        );
      }
    }
    update(deltaTime) {
      if (!this.free) {
        this.x += this.speed;
        if (this.animationtimer > this.animationInterval) {
          this.frameX++;
          if (this.frameX > this.maxFrame) {
            this.reset();
          }
          this.animationtimer = 0;
        } else {
          this.animationtimer += deltaTime;
        }
      }
    }

    playSound() {
      this.sound.volume = 0.5;
      this.sound.currentTime = 0;
      this.sound.play();
    }

    reset() {
      this.free = true;
    }
    start(x, y, speed) {
      // Her yeni partlama effekti yaradildiqda 3 dene partlama animasiyasindan birini random secirik
      this.frameY = Math.floor(Math.random() * 3);
      this.free = false;
      this.x = x;
      this.y = y;
      this.frameX = 0;
      this.speed = speed;
      this.sound =
        this.game.allExplosionSounds[
          Math.floor(Math.random() * this.game.allExplosionSounds.length)
        ];
      this.playSound();
    }
  }

  class Game {
    constructor(widthArg, heightArg) {
      this.width = widthArg;
      this.height = heightArg;
      //   Object Pool ile isleyirik ki her defe yeni asteroid yaradanda yeni object yaratmasin ve memoryde yer tutmasin
      //   Bir nov C dilindeki malloc ve free funksiyalarina benzer bir mentqiden istifade edeceyik
      this.asteroidPool = [];
      this.maxAsteroids = 30;
      this.asteroidTimer = 0;
      //   her 1 saniyede bir asteroid yaradir
      this.asteroidInterval = 1000;
      this.createAstroidPool();
      this.score = 0;
      this.maxScore = localStorage.getItem("maxScore") || 0;
      this.hearths = 3;
      this.hearthImage = document.getElementById("heart");

      this.mouse = {
        x: 0,
        y: 0,
        // mouse etrafinda radius yaradiriq click edilen bolgenin etrafinda merkezi click edilen yer olan
        radius: 2,
      };

      this.explosionSound1 = document.getElementById("explosion1");
      this.explosionSound2 = document.getElementById("explosion2");
      this.explosionSound3 = document.getElementById("explosion3");
      this.explosionSound4 = document.getElementById("explosion4");
      this.explosionSound5 = document.getElementById("explosion5");
      this.explosionSound6 = document.getElementById("explosion6");

      this.allExplosionSounds = [
        this.explosionSound1,
        this.explosionSound2,
        this.explosionSound3,
        this.explosionSound4,
        this.explosionSound5,
        this.explosionSound6,
      ];

      this.explosionPool = [];
      this.maxExplosions = 20;
      this.createExplosionPool();

      window.addEventListener("click", (e) => {
        this.mouse.x = e.offsetX;
        this.mouse.y = e.offsetY;

        this.asteroidPool.forEach((asteroid) => {
          if (!asteroid.free && this.checkCollision(asteroid, this.mouse)) {
            const explosion = this.getExplosion();
            if (explosion) {
              explosion.start(asteroid.x, asteroid.y, asteroid.speed * 0.4);
              asteroid.reset();
              this.score++;
            }
          }
        });
      });
    }

    createAstroidPool() {
      for (let i = 0; i < this.maxAsteroids; i++) {
        // 10 dene asteroid yaradir ve asteroidPool arrayine push edirik. argument olan this vasitsiyle parent class olan Game in referansinida otururk ki access ede bilek.
        this.asteroidPool.push(new Asteroid(this));
      }
    }
    createExplosionPool() {
      for (let i = 0; i < this.maxExplosions; i++) {
        this.explosionPool.push(new Explosion(this));
      }
    }

    // AsteroidPool arrayinden free olan ilk asteroidi tapir ve onu return edir
    // Daha murekkeb object poollarda linkedlist kimi data strucutres istifade edilebiler
    getAsteroid() {
      for (let i = 0; i < this.asteroidPool.length; i++) {
        if (this.asteroidPool[i].free) {
          return this.asteroidPool[i];
        }
      }
    }

    // 2 obyektin temas etmesini check etmek ucun checkCollision funksiyasi yaradiriq. Bunu etmek ucun bir cox algoritma var (meselen, AABB collision detection, Circle collision detection, Pixel perfect collision detection)
    // Biz circle collision detection istifade edeceyik
    // 2 circle arasinda mesafe formulu: sqrt(dx^2 + dy^2)
    // hipotenuz formuludu qisasi
    // 2 circle arasinda mesafe < sqrt(dx^2 + dy^2) ise collision var eks halda false
    checkCollision(a, b) {
      const sumOfRadii = a.radius + b.radius;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.hypot(dx, dy);
      return distance < sumOfRadii;
    }

    getExplosion() {
      for (let i = 0; i < this.explosionPool.length; i++) {
        if (this.explosionPool[i].free) {
          return this.explosionPool[i];
        }
      }
    }

    render(context, deltaTime) {
      if (this.asteroidTimer > this.asteroidInterval) {
        const asteroid = this.getAsteroid();
        // Pool icinde free olan asteroid varsa onu start edir, if qoymasaydiq 4 cu asteroid yarananda partliyacagdi kod cunki getAsteroid null qaytacagdi ve null.start() deye birshey yoxdur
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

      this.explosionPool.forEach((explosion) => {
        explosion.draw(context);
        explosion.update(deltaTime);
      });

      context.save();
      if (this.score > this.maxScore) {
        ctx.fillStyle = "green";
        context.fillText(`Score: ${this.score}`, 20, 35);
      } else {
        context.fillText(`Score: ${this.score}`, 20, 35);
      }
      context.restore();

      // context.fillText(`Hearths: ${this.hearths}`, this.width / 1.2, 35);
      for (let i = 0; i < this.hearths; i++) {
        context.drawImage(
          this.hearthImage,
          this.width - 45 - 45 * i - 20,
          35,
          40,
          40
        );
      }

      context.fillText(`Max Score: ${this.maxScore}`, 20, 70);
      if (this.hearths === 0) {
        context.save();
        context.textAlign = "center";
        if (this.score < this.maxScore) {
          context.fillText(
            `You Lose! Your score ${this.score}`,
            this.width / 2,
            this.height / 2
          );
        } else {
          localStorage.setItem("maxScore", this.score);
          context.fillText(
            `You Lose! You have new high score ${this.score}`,
            this.width / 2,
            this.height / 2
          );
        }
        context.restore();
      }
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
