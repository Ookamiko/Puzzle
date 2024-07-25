const canvas = document.getElementById("master_canvas");
const ctx = canvas.getContext("2d");
const grid = new Sudoku(ctx, 0, 0, 100, 100);
grid.finishEvent = function() {
	alert("Win");
}

canvas.width = grid.width;
canvas.height = grid.height;

canvas.addEventListener('click', function(event) {
	const rect = canvas.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	if (grid.isClicked(mouseX, mouseY)) {
		grid.clickBox(mouseX, mouseY);
	} else {
		grid.unselectBox();
	}
});

window.addEventListener('keyup', event => {
	grid.treatKey(event);
});

grid.generateGrid();