const Eso = new Esoteric(document.getElementById("game"));

const spriteRenderSystem = new Eso.Render.SpriteRenderSystem();
const wireframeRenderSystem = new Eso.Render.WireframeRenderSystem();
function render() {
    Eso.Render.clearCanvas();
    spriteRenderSystem.run();
    wireframeRenderSystem.run();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

const inputSystem = new Eso.Input.InputSystem();
Eso.addEventListener('beforeUpdate', () => inputSystem.run());

Eso.world.gravity.y = 5;
Eso.startEngine();

const game = new Game();

(() => {
    const ops = {
        isStatic: true,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 1
    };
    const size = 10, w = Eso.Render.canvas.width, h = Eso.Render.canvas.height;
    const border1 = Eso.createRectangle(w / 2, 0, w, size, ops),
          border2 = Eso.createRectangle(w / 2, h, w, size, ops),
          border3 = Eso.createRectangle(0, h / 2, size, h, ops),
          border4 = Eso.createRectangle(w, h / 2, size, h, ops);
    new game.Base.Ground(border1);
    new game.Base.Ground(border2);
    new game.Base.Ground(border3);
    new game.Base.Ground(border4);

    new game.Base.OnewayGround(Eso.createRectangle(w / 2, h / 2, 50, 10, ops));
})();

(() => {
    const characterSystem = new game.Base.CharacterSystem(),
          aiSystem = new game.Base.AISystem();

    const img = Eso.Render.getImage("Characters/Player.png");
    img.width = 50;
    img.height = 50;
    const c = new game.Base.Character(60, 60, 25, img);

    const offset = Esoteric.vector2(0, -50);
    Eso.addEventListener("afterUpdate", () => {
        characterSystem.run();
        aiSystem.run();
        const t = Eso.Render.Camera.main.transform;
        t.position.x = Esoteric.lerp(t.position.x, c.body.position.x + offset.x, 0.25);
        t.position.y = Esoteric.lerp(t.position.y, c.body.position.y + offset.y, 0.25);
    });

    const movement = Eso.Input.createVector2Input(68, 65, 87, 83);
    
    
    Eso.addEventListener('beforeUpdate', () => {
        const v = movement.value, s = c.sprite;
        if (c.isGrounded()) {
            if (v.x > 0) {
                c.addMovement(1);
                s.scale.x = 1;
            } else if (v.x < 0) {
                c.addMovement(-1);
                s.scale.x = -1;
            }
        }
        if (v.y > 0 && c.canJump()) {
            c.jump(v.x);
        }
    });
})();