
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
                this.jumpForce = Esoteric.vector2(0.05, 0.2);
                this.stunned = false;
            }

            get body() {
                return this.rigidbody.body;
            }

            isGrounded() {
                return this.body.velocity.y > -0.01 && this.ground.check();
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
                this.body.force.x += x;
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
                character.body.frictionAir = character.isGrounded() ? character.ground.friction : 0;
            }
        }
        this.Base = {
            Ground,
            Character,
            CharacterSystem
        };
    }

}
