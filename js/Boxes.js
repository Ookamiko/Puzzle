/*
version = 1.0.0_beta1
 */

class Boxes {

	#ctx;
	#x = 0;
	#y = 0;
	#width = 0;
	#height = 0;
	#text = undefined;
	#hint = [false, false, false, false, false, false, false, false, false];
	#locked = false;
	#selected = false;
	#update_state = false;

	constructor(ctx2d, x, y, width, height) {
		this.#ctx = ctx2d;
		this.#x = x;
		this.#y = y;
		this.#width = width;
		this.#height = height;
		this.#update_state = true;
	}

	isClicked(x, y) {
		return x > this.#x && x < this.#x + this.#width && y > this.#y && y < this.#y + this.#height;
	}

	toggleHint(num) {
		this.#hint[num - 1] = !this.#hint[num - 1];

		if (this.#text) {
			this.#text = undefined;
		}

		this.#update_state = true;

		return this;
	}

	setHint(num) {
		if (!this.#hint[num - 1]) {
			this.#hint[num - 1] = true;

			if (this.#text) {
				this.#text = undefined;
			}

			this.#update_state = true;
		}

		return this;
	}

	unsetHint(num) {
		if (this.#hint[num - 1]) {
			this.#hint[num - 1] = false;
			this.#update_state = true;
		}

		return this;
	}

	setText(text) {
		if (this.#text != text) {
			this.#text = text;

			this.#update_state = true;
		}

		return this;
	}

	unsetText() {
		if (this.#text) {
			this.#text = undefined;

			this.#update_state = true;
		}

		return this;
	}

	lock() {
		if (!this.#locked) {
			this.#locked = true;
			this.#selected = false;

			this.#update_state = true;
		}

		return this;
	}

	unlock() {
		if (this.#locked) {
			this.#locked = false;

			this.#update_state = true;
		}

		return this;
	}

	select() {
		if (!this.#locked) {
			if (!this.#selected) {
				this.#selected = true;
				this.#update_state = true;
			}
		}

		return this;
	}

	unselect() {
		if (!this.#locked) {
			if (this.#selected) {
				this.#selected = false;
				this.#update_state = true;
			}
		}

		return this;
	}

	draw() {
		if (!this.#update_state) return this;

		this.#update_state = false;

		this.#ctx.save();

		this.#ctx.translate(this.#x, this.#y);

		this.#ctx.clearRect(0, 0, this.#width, this.#height);
		if (!this.#locked && this.#selected) {
			this.#ctx.fillStyle = "yellow";
			this.#ctx.fillRect(0, 0, this.#width, this.#height);
		}

		if (this.#text) {
			if (this.#locked) {
				this.#ctx.fillStyle = "black";
			} else {
				this.#ctx.fillStyle = "blue";
			}
			this.#ctx.font = '75px sans-serif';
			this.#ctx.textAlign = 'center';

			let metrics = this.#ctx.measureText(this.#text);
			let fontHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

			this.#ctx.fillText(this.#text, 0 + this.#width / 2, (this.#height + fontHeight) / 2);
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

		return this;
	}

	// Accessor
	
	get text() {
		return this.#text;
	}

	get locked() {
		return this.#locked;
	}
}