import platform from '../images/platform.png';
import hills from '../images/hills.png';
import background from '../images/background.png';
import platformSmallTall from '../images/platformSmallTall.png';
// sprites
import spriteRunLeft from '../images/spriteRunLeft.png';
import spriteRunRight from '../images/spriteRunRight.png';
import spriteStandLeft from '../images/spriteStandLeft.png';
import spriteStandRight from '../images/spriteStandRight.png';

const canvas = document.querySelector('canvas');

const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;

class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    this.width = 66;
    this.height = 150;
    this.speed = 10;
    // this.image = createImage(spriteStandRight);

    // for sprites
    this.frames = 0;
    this.sprites = {
      stand: {
        right: createImage(spriteStandRight),
        left: createImage(spriteStandLeft),
        cropWidth: 177,
        width: 66
      },
      run: {
        right: createImage(spriteRunRight),
        left: createImage(spriteRunLeft),
        cropWidth: 341,
        width: 127.875
      }
    }

    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = 177
  }

  draw() {
    c.drawImage(
      this.currentSprite, 
      this.currentCropWidth * this.frames,
      0,
      this.currentCropWidth,
      400,
      this.position.x, 
      this.position.y, 
      this.width, 
      this.height
      )
  };

  update() {
    this.frames += 1

    if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) {
      this.frames = 0
    } else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) {
      this.frames = 0
    }

    this.draw();
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y;
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity
    } 
  }
}

class Platform {
  constructor({ x, y, image}) {
    this.position = {
      x: x,
      y: y
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  };

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x: x,
      y: y
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  };

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y)
  }
}


function createImage (imageSrc) {
  const image = new Image()
  image.src = imageSrc
  return image
}

let platformIamge = createImage(platform);
let platformSmallTallImage = createImage(platformSmallTall);
let player = new Player();
let platforms = [];
let genericObjects = []

let lastKey
let keys = {
  right: {
    pressed: false
  },
  left: {
    pressed: false
  }
}

let scrollOffSet = 0;

function init() {
  player = new Player();

  platformIamge = createImage(platform);

  platforms = [
    new Platform({
      x: platformIamge.width * 4 + 300 - 2 + platformIamge.width - platformSmallTallImage.width,
      y: 270,
      image: platformSmallTallImage
    }),
    new Platform({
      x: 0,
      y: 470,
      image: platformIamge
    }),
    new Platform({
      x: platformIamge.width -3,
      y: 470,
      image: platformIamge
    }),
    new Platform({
      x: platformIamge.width * 2 + 100,
      y: 470,
      image: platformIamge
    }),
    new Platform({
      x: platformIamge.width * 3 + 300,
      y: 470,
      image: platformIamge
    }),
    new Platform({
      x: platformIamge.width * 4 + 300 -2,
      y: 470,
      image: platformIamge
    }),
    new Platform({
      x: platformIamge.width * 5 + 700 - 2,
      y: 470,
      image: platformIamge
    })
    
  ];

  genericObjects = [
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(background)
    }),
    new GenericObject({
      x: -1,
      y: -1,
      image: createImage(hills)
    })
  ]


  keys = {
    right: {
      pressed: false
    },
    left: {
      pressed: false
    }
  }

  scrollOffSet = 0;
}

function animate() {
  requestAnimationFrame(animate)
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  genericObjects.forEach(genericObject => {
    genericObject.draw();
  })

  platforms.forEach(platform =>  {
    platform.draw()
  });

  player.update();

  // move left/right
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed
  } else if (
    (keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffSet === 0 && player.position.x > 0)
    ) {
    player.velocity.x = -player.speed
  } else {
    player.velocity.x = 0;

    if (keys.right.pressed) {
      scrollOffSet += player.speed
      platforms.forEach(platform => {
        platform.position.x -= player.speed
      });

      genericObjects.forEach(genericObject => {
        genericObject.position.x -= player.speed * .66
      });
    } else if (keys.left.pressed && scrollOffSet > 0) {
      scrollOffSet -= player.speed
      platforms.forEach(platform => {
        platform.position.x += player.speed
      });

      genericObjects.forEach(genericObject => {
        genericObject.position.x += player.speed * .66
      })
    }
  }

  // land on platform (collision detection)
  platforms.forEach(platform => {
    if (player.position.y + player.height <= platform.position.y && player.position.y + player.height + player.velocity.y >= platform.position.y && player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width) {
      player.velocity.y = 0;
    }
  });

  // sprite switch conditional
  if (keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.run.right) {
    player.frames = 1
    player.currentSprite = player.sprites.run.right
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (keys.left.pressed &&lastKey === 'left' && player.currentSprite !== player.sprites.run.left) {
    player.frames = 1
    player.currentSprite = player.sprites.run.left
    player.currentCropWidth = player.sprites.run.cropWidth
    player.width = player.sprites.run.width
  } else if (!keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.stand.left) {
    player.frames = 1
    player.currentSprite = player.sprites.stand.left
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  } else if (!keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.stand.right) {
    player.frames = 1
    player.currentSprite = player.sprites.stand.right
    player.currentCropWidth = player.sprites.stand.cropWidth
    player.width = player.sprites.stand.width
  }

  // work on not being able to jump through platforms
  // if (player.position.y >= platform.position.y + platform.height) {
  //     player.velocity.y = 20
  // }

  // win condition
  if (scrollOffSet > platformIamge.width * 5 + 300 - 2 && player.velocity.y === 0) {
    // alert('You win!')
    console.log('you win!')
  }

  if (player.position.y >= canvas.height) {
    // alert("Oh NO! You fell down a hole... Try again")
    init()
  }

}

init();
animate()

window.addEventListener('keydown', ({ keyCode }) => {
  // w => 87
  // a => 65
  // s => 83
  // d => 68

  switch (keyCode) {
    case 65:
      keys.left.pressed = true
      lastKey = 'left'
      break;
    case 83:
      break;
    case 68:
      keys.right.pressed = true
      lastKey = 'right'
      break;
    case 87:
      player.velocity.y -= 25;
      break;
  }
})

window.addEventListener('keyup', ({ keyCode }) => {
  switch (keyCode) {
    case 65:
      keys.left.pressed = false
      break;
    case 83:
      break;
    case 68:
      keys.right.pressed = false
      break;
    case 87:
      break;
  }

})
