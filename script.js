const Eso = new Esoteric(document.getElementById("game"));

const spriteRenderSystem = new Eso.Render.SpriteRenderSystem();
function render() {
    Eso.Render.clearCanvas();
    spriteRenderSystem.run();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

Eso.startEngine();

(() => {
    const t = new Esoteric.Base.Transform();
    const s = new Eso.Render.Sprite(Eso.Render.getImage("Characters/Player.png"), t);
    const b = Eso.createRectangle(0, 0, 50, 50);
    t.position = b.position;
    s.image.width = 50;
    s.image.height = 50;
})();