function Sudoku(ctx2d, x, y, boxW, boxH) {
	this.ctx = ctx2d;
	this.x = x;
	this.y = y;
	this.width = 9 * boxW;
	this.height = 9 * boxH;
	this.boxes = generateBoxes(ctx2d, x, y, boxW, boxH);
	this.selectedBox = -1;
	this.allowedNumbers = [1,2,3,4,5,6,7,8,9];
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

Sudoku.prototype.draw = function(drawBoxes=false) {

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
				this.boxes[this.selectedBox].setNumber(key);
				if(this.isFinish() && this.finishEvent) {
					this.draw();
					this.finishEvent();
				}
			}
		}
	} else if ((keyEvent.key == 'Backspace' || keyEvent.key == 'Delete') && this.selectedBox != -1) {
		performEvent = true;
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
	for(let i = 0; i < this.boxes.length ; i++) {
		if (this.boxes[i].number == 0) {
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

function shuffle(array) {
	let size = array.length;

	for (let i = 0; i < size * 2; i++) {
		let randa = Math.floor(Math.random() * size);
		let randb = Math.floor(Math.random() * size);

		[array[randa], array[randb]] = [array[randb], array[randa]];
	}
}

function validNumber(cases, row, col, test) {
	for (let i = 0 ; i < 9 ; i++) {
		if (cases[row * 9 + i].number == test || cases[i * 9 + col].number == test) {
			return false;
		}
	}

	for (let r = row - (row % 3); r < row - (row % 3) + 3 ; r++) {
		for (let c = col - (col % 3) ; c < col - (col % 3) + 3 ; c++) {
			if (cases[r * 9 + c].number == test) {
				return false;
			}
		}
	}

	return true;
}

function recursiveGen(boxes, numbers, index=0) {
	if (index >= boxes.length) {
		return true;
	}

	let row = Math.floor(index / 9);
	let col = index % 9;
	shuffle(numbers);

	for (let i = 0 ; i < numbers.length ; i++) {
		let test = numbers[i];
		if (validNumber(boxes, row, col, test)) {
			boxes[index].number = test;
			if (recursiveGen(boxes, numbers, index+1)) {
				return true;
			} else {
				boxes[index].number = 0
			}
		}
	}

	return false;
}

function solveGrid(boxes, numbers, index=0) {
	while(index < boxes.length && boxes[index].number != 0) {
		index += 1;
	}

	if (index >= boxes.length) {
		return 1;
	}

	let solution = 0;
	let row = Math.floor(index / 9);
	let col = index % 9;

	for (let j = 0 ; j < numbers.length ; j++) {
		if (validNumber(boxes, row, col, numbers[j])) {
			let copy = structuredClone(boxes);
			copy[index].number = numbers[j];
			solution += solveGrid(copy, numbers, index+1);
		}
	}

	return solution;
}

function simplifyBoxes(boxes) {
	let copy = [];
	boxes.forEach(b => {
		copy[copy.length] = {number: b.number};
	});

	return copy;
}

function recursiveRemove(grid, attemp) {
	while (attemp > 0) {

		let index = Math.floor(Math.random() * grid.boxes.length);
		while (grid.boxes[index].number == 0) {
			index = Math.floor(Math.random() * grid.boxes.length);
		}

		let remember = grid.boxes[index].number;
		grid.boxes[index].number = 0;
		let count = solveGrid(simplifyBoxes(grid.boxes), grid.allowedNumbers);

		if (count != 1) {
			attemp -= 1;
			grid.boxes[index].number = remember;
		}
	}
}

Sudoku.prototype.generateGrid = function() {
	if(recursiveGen(this.boxes, this.allowedNumbers.slice())) {
		recursiveRemove(this, 1);
		this.boxes.forEach(b => {
			b.locked = b.number != 0;
		});
		this.draw(true);
	} else {
		return false;
	}

	return true;
}