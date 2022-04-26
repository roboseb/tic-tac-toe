//Display and update the game board.
const GameBoard = (() => {
  const boardDisplay = document.getElementById('boarddisplay');
  

  let spaces = {
    0: null,
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null,
    8: null
  };

  const getLegalMoves = () => {
    let legalMoves = []
    for (let space in spaces) {
      if (!spaces[space]) {
        legalMoves.push(space);
      }
    }
    console.log(legalMoves);
    return legalMoves;
  };
  

  const display = () => {
    for (let i = 0; i < 9; i++) {
      let space = document.createElement('div');
      space.classList.add('space');
      space.id = `space${i+1}`;

      //Add relevant letter to space and pass turn.
      space.addEventListener('click', () => {
        if (spaces[i] === null && Game.isActive()) {
          
          const currentPlayer = Game.getCurrentPlayer().name;
          space.style.backgroundColor = 'skyblue';
          space.innerText = currentPlayer;
          spaces[i] = currentPlayer;
          
          if (checkWin()) Game.toggleActive();
          
          if (Game.isActive()) {
            Game.switchPlayer();
            Game.computerPlay();
            
            if (checkWin()) {
              Game.toggleActive();
            } else {
              Game.switchPlayer();
            }
          }
          

          
          
        }
      });
      boardDisplay.appendChild(space);
    }
  }

  display();

  const checkWin = () => {
    let rowCheck = 0;
    let colCheck = 0;
    let forDiagCheck = 0;
    let backDiagCheck = 0;

    //Iterate through each row searching for three of the current player's letters.
    for (let i = 0; i < 9; i += 3) {
      for (let j = i; j < i + 3; j++) {
        if (spaces[j] === Game.getCurrentPlayer().name) {
          rowCheck++;
        }
      }
      if (rowCheck === 3) {
        return true;
      } else {
        rowCheck = 0;
      }
    }
    //Iterate through each column searching for three of the current player's letters.
    for (let i = 0; i < 3; i++) {
      for (let j = i; j < i + 7; j+=3) {
        if (spaces[j] === Game.getCurrentPlayer().name) {
          colCheck++;
        }
      }
      if (colCheck === 3) {
        return true;
      } else {
        colCheck = 0;
      }
    }
    //Check for a backwards diagonal win.
    for (let i = 0; i < 9; i += 4) {
      if (spaces[i] === Game.getCurrentPlayer().name) {
        backDiagCheck++;
        if (backDiagCheck === 3) return true;
      }
    }
    //Check for a forwards diagonal win.
    for (let i = 2; i < 7; i += 2) {
      if (spaces[i] === Game.getCurrentPlayer().name) {
        forDiagCheck++;
        if (forDiagCheck === 3) return true;
      }
    }
    //Return false if no win condition is met.
    return false;
  }

  const listSpaceDisplays = () => {
    const spaceDisplays = Array.from(boardDisplay.children);
    return spaceDisplays;
  }

  return {getLegalMoves, display, listSpaceDisplays, spaces};
})();

//Create a game object with game-related functions and variables.
const Game = (() => {

  //Initialize event listeners and variables.
  let currentPlayer;
  let active = false;
  let Player;
  let Computer;

  const xButton = document.getElementById('xbutton');
  xButton.addEventListener('click', () => {
    if (!active) {
      Player = createPlayer('X');
      Computer = createPlayer('O');
      setCurrentPlayer(Player);
      active = true;
    }
  });

  const oButton = document.getElementById('obutton');
  oButton.addEventListener('click', () => {
    if (!active) {
      Player = createPlayer('O');
      Computer = createPlayer('X');
      setCurrentPlayer(Player);
      active = true;
    }
  });
  
  const isActive = () => {
    return active;
  }

  const toggleActive = () => {
    active = !active;
  }

  const setCurrentPlayer = player => {
    currentPlayer = player;
  }

  const getCurrentPlayer = () => {
    return currentPlayer;
  }

  const switchPlayer = () => {
    if (currentPlayer === Player) {
      currentPlayer = Computer;
    } else {
      currentPlayer = Player;
    }
  }
  const computerPlay = () => {
    const choices = GameBoard.getLegalMoves();
    const choice = choices[Math.floor(Math.random() * choices.length)];
    console.log(choice);
    currentSpace = document.getElementById('boarddisplay').children[choice];
    currentSpace.innerText = Computer.name;
    GameBoard.spaces[choice] = Computer.name;
  }

  return {getCurrentPlayer, switchPlayer, isActive, computerPlay, toggleActive, Player, Computer, active};

})();

//Create the player factory function.
const createPlayer = name => {
  return {name};
}




