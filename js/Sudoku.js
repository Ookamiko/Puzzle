/*
version = 1.0.0_beta1
 */

class Sudoku {

	#ctx;
	#x = 0;
	#y = 0;
	#width = 0;
	#height = 0;
	#boxes;
	#selectedBox = -1;
	#allowedNumbers;
	#solution = [];
	#grid = [];
	#loading = false;
	#loadingAnimFull = false;
	#loadingAnimAngle = 0;
	finishEvent;

	constructor(ctx2d, x, y, boxW, boxH) {
		this.#ctx = ctx2d;
		this.#x = x;
		this.#y = y;
		this.#width = 9 * boxW;
		this.#height = 9 * boxH;
		this.#boxes = this.#generateBoxes(ctx2d, x, y, boxW, boxH);
		this.#selectedBox = -1;
		this.#allowedNumbers = [1,2,3,4,5,6,7,8,9];
		this.#solution = [];
		this.#grid = [];
		this.#loading = true;
		this.#loadingAnimFull = false;
		this.#loadingAnimAngle = 0;

		for (let i = 0 ; i < 81 ; i++) {
			this.#grid[i] = 0;
		}
	}

	#generateBoxes(ctx, x, y, width, height) {
		let boxes = [];

		for (let r = 0; r < 9 ; r++) {
			for (let c = 0; c < 9 ; c++) {
				boxes[boxes.length] = 
					new Boxes(ctx, x + width * c, y + height * r, width, height)
						.lock();
			}
		}

		return boxes;
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

	clickBox(x, y, draw=true) {
		for (let i = 0; i < this.#boxes.length ; i++) {
			if (this.#boxes[i].isClicked(x, y)) {
				this.selectBox(i);
				break;
			}
		};
	}

	selectBox(index, draw=true) {
		if (this.#selectedBox != -1) {
			this.#boxes[this.#selectedBox]
				.unselect()
				.draw();
		}

		this.#boxes[index]
			.select()
			.draw();

		this.#selectedBox = index;

		if (draw) {
			this.draw();
		}
	}

	unselectBox(draw=true) {
		if (this.#selectedBox != -1) {
			this.#boxes[this.#selectedBox]
				.unselect()
				.draw();
			this.#selectedBox = -1;
		}

		if (draw) {
			this.draw();
		}
	}

	treatKey(keyEvent, draw=true) {

		if (this.#loading) {
			return;
		}

		let key = Number(keyEvent.key);
		let performEvent = false;
		if (key && this.#selectedBox != -1) {
			performEvent = true;
			if (keyEvent.altKey) {
				this.#boxes[this.#selectedBox]
					.toggleHint(key)
					.draw();
			} else {
				let row = Math.floor(this.#selectedBox / 9);
				let col = this.#selectedBox % 9;
				if (this.#validNumber(this.#grid, row, col, key)) {
					this.#grid[this.#selectedBox] = key;
					this.#boxes[this.#selectedBox]
						.setText(key)
						.draw();
					if(this.isFinish() && this.finishEvent) {
						this.draw();
						this.finishEvent();
					}
				}
			}
		} else if ((keyEvent.key == 'Backspace' || keyEvent.key == 'Delete') && this.#selectedBox != -1) {
			performEvent = true;
			this.#grid[this.#selectedBox] = 0;
			this.#boxes[this.#selectedBox]
				.unsetText()
				.draw();
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
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, 9);
						break;
					case "ArrowLeft":
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, -1);
						break;
					case "ArrowUp":
						newSelect = this.#getNextAvailableBox(this.#boxes, this.#selectedBox, -9);
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

		if (draw) {
			this.draw();
		}
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

	#validNumber(grid, row, col, test) {
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

	generateGrid() {
		this.#loading = true;
		this.#loadingAnim();
		const myWorker = new Worker("./js/worker.js");
		myWorker.postMessage([]);

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

				self.#loading = false;

				self.draw(true);
			} else {
				console.log('Error');
			}
		}
	}

	draw(drawBoxes=false) {

		if (this.#loading) {
			return;
		}

		if (drawBoxes) {
			this.#boxes.forEach(b => {
				b.draw();
			});
		}

		this.#ctx.save();
		this.#ctx.translate(this.#x, this.#y);
		this.#ctx.lineWidth = 3;
		for(let x = 0; x < 3 ; x++) {
			for (let y = 0; y < 3 ; y++) {
				this.#ctx.strokeRect((this.#width / 3) * x, (this.#height / 3) * y, this.#width / 3, this.#height / 3);
			}
		}

		this.#ctx.restore();
	}

	// Accessor
	
	get width() {
		return this.#width;
	}
	
	get height() {
		return this.#height;
	}
}