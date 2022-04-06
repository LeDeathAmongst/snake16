# Snake 16
This is Snake, with 15 variations, hence the name Snake 16. Each variation adds an obstacle or other limitation to make the game more interesting than the average Snake game.
In addition to the game itself, I created a bot to play the game and score much higher than me.

# Variations
The 16 levels are as follows:

1) **Classic** - Original snake game. Snake gets longer after eating a piece of fruit.
2) **Bombs** - "Bombs" are left behind after collecting fruit. If you hit a bomb, you lose.
3) **Colorblind** - Bombs are placed that are the same color as the fruit you need to eat.
4) **20/20 Vision** - The fruit slowly fades until it is invisible. Bombs are also left behind.
5) **Closing In** - The grid gets smaller and smaller as you collect more fruit.
6) **And Beyond** - The snake is 'infinitely long' from the very beginning.
7) **Track Star** - The fruit moves across the screen. Bombs are also left behind.
8) **Portal** - Two fruit are placed on the screen. When you collect one, you are teleoprted to the location of the second.
9) **Tick Tock** - If you don't collect the fruit fast enough, bombs will be placed randomly across the screen.
10) **Light Switch** - Bombs are left behind that 'flash' between visible and invisible.
11) **Phantom Snake** - There is a second snake that tries to get the fruit before you. It can float through obstacles, and if it collects a fruit, a bomb is placed behind.
12) **Dodgeball** - After collecting a fruit, a bomb will be left behind that moves across the screen.
13) **Frogger** - All fruit & bombs move, but alternate between staying still and moving.
14) **Good Luck** - Both bombs and fruit move, and they are the same color. The only way to distinguish between them is that fruit move faster than the bombs.
15) **Shots Fired** - 'Missiles' are fired from left to right across the screen. If you are struck by a missile, the snake will get longer.
16) **No Survivors** - This level combines all aspects of *Good Luck* and *No Survivors*.

# Bot Algorithm
The bot is able to play nearly perfectly essentially by considering just one thing: 

***Is there an unobstructed path to the snakes tail?***
99% of the work is done with this one question. If turning left, for example, the snake *will not* be able to reach it's tail without hitting an obstacle, that means either:

1) There is an obstacle directly to the left of the snake
2) Turning to the left will box the snake in, killing it later on.

If, however, there *is* a path to the tail, that means turning to the left is *safe*.
At each step, the snake uses a BFS algorithm to determine the shortest path to the fruit, then the shortest path from the fruit to the tail.

If the fruit is inaccesible, the snake will instead take the longest path possible to its tail (essentially waiting for the board to change enough for the fruit to be accessible). 

If the snake's tail is inaccessible, the snake will use a DFS algorithm to take the longest path availible on the board. This really only happens on levels where elements are added mid game that change the structure of the board.

# Current Issues
The bot currently struggles on two things: moving bombs and portals. The current algorithm for the bot doesn't anticipate a bomb moving into a currently empty space. With portals, sometimes traveling into one portal means exiting out of another one that is already boxed in-- there seems to be a bug where the snake doesn't realize this is going to happen.

# Site
Play the game for yourself [here](https://ybenhayun.github.io/snake16/).
Watch the bot play the game [here](https://ybenhayun.github.io/snake16/auto/).

If you just want to take a glance at the different version, the password to unlock all levels is 'SNAKESIXTEEN'.