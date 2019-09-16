const Eso = new Esoteric(document.getElementById("game"));

const spriteRenderSystem = new Eso.Render.SpriteRenderSystem();
function render() {
    Eso.Render.clearCanvas();
    spriteRenderSystem.run();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

const inputSystem = new Eso.Input.InputSystem();
Eso.addEventListener('beforeUpdate', () => inputSystem.run());

Eso.world.gravity.y = 0;
Eso.startEngine();

(() => {
    const ops = {
        isStatic: true
    };
    const size = 10, w = Eso.Render.canvas.width, h = Eso.Render.canvas.height;
    const border1 = Eso.createRectangle(w / 2, 0, w, size, ops),
          border2 = Eso.createRectangle(w / 2, h, w, size, ops),
          border3 = Eso.createRectangle(0, h / 2, size, h, ops),
          border4 = Eso.createRectangle(w, h / 2, size, h, ops);
})();

(() => {
    const t = new Esoteric.Base.Transform();
    const s = new Eso.Render.Sprite(Eso.Render.getImage("Characters/Player.png"), t, -25, -25);
    const b = Eso.createRectangle(60, 60, 50, 50, {
        inertia: Infinity,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0.25
    });
    t.position = b.position;
    s.image.width = 50;
    s.image.height = 50;


    const movement = Eso.Input.createVector2Input(68, 65, 87, 83);
    
    const speed = 0.01;
    Eso.addEventListener('beforeUpdate', () => {
        const v = movement.value;
        if (v.x > 0) {
            b.force.x += speed;
            s.scale.x = 1;
        } else if (v.x < 0) {
            b.force.x -= speed;
            s.scale.x = -1;
        }
        if (v.y > 0) {
            b.force.y -= speed;
        } else if (v.y < 0) {
            b.force.y += speed;
        }
    });
})();