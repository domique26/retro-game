const TileKind = SpriteKind.create();

scene.setBackgroundColor(12);
showControls();
startGame();

function showControls() {
    // showLongText automatically pauses until A is pressed
    game.showLongText("Press A to jump!\nPress B to toggle debug mode", DialogLayout.Center);
}

function startGame() {
    let debug_mode: boolean = false;
    let tiles:Sprite[] = [];
    let highestScore = 0;
    const myPlayer = sprites.create(assets.image`sybit_logo`, SpriteKind.Player);
    myPlayer.bottom = screen.height;
    myPlayer.ay = 350;
    myPlayer.scale = 1;
    myPlayer.vy = -400;
    let tileWidth = randint(15, 30);
    const tileHeight = 3;
    let tileStart = randint(0, screen.width - tileWidth);
    sprites.create(image.create(tileWidth, tileHeight), TileKind);

    game.onUpdateInterval(500, () => {
        tileWidth = randint(15, 30);
        tileStart = randint(0, screen.width - tileWidth);
        const tile = sprites.create(image.create(tileWidth, tileHeight), TileKind);
        tile.image.fillRect(0, 0, tileWidth, tileHeight, 10);
        tile.left = tileStart;
        tile.top = myPlayer.y + -55;
        tile.vy = 3;
        if (debug_mode) { tile.setFlag(SpriteFlag.ShowPhysics, true); }
    });

    controller.B.addEventListener(ControllerButtonEvent.Pressed, () => {
        debug_mode = !debug_mode;
        myPlayer.setFlag(SpriteFlag.ShowPhysics, debug_mode);
        tiles.forEach(tile => {
            tile.setFlag(SpriteFlag.ShowPhysics, debug_mode);
        });
    });

    game.onUpdate(() => {

        highestScore = (-myPlayer.y > highestScore) ? -myPlayer.y : highestScore;
        info.setScore(highestScore);

        tiles = sprites.allOfKind(TileKind)
        tiles.reverse();

        if (tiles.length > 8) {
            tiles[tiles.length - 1].destroy()
        }

        if (controller.right.isPressed()) {
            myPlayer.vx = 85;
        } else if(controller.left.isPressed()) {
            myPlayer.vx = -85;
        } else {
            myPlayer.vx = 0;
        }

        scene.centerCameraAt(scene.cameraProperty(CameraProperty.X), myPlayer.y);

        if (info.score() > 2000) {
            game.over(true, effects.confetti)
        } 

        if(myPlayer.x > screen.width) {
            myPlayer.x = 0;
        } 
        if(myPlayer.x < 0) {
            myPlayer.x = screen.width;
        } 
        if (myPlayer.y > screen.height) {
            game.over(false);
        }
    })

    sprites.onOverlap(SpriteKind.Player, TileKind, function (sprite, tile) {
        myPlayer.vy = -300;
    })
}
