# Tic-Tac-Toe
## A Game by Tim Caldwell for GA WDI 28
---
### About This Game
Aside from being a standard Tic-Tac-Toe game, this game was created as the first solo project for the WDI course with General Assembly. It is created using:

* HTML5
* JavaScript
* jQuery

---
### Installation instructions
Simply clone this repository and open `index.html`.

---
## Technical Information
---
### Design - HTML & CSS
The design element of this game is simple and has been kept that way intentionally with most elements being added via JavaScript. I also wanted to have a bit of a retro feel to the game, so that's why I added the scrolling background, reminiscent of 90's video-game start screens.

#### CSS Grid
I've used CSS Grid for creating the game board. And, more specifically, I used `:nth-child` pseudo-selectors to add borders to these grid elements.

#### Responsive Design components
In order to keep the layout responsive, I've made ample use of the CSS units `vmin`, `vmax`, `vw`, and `vh`, including use of these units for font-sizes.

### JavaScript
I've designed the JavaScript to allow a scalable board-size to be added in the future. The board itself is created when the game is started from selecting the number of players. The majority of the functionality occurs as a result of a click on the gameboard.

In summary, when a player clicks on the grid-square they'd like to take, the click function begins. It will...
1. Fill the grid-square with the current player's token.
2. Check to see if a win has occurred.
  1. If a win (or draw) has occurred display the win message with reset button.
3. Switch to the other player.
4. Else, if AI is enabled:
  1. Check the gameboard to see if there are any slots that will make the AI win with this move.
    1. If there are any slots that match this, take that slot by triggering click on that slot.
  2. If not, check to see if there are any slots free on the gameboard that would allow the player to win with the next remove.
    1. If there's a slot, take it to prevent the player from winning.
  3. Otherwise pick a random available slot.
5. If AI is not enabled, do nothing.
