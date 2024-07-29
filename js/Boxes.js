/*
version = 1.0.0_beta1
 */

class Boxes {

	#ctx;
	#x = 0;
	#y = 0;
	#width = 0;
	#height = 0;
	#number = 0;
	#hint = [false, false, false, false, false, false, false, false, false];
	#locked = false;
	#selected = false;

	constructor(ctx2d, x, y, width, height) {
		this.#ctx = ctx2d;
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
	}

	isClicked(x, y) {
		return x > this.#x && x < this.#x + this.#width && y > this.#y && y < this.#y + this.#height;
	}

	toggleHint(num, draw=true) {
		this.#hint[num - 1] = !this.#hint[num - 1];

		if (this.#number != 0) {
			this.#hint[this.#number - 1] = true;
			this.#number = 0;
		}

		if (draw) {
			this.draw();
		}
	}

	setHint(num, draw=true) {
		this.#hint[num - 1] = true;

		if (this.#number != 0) {
			this.#hint[this.#number - 1] = true;
			this.#number = 0;
		}

		if (draw) {
			this.draw();
		}
	}

	unsetHint(num, draw=true) {
		this.#hint[num - 1] = false;

		if (draw) {
			this.draw();
		}
	}

	select(draw=true) {
		if (!this.#locked) {
			this.#selected = true;
			if (draw) {
				this.draw();
			}
		}
	}

	unselect(draw=true) {
		if (!this.#locked) {
			this.#selected = false;
			if (draw) {
				this.draw();
			}
		}
	}

	draw() {
		this.#ctx.save();

		this.#ctx.translate(this.#x, this.#y);

		this.#ctx.clearRect(0, 0, this.#width, this.#height);
		if (!this.#locked && this.#selected) {
			this.#ctx.fillStyle = "yellow";
			this.#ctx.fillRect(0, 0, this.#width, this.#height);
		}

		if (this.#number != 0) {
			if (this.#locked) {
				this.#ctx.fillStyle = "black";
			} else {
				this.#ctx.fillStyle = "blue";
			}
			this.#ctx.font = '75px sans-serif';
			this.#ctx.textAlign = 'center';

			let metrics = this.#ctx.measureText(this.#number);
			let fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

			this.#ctx.fillText(this.#number, 0 + this.#width / 2, (this.#height + fontHeight) / 2);
		} else {
			let size = this.#width / 3;
			this.#ctx.font = '20px sans-serif';
			this.#ctx.fillStyle = 'grey';
			this.#ctx.textAlign = 'center';
			for (let y = 0; y < 3 ; y++) {
				for (let x = 0 ; x < 3 ; x++) {
					if (this.#hint[y * 3 + x]) {
						this.#ctx.fillText((y * 3 + x) + 1, size / 2 + x * size, (y + 1) * size - 10);
					}
				}
			}
		}

		this.#ctx.strokeRect(0, 0, this.#width, this.#height);

		this.#ctx.restore();
	}

	// Accessor
	
	get number() {
		return this.#number;
	}

	set number(value) {
		this.#number = value;
	}

	get locked() {
		return this.#locked;
	}

	set locked(value) {
		this.#locked = value;
	}
}