function Sudoku(ctx2d, x, y, boxW, boxH) {
	this.ctx = ctx2d;
	this.x = x;
	this.y = y;
	this.width = 9 * boxW;
	this.height = 9 * boxH;
	this.boxes = generateBoxes(ctx2d, x, y, boxW, boxH);
	this.selectedBox = -1;
	this.allowedNumbers = [1,2,3,4,5,6,7,8,9];
	this.solution = [];
	this.grid = [];
	this.loading = true;
	this.loadingAnimFull = false;
	this.loadingAnimAngle = 0;

	for (let i = 0 ; i < 81 ; i++) {
		this.grid[i] = 0;
	}
}

function generateBoxes(ctx, x, y, width, height) {
	let boxes = [];

	for (let r = 0; r < 9 ; r++) {
		for (let c = 0; c < 9 ; c++) {
			let tmp = new Boxes(ctx, x + width * c, y + height * r, width, height);
			tmp.locked = true;
			boxes[boxes.length] = tmp;
		}
	}

	return boxes;
}

Sudoku.prototype.loadingAnim = function() {
	if (this.loading) {
		let self = this;
		requestAnimationFrame(() => {
			self.loadingAnim();
		});

		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.save();

		this.ctx.lineWidth = 5;
		this.ctx.translate(this.width / 2, this.height / 2);
		this.ctx.beginPath();
		if (this.loadingAnimFull) {
			this.ctx.arc(0, 0, 50, this.loadingAnimAngle, Math.PI * 2, false);
		} else {
			this.ctx.arc(0, 0, 50, 0, this.loadingAnimAngle, false);
		}
		this.ctx.stroke();
		this.ctx.closePath();

		this.loadingAnimAngle += (Math.PI / 180) * 5;

		if (this.loadingAnimAngle >= Math.PI * 2) {
			this.loadingAnimFull = !this.loadingAnimFull;
			this.loadingAnimAngle = 0;
		}

		this.ctx.translate(0, 100);
		this.ctx.font = '50px sans-serif';
		this.ctx.fillStyle = 'black';
		this.ctx.textAlign = 'center';
		this.ctx.fillText("Generating grid", 0, 0);

		this.ctx.restore();
	}
}

Sudoku.prototype.draw = function(drawBoxes=false) {

	if (this.loading) {
		return;
	}

	if (drawBoxes) {
		this.boxes.forEach(b => {
			b.draw();
		});
	}

	this.ctx.save();
	this.ctx.translate(this.x, this.y);
	this.ctx.lineWidth = 3;
	for(let x = 0; x < 3 ; x++) {
		for (let y = 0; y < 3 ; y++) {
			this.ctx.strokeRect((this.width / 3) * x, (this.height / 3) * y, this.width / 3, this.height / 3);
		}
	}

	this.ctx.restore();
}

Sudoku.prototype.isClicked = function(x, y) {
	return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
}

Sudoku.prototype.clickBox = function(x, y, draw=true) {
	for (let i = 0; i < this.boxes.length ; i++) {
		if (this.boxes[i].isClicked(x, y)) {
			this.selectBox(i);
			break;
		}
	};
}

Sudoku.prototype.selectBox = function(index, draw=true) {
	if (this.selectedBox != -1) {
		this.boxes[this.selectedBox].unselect();
	}

	this.boxes[index].select();
	this.selectedBox = index;

	if (draw) {
		this.draw();
	}
}

Sudoku.prototype.unselectBox = function(draw=true) {
	if (this.selectedBox != -1) {
		this.boxes[this.selectedBox].unselect();
		this.selectedBox = -1;
	}

	if (draw) {
		this.draw();
	}
}

Sudoku.prototype.treatKey = function(keyEvent, draw=true) {

	if (this.loading) {
		return;
	}

	let key = Number(keyEvent.key);
	let performEvent = false;
	if (key && this.selectedBox != -1) {
		performEvent = true;
		if (keyEvent.altKey) {
			this.boxes[this.selectedBox].toggleHint(key);
		} else {
			let row = Math.floor(this.selectedBox / 9);
			let col = this.selectedBox % 9;
			if (validNumber(this.boxes, row, col, key)) {
				this.grid[this.selectedBox] = key;
				this.boxes[this.selectedBox].setNumber(key);
				if(this.isFinish() && this.finishEvent) {
					this.draw();
					this.finishEvent();
				}
			}
		}
	} else if ((keyEvent.key == 'Backspace' || keyEvent.key == 'Delete') && this.selectedBox != -1) {
		performEvent = true;
		this.grid[this.selectedBox] = 0;
		this.boxes[this.selectedBox].unsetNumber();
	} else if (keyEvent.key.includes("Arrow")) {
		performEvent = true;
		let newSelect;
		if (this.selectedBox == -1) {
			newSelect = getNextAvailableBox(this.boxes, -1, 1);
		} else {
			switch(keyEvent.key) {
				case "ArrowRight":
					newSelect = getNextAvailableBox(this.boxes, this.selectedBox, 1);
					break;
				case "ArrowDown":
					newSelect = getNextAvailableBox(this.boxes, this.selectedBox, 9);
					break;
				case "ArrowLeft":
					newSelect = getNextAvailableBox(this.boxes, this.selectedBox, -1);
					break;
				case "ArrowUp":
					newSelect = getNextAvailableBox(this.boxes, this.selectedBox, -9);
					break;
			}
		}

		if (this.selectedBox != newSelect) {
			this.selectBox(newSelect);
		}
	}

	if (performEvent) {
		keyEvent.stopPropagation();
	}

	if (draw) {
		this.draw();
	}
}

Sudoku.prototype.isFinish = function() {
	for(let i = 0; i < this.grid.length ; i++) {
		if (this.grid[i] == 0) {
			return false;
		}
	}

	return true;
}

function getNextAvailableBox(boxes, start, jump) {
	let pos = start + jump;
	while (pos >= 0 && pos < boxes.length && boxes[pos].locked) {
		pos += jump;
	}

	return pos >= 0 && pos < boxes.length ? pos : start;
}

function validNumber(grid, row, col, test) {
	for (let i = 0 ; i < 9 ; i++) {
		if (grid[row * 9 + i] == test || grid[i * 9 + col] == test) {
			return false;
		}
	}

	for (let r = row - (row % 3); r < row - (row % 3) + 3 ; r++) {
		for (let c = col - (col % 3) ; c < col - (col % 3) + 3 ; c++) {
			if (grid[r * 9 + c] == test) {
				return false;
			}
		}
	}

	return true;
}

Sudoku.prototype.generateGrid = function() {
	this.loading = true;
	this.loadingAnim();
	const myWorker = new Worker("./js/worker.js");
	myWorker.postMessage([]);

	let self = this;
	myWorker.onmessage = function(e) {
		let result = e.data;
		if (result != undefined) {
			self.solution = result.solution;
			self.grid = result.grid;
			for(let i = 0; i < self.boxes.length ; i++) {
				self.boxes[i].locked = self.grid[i] != 0;
				self.boxes[i].number = self.grid[i];
			}

			self.loading = false;

			self.draw(true);
		} else {
			console.log('Error');
		}
	}
};