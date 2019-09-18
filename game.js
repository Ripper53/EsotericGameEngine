class Game {
    constructor(eso) {
        this.eso = eso;
        const baseEso = this.eso;
        class Rigidbody {
            constructor(body) {
                this.body = body;
            }
            destroy() {
                baseEso.destroyBody(this.body);
            }
        }
        
        class Ground extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(body) {
                super(Ground);
                this.rigidbody = new Rigidbody(body);  
            }
            get body() {
                return this.rigidbody.body;
            }
            destroy() {
                super.destroy();
                this.rigidbody.destroy();
            }
        }

        class OnewayGround extends Ground {
            constructor(body) {
                super(body);
                body.collisionFilter.category = 2;
            }
        }

        class Character extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(x, y, r, image) {
                super(Character);
                this.transform = new Esoteric.Base.Transform(x, y);
                this.sprite = new Eso.Render.Sprite(image, this.transform, -image.width / 2, -image.height / 2);
                this.rigidbody = new Rigidbody(Eso.createCircle(x, y, r, {
                    inertia: Infinity,
                    friction: 0,
                    frictionStatic: 0,
                    frictionAir: 0
                }));
                this.transform.position = this.rigidbody.body.position;
                this.ground = {
                    friction: 0.25,
                    sensor: Eso.createCircle(x, y, r / 2, {
                        isStatic: true,
                        isSensor: true
                    }),
                    offset: Esoteric.vector2(0, 15),
                    check: () => {
                        for (let g of Ground.ALL) {
                            if (Matter.SAT.collides(this.ground.sensor, g.body).collided)
                                return true;
                        }
                        return false;
                    }
                };
                this.speed = 0.01;
                this.jumpForce = Esoteric.vector2(0.05, 0.2);
                this.stunned = false;
                this.body.collisionFilter.mask ^= 2;
            }

            get body() {
                return this.rigidbody.body;
            }

            goingDown() {
                return this.body.velocity.y > -0.01;
            }

            isGrounded() {
                return this.goingDown() && this.ground.check();
            }

            canJump() {
                return this.isGrounded();
            }

            jump(x) {
                if (this.stunned) return;
                Matter.Body.setVelocity(this.body, Esoteric.vector2(0, 0));
                this.body.force.y -= this.jumpForce.y;
                if (x > 0) {
                    this.body.force.x += this.jumpForce.x;
                } else if (x < 0) {
                    this.body.force.x -= this.jumpForce.x;
                }
            }

            addMovement(x) {
                if (this.stunned) return;
                if (x > 0)
                    this.body.force.x += this.speed;
                else if (x < 0)
                    this.body.force.x -= this.speed;
            }
            
            destroy() {
                super.destroy();
                this.rigidbody.destroy();
            }
        }
        class CharacterSystem extends Esoteric.Base.System {
            constructor() {
                super(Character);
            }
        
            action(character) {
                const p = character.transform.position, o = character.ground.offset;
                Matter.Body.setPosition(character.ground.sensor, Esoteric.vector2(p.x + o.x, p.y + o.y));
                const b = character.body;
                b.frictionAir = character.isGrounded() ? character.ground.friction : 0;
                b.collisionFilter.mask = character.goingDown() ? Esoteric.onFlag(b.collisionFilter.mask, 2) : Esoteric.offFlag(b.collisionFilter.mask, 2);
            }
        }

        class AI extends Esoteric.Base.Entity {
            static ALL = [];
            constructor(character) {
                this.character = character;
            }

            action() { }

            destroy() {
                super.destroy();
                this.character.destroy();
            }
        }

        class AISystem extends Esoteric.Base.System {
            constructor() {
                super(AI);
            }

            action(ai) {
                ai.action();
            }
        }

        this.Base = {
            Ground,
            OnewayGround,
            Character,
            CharacterSystem,
            AI,
            AISystem
        };
    }

}
