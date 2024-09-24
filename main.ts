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

    // Darstellung der Blöcke: Zufällige Verteilung, Breite, wo sie erscheinen
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

    // Überprüfen der Blockverteilung
    controller.B.addEventListener(ControllerButtonEvent.Pressed, () => {
        debug_mode = !debug_mode;
        myPlayer.setFlag(SpriteFlag.ShowPhysics, debug_mode);
        tiles.forEach(tile => {
            tile.setFlag(SpriteFlag.ShowPhysics, debug_mode);
        });
    });

    game.onUpdate(() => {
        // der höchste Score den man erreicht ist der Highscore, der dann gerankt werden soll
        highestScore = (-myPlayer.y > highestScore) ? -myPlayer.y : highestScore;
        info.setScore(highestScore);

        // es sollen maximal 8 Blöcke auf dem Bildschrim sein, wenn der 9. kommt, soll der 1. gelöscht werden
        tiles = sprites.allOfKind(TileKind)
        tiles.reverse();

        if (tiles.length > 8) {
            tiles[tiles.length - 1].destroy()
        }

        // Steuerung des Doodles per Steuerkreuz
        if (controller.right.isPressed()) {
            myPlayer.vx = 85;
        } else if(controller.left.isPressed()) {
            myPlayer.vx = -85;
        } else {
            myPlayer.vx = 0;
        }

        // Kamera verfolgt den Doodle, der Bildschirm bleibt aber gleich
        scene.centerCameraAt(scene.cameraProperty(CameraProperty.X), myPlayer.y);

        // wenn der Score so und so hoch ist, änder den Doodle / brich ab
        if (info.score() > 1000) {
            myPlayer.setImage(assets.image`sybit_logo_new`);
        } 
        if (info.score() > 2000) {
            game.over(true, effects.confetti)
        } 

        // der Doodle verschwindet auf der einen Seite und taucht auf der anderen wieder auf
        if(myPlayer.x > screen.width) {
            myPlayer.x = 0;
        } 
        if(myPlayer.x < 0) {
            myPlayer.x = screen.width;
        } 

        // Doodle fällt Richtung Boden -> Game Over
        if (myPlayer.y > screen.height) {
            game.over(false);
        }
    })
    
    // der Doodle macht einen Sprung, wenn der Block berührt wird
    sprites.onOverlap(SpriteKind.Player, TileKind, function (sprite, tile) {
        myPlayer.vy = -300;
    })
}
