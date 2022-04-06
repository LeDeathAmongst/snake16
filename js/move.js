function moveSnake(snake){
	if ((keystate[larrow]) && snake.direction != right) snake.direction = left;
	else if ((keystate[rarrow]) && snake.direction != left) snake.direction = right;
	else if ((keystate[uarrow]) && snake.direction != down) snake.direction = up;
	else if ((keystate[darrow]) && snake.direction != up) snake.direction = down;

	new_pos = newPosition(SNAKE, snake.direction, snake.head.x, snake.head.y);
	snake.insert(new_pos.x, new_pos.y);
}