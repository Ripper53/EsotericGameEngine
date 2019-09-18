class Esoteric {
    constructor(canvas) {
        const baseThis = this;
        // BEGIN RENDER
        this.Render = {};
        this.Render.canvas = canvas;
        this.Render.context = canvas.getContext("2d");
        this.Render.clearCanvas = () => this.Render.context.clearRect(0, 0, this.Render.canvas.width, this.Render.canvas.height);
        this.Render.resetContext = () => this.Render.context.setTransform(1, 0, 0, 1, 0, 0);
        this.Render.imageDirectory = "Images/";
        this.Render.getImage = path => {
            const img = new Image();
            img.src = this.Render.imageDirectory + path;
            return img;
        };

        this.Render.contextToTransform = transform => {
            this.Render.context.translate(transform.position.x, transform.position.y);
            this.Render.context.rotate(transform.rotation);
        };

        class Camera extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(transform) {
                super(Camera);
                this.transform = transform;
                this._t = new Esoteric.Base.Transform();
            }

            getTransformFromSprite(sprite) {
                this._t.position.x = sprite.transform.position.x - baseThis.Render.Camera.main.transform.position.x + (baseThis.Render.canvas.width / 2);
                this._t.position.y = sprite.transform.position.y - baseThis.Render.Camera.main.transform.position.y + (baseThis.Render.canvas.height / 2);
                this._t.rotation = sprite.transform.rotation - baseThis.Render.Camera.main.transform.rotation;
                return this._t;
            }

            getTransformFromBody(body) {
                this._t.position.x = -baseThis.Render.Camera.main.transform.position.x + (baseThis.Render.canvas.width / 2);
                this._t.position.y = -baseThis.Render.Camera.main.transform.position.y + (baseThis.Render.canvas.height / 2);
                this._t.rotation = body.angle - baseThis.Render.Camera.main.transform.rotation;
                return this._t;
            }
        }
        this.Render.Camera = Camera;
        this.Render.Camera.main = new Camera(new Esoteric.Base.Transform());
    
        class Sprite extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(img, transform, offsetX = 0, offsetY = 0) {
                super(Sprite);
                this.image = img;
                this.transform = transform;
                this.offset = Esoteric.vector2(offsetX, offsetY);
                this.scale = Esoteric.vector2(1, 1);
            }
        }
        this.Render.Sprite = Sprite;
        
        class SpriteRenderSystem extends Esoteric.Base.System {
            constructor() {
                super(Sprite);
                this._t = new Esoteric.Base.Transform();
            }
            action(sprite) {
                baseThis.Render.contextToTransform(baseThis.Render.Camera.main.getTransformFromSprite(sprite));
                baseThis.Render.context.scale(sprite.scale.x, sprite.scale.y);
                baseThis.Render.context.drawImage(sprite.image, sprite.offset.x, sprite.offset.y, sprite.image.width, sprite.image.height);
                baseThis.Render.resetContext();
            }
        }
        this.Render.SpriteRenderSystem = SpriteRenderSystem;
        // END RENDER

        // BEGIN WIREFRAME RENDER
        class WireframeRenderSystem {
            constructor() { }
            run() {
                for (let b of baseThis.world.bodies)
                    this.action(b);
            }
            action(body) {
                if (body.vertices.length > 0) {
                    const ctx = baseThis.Render.context,
                          offset = baseThis.Render.Camera.main.getTransformFromBody(body),
                          p = offset.position,
                          first = body.vertices[0];
                    ctx.beginPath();
                    ctx.moveTo(first.x + p.x, first.y + p.y);
                    for (let i = 1; i < body.vertices.length; i++) {
                        const v = body.vertices[i];
                        ctx.lineTo(v.x + p.x, v.y + p.y);
                    }
                    ctx.lineTo(first.x + p.x, first.y + p.y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
        this.Render.WireframeRenderSystem = WireframeRenderSystem;
        // END WIREFRAME RENDER

        // BEGIN PHYSICS
        this._engine = Matter.Engine.create();
        this._world = this._engine.world;
        this._engineStarted = false;
        // END PHYSICS

        // BEGIN INPUT
        class Input extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(condition) {
                super(Input);
                this.condition = condition;
            }
            get value() {
                return this.condition.value;
            }
        }
        this.Input = Input;
        class Condition {
            constructor(keyCode) {
                this.keyCode = keyCode;
                this.on = false;
                this._onInput = (e) => {
                    switch (e.keyCode) {
                        case this.keyCode:
                            this.on = true;
                            return;
                    }
                };
                this._offInput = (e) => {
                    switch (e.keyCode) {
                        case this.keyCode:
                            this.on = false;
                            return;
                    }
                };
                window.addEventListener('keydown', this._onInput);
                window.addEventListener('keyup', this._offInput);
            }
            destroy() {
                window.removeEventListener('keydown', this._onInput);
                window.removeEventListener('keyup', this._offInput);
            }
        }
        class NumberCondition {
            constructor(keyCodeUp, keyCodeDown) {
                this.conditionUp = new Condition(keyCodeUp);
                this.conditionDown = new Condition(keyCodeDown);
                this.value = 0;
                this.rise = 1;
                this.gravity = 1;
            }
            upOn() {
                this.value += this.rise;
                if (this.value > 1) this.value = 1;
            }
            downOn() {
                this.value -= this.rise;
                if (this.value < -1) this.value = -1;
            }
            off() {
                if (this.value > 0)
                    this.value -= this.gravity;
                else if (this.value < 0)
                    this.value += this.gravity;
            }
            action() {
                if (this.conditionUp.on) {
                    this.upOn();
                } else if (this.conditionDown.on) {
                    this.downOn();
                } else {
                    this.off();
                }
            }
            destroy() {
                this.conditionUp.destroy();
                this.conditionDown.destroy();
            }
        }
        Input.NumberCondition = NumberCondition;
        Input.createNumberInput = (keyCodeUp, keyCodeDown) => new Input(new NumberCondition(keyCodeUp, keyCodeDown));
        class Vector2Condition {
            constructor(keyCodeUpX, keyCodeDownX, keyCodeUpY, keyCodeDownY) {
                this.conditionX = new NumberCondition(keyCodeUpX, keyCodeDownX);
                this.conditionY = new NumberCondition(keyCodeUpY, keyCodeDownY);
                this.value = Esoteric.vector2(0, 0);
            }
            action() {
                this.conditionX.action();
                this.value.x = this.conditionX.value;
                this.conditionY.action();
                this.value.y = this.conditionY.value;
            }
            destroy() {
                this.valueX.destroy();
                this.valueY.destroy();
            }
        }
        Input.Vector2Condition = Vector2Condition;
        Input.createVector2Input = (keyCodeUpX, keyCodeDownX, keyCodeUpY, keyCodeDownY) => new Input(new Vector2Condition(keyCodeUpX, keyCodeDownX, keyCodeUpY, keyCodeDownY));
    
        class InputSystem extends Esoteric.Base.System {
            constructor() {
                super(Input);
            }
            action(input) {
                input.condition.action();
            }
        }
        this.Input.InputSystem = InputSystem;
        // END INPUT
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
    
    createRectangle(x, y, w, h, options = undefined) {
        const rect = Matter.Bodies.rectangle(x, y, w, h, options);
        Matter.Composite.addBody(this.world, rect);
        return rect;
    }

    createCircle(x, y, r, options = undefined) {
        const circ = Matter.Bodies.circle(x, y, r, options);
        Matter.Composite.addBody(this.world, circ);
        return circ;
    }

    destroyBody(body) {
        Matter.Composite.remove(this.world, body);
    }

    addEventListener(eventName, action) {
        Matter.Events.on(this.engine, eventName, action);
    }

    removeEventListener(eventName, action) {
        Matter.Events.off(this.engine, eventName, action);
    }

    triggerEvents(eventName) {
        Matter.Events.trigger(this.engine, eventName);
    }

    static vector2(x, y) {
        return {x: x, y: y};
    }

    static removeFromArray(array, value) {
        const index = array.findIndex(v => v === value);
        if (index > -1) array.splice(index, 1);
    }

    static hasFlag(value, flag) {
        return (value & flag) === flag;
    }

    static hasOneFlag(value, flag) {
        return (value & flag) !== 0;
    }

    static onFlag(value, flag) {
        return value | flag;
    }

    static offFlag(value, flag) {
        return Esoteric.hasFlag(value, flag) ? (value ^ flag) : value;
    }

    static lerp(value, target, percentage) {
        return ((target - value) * percentage) + value;
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