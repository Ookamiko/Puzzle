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
		if (cases[row * 9 + i] == test || cases[i * 9 + col] == test) {
			return false;
		}
	}

	for (let r = row - (row % 3); r < row - (row % 3) + 3 ; r++) {
		for (let c = col - (col % 3) ; c < col - (col % 3) + 3 ; c++) {
			if (cases[r * 9 + c] == test) {
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
			boxes[index] = test;
			if (recursiveGen(boxes, numbers, index+1)) {
				return true;
			} else {
				boxes[index] = 0
			}
		}
	}

	return false;
}

function solveGrid(boxes, numbers, index=0) {
	while(index < boxes.length && boxes[index] != 0) {
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
			let copy = boxes.slice();
			copy[index] = numbers[j];
			solution += solveGrid(copy, numbers, index+1);
		}
	}

	return solution;
}

function recursiveRemove(boxes, allowedNumbers, attemp) {
	while (attemp > 0) {

		let index = Math.floor(Math.random() * boxes.length);
		while (boxes[index] == 0) {
			index = Math.floor(Math.random() * boxes.length);
		}

		let remember = boxes[index];
		boxes[index] = 0;
		let count = solveGrid(boxes.slice(), allowedNumbers);

		if (count != 1) {
			attemp -= 1;
			boxes[index] = remember;
		}
	}
}

onmessage = function(args) {
	console.log('Start generating');
	let boxes = [];
	let allowedNumbers = [1,2,3,4,5,6,7,8,9];
	let solution = [];
	for (let i = 0 ; i < 81 ; i++) {
		boxes[i] = 0;
	}

	if(recursiveGen(boxes, allowedNumbers.slice())) {
		solution = boxes.slice();
		recursiveRemove(boxes, allowedNumbers, 100);
	} else {
		postMessage(undefined);
	}

	postMessage({'grid':boxes, 'solution': solution});
}