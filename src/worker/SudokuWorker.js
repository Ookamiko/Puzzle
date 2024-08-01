/*
version = 1.0.0_beta2
 */

function shuffle(array) {
	let size = array.length;

	for (let i = 0; i < size * 2; i++) {
		let randa = Math.floor(Math.random() * size);
		let randb = Math.floor(Math.random() * size);

		[array[randa], array[randb]] = [array[randb], array[randa]];
	}
}

function validNumber(cases, row, col, size, test) {
	for (let i = 0 ; i < size ; i++) {
		if (cases[row * size + i] == test || cases[i * size + col] == test) {
			return false;
		}
	}

	let sizeSqrt = Math.sqrt(size);

	for (let r = row - (row % sizeSqrt); r < row - (row % sizeSqrt) + sizeSqrt ; r++) {
		for (let c = col - (col % sizeSqrt) ; c < col - (col % sizeSqrt) + sizeSqrt ; c++) {
			if (cases[r * size + c] == test) {
				return false;
			}
		}
	}

	return true;
}

function recursiveGen(boxes, numbers, size, index=0) {
	if (index >= boxes.length) {
		return true;
	}

	let row = Math.floor(index / size);
	let col = index % size;
	shuffle(numbers);

	for (let i = 0 ; i < numbers.length ; i++) {
		let test = numbers[i];
		if (validNumber(boxes, row, col, size, test)) {
			boxes[index] = test;
			if (recursiveGen(boxes, numbers, size, index+1)) {
				return true;
			} else {
				boxes[index] = 0
			}
		}
	}

	return false;
}

function solveGrid(boxes, numbers, size, index=0) {
	while(index < boxes.length && boxes[index] != 0) {
		index += 1;
	}

	if (index >= boxes.length) {
		return 1;
	}

	let solution = 0;
	let row = Math.floor(index / size);
	let col = index % size;

	for (let j = 0 ; j < numbers.length ; j++) {
		if (validNumber(boxes, row, col, size, numbers[j])) {
			let copy = boxes.slice();
			copy[index] = numbers[j];
			solution += solveGrid(copy, numbers, size, index+1);
		}
	}

	return solution;
}

function recursiveRemove(boxes, allowedNumbers, size, attemp) {
	while (attemp > 0) {

		let index = Math.floor(Math.random() * boxes.length);
		while (boxes[index] == 0) {
			index = Math.floor(Math.random() * boxes.length);
		}

		let remember = boxes[index];
		boxes[index] = 0;
		let count = solveGrid(boxes.slice(), allowedNumbers, size);

		if (count != 1) {
			attemp -= 1;
			boxes[index] = remember;
		}
	}
}

onmessage = function(event) {
	let size = event.data[0]
	let allowedNumbers = event.data[1];
	let grid = event.data[2];
	let solution = [];

	if(recursiveGen(grid, allowedNumbers.slice(), size)) {
		solution = grid.slice();
		recursiveRemove(grid, allowedNumbers, size, 20);
	} else {
		postMessage(undefined);
	}

	postMessage({'grid':grid, 'solution': solution});
}