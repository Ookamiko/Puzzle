function Boxes(x, y, w, h, ctx2d) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.number = '';
	this.hint = [false, false, false, false, false, false, false, false, false];
	this.locked = false;
	this.selected = false;
	this.ctx = ctx2d;
}

Boxes.prototype.draw = function() {
	this.ctx.save();

	this.ctx.translate(this.x, this.y);

	this.ctx.clearRect(0, 0, this.width, this.height);
	if (!this.locked && this.selected) {
		this.ctx.fillStyle = "yellow";
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	if (this.number != '') {
		if (this.locked) {
			this.ctx.fillStyle = "black";
		} else {
			this.ctx.fillStyle = "blue";
		}
		this.ctx.font = '75px sans-serif';
		this.ctx.textAlign = 'center';
		this.ctx.fillText(this.number, 0 + this.width / 2, this.height - 25);
	} else {
		let size = this.width / 3;
		this.ctx.font = '20px sans-serif';
		this.ctx.fillStyle = 'grey';
		this.ctx.textAlign = 'center';
		for (let y = 0; y < 3 ; y++) {
			for (let x = 0 ; x < 3 ; x++) {
				if (this.hint[y * 3 + x]) {
					this.ctx.fillText((y * 3 + x) + 1, size / 2 + x * size, (y + 1) * size - 10);
				}
			}
		}
	}

	this.ctx.strokeRect(0, 0, this.width, this.height);

	this.ctx.restore();
}

Boxes.prototype.isClicked = function(x, y) {
	return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
}

Boxes.prototype.setNumber = function(num, draw=true) {
	this.number = num;

	for(let i = 0; i < this.hint.length; i++) {
		this.hint[i] = false;
	}

	if (draw) {
		this.draw();
	}
}

Boxes.prototype.unsetNumber = function(draw=true) {
	this.number = '';
	if (draw) {
		this.draw();
	}
}

Boxes.prototype.toggleHint = function(num, draw=true) {
	this.hint[num - 1] = !this.hint[num - 1];

	if (this.number != '') {
		this.hint[this.number - 1] = true;
		this.number = '';
	}

	if (draw) {
		this.draw();
	}
}

Boxes.prototype.setHint = function(num, draw=true) {
	this.hint[num - 1] = true;

	if (this.number != '') {
		this.hint[this.number - 1] = true;
		this.number = '';
	}

	if (draw) {
		this.draw();
	}
}

Boxes.prototype.unsetHint = function(num, draw=true) {
	this.hint[num - 1] = false;

	if (draw) {
		this.draw();
	}
}

Boxes.prototype.select = function(draw=true) {
	if (!this.locked) {
		this.selected = true;
		if (draw) {
			this.draw();
		}
	}
}

Boxes.prototype.unselect = function(draw=true) {
	if (!this.locked) {
		this.selected = false;
		if (draw) {
			this.draw();
		}
	}
}