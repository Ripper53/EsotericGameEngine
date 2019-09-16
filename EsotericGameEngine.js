class Esoteric {
    constructor(canvas) {
        const baseThis = this;
        // BEGIN RENDER
        this.Render = {};
        this.Render.canvas = canvas;
        this.Render.context = canvas.getContext("2d");
        this.Render.context.save();
        this.Render.clearCanvas = () => this.Render.context.clearRect(0, 0, this.Render.canvas.width, this.Render.canvas.height);
        this.Render.imageDirectory = "Images/";
        this.Render.getImage = path => {
            const img = new Image();
            img.src = this.Render.imageDirectory + path;
            return img;
        };

        this.Render.contextTo = transform => {
            this.Render.context.translate(transform.position.x, transform.position.y);
            this.Render.context.rotate(transform.rotation);
        };
    
        class Sprite extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(img, transform, offsetX = 0, offsetY = 0) {
                super(Sprite);
                this.image = img;
                this.transform = transform;
                this.offset = Esoteric.vector2(offsetX, offsetY);
            }
        }
        this.Render.Sprite = Sprite;
        
        class SpriteRenderSystem extends Esoteric.Base.System {
            constructor() {
                super(Sprite);
            }
            action(sprite) {
                baseThis.Render.contextTo(sprite.transform);
                baseThis.Render.context.drawImage(sprite.image, sprite.offset.x, sprite.offset.y, sprite.image.width, sprite.image.height);
                baseThis.Render.context.restore();
            }
        }
        this.Render.SpriteRenderSystem = SpriteRenderSystem;
        // END RENDER

        // BEGIN PHYSICS
        this._engine = Matter.Engine.create();
        this._world = this._engine.world;
        this._engineStarted = false;
        // END PHYSICS
    }
    get engine() {
        return this._engine;
    }
    get world() {
        return this._world;
    }
    get engineStarted() {
        return this._engineStarted;
    }

    startEngine(timeSteps = 1000 / 60) {
        if (this.engineStarted) return;
        this._startEngineInterval = setInterval(() => Matter.Engine.update(this.engine, timeSteps), timeSteps);
    }
    stopEngine() {
        if (!this.engineStarted) return;
        clearInterval(this._startEngineInterval);
    }
    
    createRectangle(x, y, w, h, options=undefined) {
        const rect = Matter.Bodies.rectangle(x, y, w, h, options);
        Matter.World.addBody(this.world, rect);
        return rect;
    }

    static vector2(x, y) {
        return {x: x, y: y};
    }

    static removeFromArray(array, value) {
        const index = array.findIndex(v => v === value);
        if (index > -1) array.splice(index, 1);
    }
}

(() => {
    class Entity {
        constructor(comp) {
            this._comp = comp;
            this._comp.ALL.push(this);
        }
        destroy() {
            Esoteric.removeFromArray(this._comp.ALL, this);
        }
    }

    class System {
        constructor(comp) {
            this._comp = comp;
        }
        run(arg) {
            for (let v of this._comp.ALL)
                this.action(v, arg);
        }
    }

    class Transform {
        constructor(x = 0, y = 0, r = 0) {
            this.position = Esoteric.vector2(x, y);
            this.rotation = r;
        }
    }

    Esoteric.Base = {
        Entity,
        System,
        Transform
    };
})();