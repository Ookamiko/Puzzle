/*
version = 1.0.0_beta1
 */

class Sudoku {

	#ctx;
	#x = 0;
	#y = 0;
	#width = 0;
	#height = 0;
	#size = 9;
	#sizePow = 81;
	#sizeSqrt = 3;
	#boxes;
	#selectedBox = -1;
	#selectedRow = [];
	#selectedCol = [];
	#allowedNumbers;
	#solution = [];
	#grid = [];
	#loading = false;
	#loadingAnimFull = false;
	#loadingAnimAngle = 0;
	#update_state = false;
	finishEvent;

	constructor(ctx2d, x, y, boxW, boxH, size=9) {

		if (!this.#isAllowedSize(size)) {
			console.warn('Size not allowed. 4 or 9 expected. 9 taken as default.');
			size = 9;
		}

		this.#ctx = ctx2d;
		this.#x = x;
		this.#y = y;
		this.#size = size;
		this.#sizePow = Math.pow(size, 2);
		this.#sizeSqrt = Math.sqrt(size);
		this.#width = size * boxW;
		this.#height = size * boxH;
		this.#boxes = this.#generateBoxes(boxW, boxH);
		this.#selectedBox = -1;
		this.#allowedNumbers = this.#generateNumAllowed();
		this.#solution = [];
		this.#grid = [];
		this.#loading = true;
		this.#loadingAnimFull = false;
		this.#loadingAnimAngle = 0;
		this.#update_state = true;

		for (let i = 0 ; i < this.#sizePow ; i++) {
			this.#grid[i] = 0;
		}
	}

	#isAllowedSize(size) {
		return size == 4 || size == 9;
	}

	#generateBoxes(width, height) {
		let boxes = [];

		for (let r = 0; r < this.#size ; r++) {
			for (let c = 0; c < this.#size ; c++) {
				boxes[boxes.length] = 
					new Boxes(this.#ctx, this.#x + width * c, this.#y + height * r, width, height)
						.lock();
			}
		}

		return boxes;
	}

	#generateNumAllowed() {
		let result = [];
		for (let num = 1 ; num <= this.#size ; num++) {
			result.push(num);
		}

		return result;
	}

	#loadingAnim() {
		if (this.#loading) {
			let self = this;
			requestAnimationFrame(() => {
				self.#loadingAnim();
			});

			this.#ctx.clearRect(0, 0, this.#width, this.#height);
			this.#ctx.save();

			this.#ctx.lineWidth = 5;
			this.#ctx.translate(this.#width / 2, this.#height / 2);
			this.#ctx.beginPath();
			if (this.#loadingAnimFull) {
				this.#ctx.arc(0, 0, 50, this.#loadingAnimAngle, Math.PI * 2, false);
			} else {
				this.#ctx.arc(0, 0, 50, 0, this.#loadingAnimAngle, false);
			}
			this.#ctx.stroke();
			this.#ctx.closePath();

			this.#loadingAnimAngle += (Math.PI / 180) * 5;

			if (this.#loadingAnimAngle >= Math.PI * 2) {
				this.#loadingAnimFull = !this.#loadingAnimFull;
				this.#loadingAnimAngle = 0;
			}

			this.#ctx.translate(0, 100);
			this.#ctx.font = '50px sans-serif';
			this.#ctx.fillStyle = 'black';
			this.#ctx.textAlign = 'center';
			this.#ctx.fillText("Generating grid", 0, 0);

			this.#ctx.restore();
		}
	}

	isClicked(x, y) {
		return x > this.#x && x < this.#x + this.#width && y > this.#y && y < this.#y + this.#height;
	}

	clickBox(x, y) {
		for (let i = 0; i < this.#boxes.length ; i++) {
			if (this.#boxes[i].isClicked(x, y)) {
				this.selectBox(i);
				break;
			}
		};

		return this;
	}

	selectBox(index) {
		if (this.#selectedBox != index) {
			if (this.#selectedBox != -1) {
				this.#boxes[this.#selectedBox].unselect();

				this.#selectedRow.concat(this.#selectedCol).forEach((i) => {
					this.#boxes[i].unhighlight();
				});
			}

			this.#boxes[index].select();
			this.#selectedBox = index;

			[this.#selectedRow, this.#selectedCol] = this.#getRowCol(index);

			this.#selectedRow.concat(this.#selectedCol).forEach((i) => {
				this.#boxes[i].highlight();
			});

			this.#update_state = true;
		}

		return this;
	}

	unselectBox() {
		if (this.#selectedBox != -1) {
			this.#boxes[this.#selectedBox].unselect();
			this.#selectedBox = -1;

			this.#selectedRow.concat(this.#selectedCol).forEach((i) => {
				this.#boxes[i].unhighlight();
			});

			[this.#selectedRow, this.#selectedCol] = [[], []];

			this.#update_state = true;
		}

		return this;
	}

	treatKey(keyEvent, draw=true) {

		if (this.#loading) return this;

		let key = keyEvent.key;
		let performEvent = false;

		if (this.#allowedNumbers.includes(key) && this.#selectedBox != -1) {
			performEvent = true;

			if (keyEvent.altKey) {
				this.#boxes[this.#selectedBox].toggleHint(key);
				this.#update_state = true;
			} else {
				let row = Math.floor(this.#selectedBox / this.#size);
				let col = this.#selectedBox % this.#size;

				if (this.#validNumber(this.#grid, row, col, key)) {
					this.#grid[this.#selectedBox] = key;
					this.#boxes[this.#selectedBox].setText(key);
					this.#removeOverlapingHint(row, col, key);
					this.#update_state = true;
				}
			}
		} else if ((keyEvent.key == 'Backspace' || keyEvent.key == 'Delete') && this.#selectedBox != -1) {
			performEvent = true;
			this.#grid[this.#selectedBox] = 0;
			this.#boxes[this.#selectedBox].unsetText();

			this.#update_state = true;

		} else if (keyEvent.key.includes("Arrow")) {
			performEvent = true;
			let newSelect;
			if (this.#selectedBox == -1) {
				newSelect = this.#getNextAvailableBox(this.#boxes, -1, 1);
			} else {
				switch(keyEvent.key) {
					case "ArrowRight":
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, 1);
						break;
					case "ArrowDown":
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, this.#size);
						break;
					case "ArrowLeft":
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, -1);
						break;
					case "ArrowUp":
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, -this.#size);
						break;
				}
			}

			if (this.#selectedBox != newSelect) {
				this.selectBox(newSelect);
			}
		}

		if (performEvent) {
			keyEvent.stopPropagation();
		}

		return this;
	}

	isFinish() {
		for(let i = 0; i < this.#grid.length ; i++) {
			if (this.#grid[i] == 0) {
				return false;
			}
		}

		return true;
	}

	#getNextAvailableBox(boxes, start, jump) {
		let pos = start + jump;
		while (pos >= 0 && pos < boxes.length && boxes[pos].locked) {
			pos += jump;
		}

		return pos >= 0 && pos < boxes.length ? pos : start;
	}

	#getRowCol(index) {
		let row = Math.floor(index / this.#size);
		let col = index % this.#size;

		let pickRow = [];
		let pickCol = [];

		for (let i = 0 ; i < this.#size ; i++) {
			pickRow.push(row * this.#size + i);
			pickRow.push(i * this.#size + col);
		}

		return [pickRow, pickCol];
	}

	#validNumber(grid, row, col, test) {
		for (let i = 0 ; i < this.#size ; i++) {
			if (grid[row * this.#size + i] == test || grid[i * this.#size + col] == test) {
				return false;
			}
		}

		for (let r = row - (row % this.#sizeSqrt); r < row - (row % this.#sizeSqrt) + this.#sizeSqrt ; r++) {
			for (let c = col - (col % this.#sizeSqrt) ; c < col - (col % this.#sizeSqrt) + this.#sizeSqrt ; c++) {
				if (grid[r * this.#size + c] == test) {
					return false;
				}
			}
		}

		return true;
	}

	#removeOverlapingHint(row, col, value) {
		for (let i = 0 ; i < this.#size ; i++) {
			this.#boxes[row * this.#size + i].unsetHint(value);
			this.#boxes[[i * this.#size + col]].unsetHint(value);
		}

		for (let r = row - (row % this.#sizeSqrt); r < row - (row % this.#sizeSqrt) + this.#sizeSqrt ; r++) {
			for (let c = col - (col % this.#sizeSqrt) ; c < col - (col % this.#sizeSqrt) + this.#sizeSqrt ; c++) {
				this.#boxes[r * this.#size + c].unsetHint(value)
			}
		}
	}

	generateGrid() {
		this.#loading = true;
		this.#loadingAnim();
		const myWorker = new Worker("./js/worker.js");
		myWorker.postMessage([this.#size, this.#allowedNumbers, this.#grid]);

		let self = this;
		myWorker.onmessage = function(e) {
			let result = e.data;
			if (result != undefined) {
				self.#solution = result.solution;
				self.#grid = result.grid;
				for(let i = 0; i < self.#boxes.length ; i++) {
					if (self.#grid[i] == 0) {
						self.#boxes[i].unlock();
					} else {
						self.#boxes[i].lock();
						self.#boxes[i].setText(self.#grid[i]);
					}
				}

				self.#update_state = true;
				self.#loading = false;

				self.draw();
			} else {
				console.log('Error');
			}
		}
	}

	draw() {

		if (this.#loading) return this;

		if (!this.#update_state) return this;

		this.#update_state = false;

		this.#boxes.forEach(b => {
			b.draw();
		});

		this.#ctx.save();
		this.#ctx.translate(this.#x, this.#y);
		this.#ctx.lineWidth = 3;
		for(let x = 0; x < this.#sizeSqrt ; x++) {
			for (let y = 0; y < this.#sizeSqrt ; y++) {
				this.#ctx.strokeRect((this.#width / this.#sizeSqrt) * x, (this.#height / this.#sizeSqrt) * y, this.#width / this.#sizeSqrt, this.#height / this.#sizeSqrt);
			}
		}

		this.#ctx.restore();

		return this;
	}

	// Accessor
	
	get width() {
		return this.#width;
	}
	
	get height() {
		return this.#height;
	}
}