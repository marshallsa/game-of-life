# Game of Life

[![A screenshot of Game of Life, showing Gosper's glider gun and a lobster
spaceship](screenshot.png)](https://marshallsa.github.io/game-of-life/dist/)

This is a web app that simulates [Conway's Game of
Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life).  You can edit single
cells or place premade patterns from
[LifeWiki](http://conwaylife.com/wiki/Main_Page) on the board. The app has about
1,000 patterns that you can search for or filter by type (oscillator, spaceship,
etc.).

You can [**play Game of Life
here**](https://marshallsa.github.io/game-of-life/dist/) or build it from source
using [npm](https://www.npmjs.com/):

    npm install
    npm run build -- -p
    open dist/index.html
