let inc = 0.1; // Noise increment
let zoff = 0; // Third noise dimension (time)
let cols, rows;
let scl = 10; // Scale of the flow field
let flowField;
let particles = [];

class Particle {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = 2;
        this.trail = []; // Stores past positions for fading
        this.trailLength = 80; // Controls trail fade duration
    }

    applyForce(force) {
        this.acc.add(force);
    }

    follow(vectors) {
        let x = floor(this.pos.x / scl);
        let y = floor(this.pos.y / scl);
        let index = x + y * cols;
        let force = vectors[index];
        this.applyForce(force);
    }

    update() {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Store position in trail
        this.trail.push(this.pos.copy());
        if (this.trail.length > this.trailLength) {
            this.trail.shift(); // Remove oldest point
        }
    }

    edges() {
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.y > height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = height;
    }

    show() {
        noFill();
        for (let i = 0; i < this.trail.length; i++) {
            let alpha = map(i, 0, this.trail.length, 0, 255); // Gradual fade
            stroke(173, 216, 230, alpha); // Light blue stroke
            strokeWeight(5);
            point(this.trail[i].x, this.trail[i].y);
        }
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    cols = floor(width / scl);
    rows = floor(height / scl);
    flowField = new Array(cols * rows);

    for (let i = 0; i < 100; i++) { // Number of particles
        particles.push(new Particle());
    }
}

function draw() {
    // Semi-transparent white background for fading effect
    background(255); // Adjust alpha (10 = slow fade, 50 = fast fade)

    let yoff = 0;
    for (let y = 0; y < rows; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let index = x + y * cols;
            let angle = noise(xoff, yoff, zoff) * TWO_PI * 4; 
            let v = p5.Vector.fromAngle(angle);
            flowField[index] = v;
            xoff += inc;
        }
        yoff += inc;
    }
    zoff += 0.002;

    for (let particle of particles) {
        particle.follow(flowField);
        particle.update();
        particle.edges();
        particle.show();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cols = floor(width / scl);
    rows = floor(height / scl);
    flowField = new Array(cols * rows);
}
