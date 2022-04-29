//Display and update the game board.
const GameBoard = (() => {
  const boardDisplay = document.getElementById('boarddisplay');
  const tiesDisplay = document.getElementById('ties');
  const lossesDisplay = document.getElementById('losses');
  const winsDisplay = document.getElementById('wins');

  let spaces = [0,1,2,3,4,5,6,7,8];
  let ties = 0;
  let losses = 0;
  let wins = 0;

  const getLegalMoves = () => {
    let legalMoves = []
    for (let space in spaces) {
      if (spaces[space] != 'X' && spaces[space] != 'O') {
        legalMoves.push(space);
      }
    }
    //console.log(legalMoves);
    return legalMoves;
  };
  

  const display = () => {
    for (let i = 0; i < 9; i++) {
      let space = document.createElement('div');
      space.classList.add('space');
      space.id = `space${i+1}`;

      //Add relevant letter to space and pass turn.
      space.addEventListener('click', () => {
        if (spaces[i] != 'X' && spaces[i] != 'O' && Game.isActive()) {
          
          const currentPlayer = Game.getCurrentPlayer().name;

          console.log(currentPlayer)
          space.innerText = currentPlayer;
          spaces[i] = currentPlayer;
          
          //Check for a player win or a tie and end the game accordingly.
          if (checkWin(Game.returnPlayer(), spaces)) {
            Game.toggleActive();
            endGame();
          } else if (getLegalMoves().length === 0) {
            Game.toggleActive();
            endGame();
          }
          //If the game is not ovspaceer, have the computer play 
          //a turn and end the game accordingly.
          if (Game.isActive()) {
            Game.switchPlayer();
            Game.computerPlayPerfect();
            
            if (checkWin(Game.returnComputer(), spaces)) {
              Game.toggleActive();
              endGame();
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

  const resetButton = document.getElementById('resetbutton');
  resetButton.addEventListener('click', () => {
    resetBoard();
  });

  const resetBoard = () => {
    const timer = ms => new Promise(res => setTimeout(res, ms));

    async function load () {
      for (let i = 0; i < spaces.length; i++) {
          spaces[i] = i;
          boardDisplay.children[i].innerText = '';
          await timer(300);
      }
    }

    load();

    if (!Game.isActive()){
      Game.toggleActive();
    }
    Game.setCurrentPlayer(Game.returnPlayer());
  }

  const endGame = () => {
    if (checkWin(Game.returnComputer(), spaces) === true) {
      losses++;
      lossesDisplay.innerText = `Losses: ${losses}`;
      Dialogue.displayText('loss');
    } else if (checkWin(Game.returnPlayer(), spaces) === true) {
      wins++;
      winsDisplay.innerText = `Wins: ${wins}`;
      Dialogue.displayText('win');
    } else {
      ties++;
      tiesDisplay.innerText = `Ties: ${ties}`;
      Dialogue.displayText('tie');
    }
  }

  const checkWin  = (player, board) => {
    let rowCheck = 0;
    let colCheck = 0;
    let forDiagCheck = 0;
    let backDiagCheck = 0;

    //Iterate through each row searching for three of the current player's letters.
    for (let i = 0; i < 9; i += 3) {
      for (let j = i; j < i + 3; j++) {
        if (board[j] === player.name) {
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
        if (board[j] === player.name) {
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
      if (board[i] === player.name) {
        backDiagCheck++;
        if (backDiagCheck === 3) {
          return true;
        }
      }
    }
    //Check for a forwards diagonal win.
    for (let i = 2; i < 7; i += 2) {
      if (board[i] === player.name) {
        forDiagCheck++;
        if (forDiagCheck === 3) {
          return true;
        }
      }
    }
    //Return false if no win condition is met.
    return false;
  }

  const listSpaceDisplays = () => {
    const spaceDisplays = Array.from(boardDisplay.children);
    return spaceDisplays;
  }

  return {getLegalMoves, display, listSpaceDisplays, checkWin,
          resetBoard, spaces};
})();

//Create a game object with game-related functions and variables.
const Game = (() => {

  //Initialize event listeners and variables.
  let currentPlayer;
  let active = false;
  let Player;
  let Computer;
  let playerMoves = 0;
  let playerOpen;
  const symbolDisplay = document.getElementById('chosensymbol');

  const xButton = document.getElementById('xbutton');
  xButton.addEventListener('click', () => {
    if (!active) {
      GameBoard.resetBoard();
      Player = createPlayer('X');
      Computer = createPlayer('O');
      setCurrentPlayer(Player);
      active = true;
      symbolDisplay.innerText = 'You are playing as X.';
    } else if (Player.name === 'O'){
      Player = createPlayer('X');
      Computer = createPlayer('O');
      setCurrentPlayer(Player);
      GameBoard.resetBoard();
      symbolDisplay.innerText = 'You are playing as X.';
    }
  });

  const oButton = document.getElementById('obutton');
  oButton.addEventListener('click', () => {
    if (!active) {
      GameBoard.resetBoard();
      Player = createPlayer('O');
      Computer = createPlayer('X');
      setCurrentPlayer(Player);
      active = true;
      symbolDisplay.innerText = 'You are playing as O.';
    } else if (Player.name === 'X'){
      Player = createPlayer('O');
      Computer = createPlayer('X');
      setCurrentPlayer(Player);
      GameBoard.resetBoard();
      symbolDisplay.innerText = 'You are playing as O.';
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

  const returnPlayer = () => {
    return Player;
  }

  const returnComputer = () => {
    return Computer;
  }

  const switchPlayer = () => {
    if (currentPlayer === Player) {
      currentPlayer = Computer;
    } else {
      currentPlayer = Player;
    }
  }
  const computerPlayRandom = () => {
    const choices = GameBoard.getLegalMoves();
    const choice = choices[Math.floor(Math.random() * choices.length)];
    currentSpace = document.getElementById('boarddisplay').children[choice];
    currentSpace.innerText = Computer.name;
    GameBoard.spaces[choice] = Computer.name;
  }

  const computerPlayAverage = () => {
    playerMoves ++;
 
    const choices = GameBoard.getLegalMoves();
    const boardDisplay = document.getElementById('boarddisplay').children;

    //Check for a single winning move.
    for (let choice of choices) {
      currentSpace = boardDisplay[choice];
      currentSpace.innerText = Computer.name;
      GameBoard.spaces[choice] = Computer.name;
      
      if (GameBoard.checkWin(Computer, GameBoard.spaces)) {
        return;
      } else {
        currentSpace.innerText = '';
        GameBoard.spaces[choice] = choice;
      }
    }

    //Check for a single block from losing.
    setCurrentPlayer(Player);
    for (let choice of choices) {
      currentSpace = boardDisplay[choice];
      currentSpace.innerText = Player.name;
      GameBoard.spaces[choice] = Player.name;
  
      if (GameBoard.checkWin(Player, GameBoard.spaces)) {
        setCurrentPlayer(Computer);
    
        currentSpace.innerText = Computer.name;
        GameBoard.spaces[choice] = Computer.name;
        return;
      } else {
     
        currentSpace.innerText = '';
        GameBoard.spaces[choice] = choice;
      }
    }
    setCurrentPlayer(Computer);

    //If no move blocks or wins immediately, play a random move.
    const choice = choices[Math.floor(Math.random() * choices.length)];
    currentSpace = document.getElementById('boarddisplay').children[choice];
    currentSpace.innerText = Computer.name;
    GameBoard.spaces[choice] = Computer.name;
  }

  const computerPlayPerfect = () => {
    const boardDisplay = document.getElementById('boarddisplay').children;

    bestMove = minimax(GameBoard.spaces, Computer);
    boardDisplay[bestMove.index].innerText = Computer.name;
    GameBoard.spaces[bestMove.index] = Computer.name;
  };

  const emptyIndexes = board => {
    let legalMoves = [];
    for (let space in board) {
      if (board[space] != 'X' && board[space] != 'O') {
        legalMoves.push(space);
      }
    }
    //console.log(legalMoves);
    return legalMoves;
  
  }

  const test = () => {
    return minimax(GameBoard.spaces, Computer);
  }

  const minimax = (newBoard, player) => {
    const availSpots = emptyIndexes(newBoard);
    
    //console.log(GameBoard.getLegalMoves().length);
    
    //console.log(`${newBoard[0]} ${newBoard[1]} ${newBoard[2]}\n${newBoard[3]} ${newBoard[4]} ${newBoard[5]}\n${newBoard[6]} ${newBoard[7]} ${newBoard[8]}`);
    //Check for board terminal state.
    if (GameBoard.checkWin(Player, newBoard)) {
      //console.log('you hit neg')
      return {score: -10};
    } else if (GameBoard.checkWin(Computer, newBoard)) {
      //console.log('you hit pos')
      return {score: 10};
    } else if (availSpots.length === 0) {
      //console.log('you hit zero')
      return {score: 0};
    }

    let moves = [];

    for (let i = 0; i < availSpots.length; i++) {
      //console.log(availSpots.length);

      //create an object for each and store the index of that spot. 
      let move = {};
      move.index = newBoard[availSpots[i]];
      
  
      // set the empty spot to the current player
      newBoard[availSpots[i]] = player.name;
      //boardDisplay[availSpots[i]].innerText = player.name;
  
      /*collect the score resulted from calling minimax 
        on the opponent of the current player*/
      if (player === Computer) {
        let result = minimax(newBoard, Player);
        move.score = result.score;
        //console.log(moves);
      } else {
        let result = minimax(newBoard, Computer);
        move.score = result.score;
        //console.log(moves);
      }
  
      // reset the spot to empty
      newBoard[availSpots[i]] = move.index;
  
      // push the object to the array
      moves.push(move);
    }

    let bestMove;
    if(player === Computer){
      let bestScore = -10000;
      for(let i = 0; i < moves.length; i++){
        if(moves[i].score > bestScore){
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
  
    // else loop over the moves and choose the move with the lowest score
      var bestScore = 10000;
      for(let i = 0; i < moves.length; i++){
        if(moves[i].score < bestScore){
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
  
    // return the chosen move (object) from the moves array
    //console.log(moves);
    //console.log(bestMove);
    return moves[bestMove];
  }

  return {getCurrentPlayer, switchPlayer, isActive, computerPlayRandom, computerPlayAverage,
           computerPlayPerfect, toggleActive,  returnPlayer, returnComputer, 
           emptyIndexes, minimax, test, setCurrentPlayer, Player, Computer, active, playerMoves};

})();

//Create the player factory function.
const createPlayer = name => {
  return {name};
}

const Face = (() => {
  const faces = {
    default: 'images/default.png',
    upset: 'images/upset.png',
    sad: 'images/sad.png',
    realistic: 'images/realistic.png',
    boardFace: 'images/boardface.png',
    bsod: 'images/bsod.png',
    happy: 'images/happy.png'
  }
  const faceSprite = document.getElementById('face');
  faceSprite.addEventListener('click', () => {
    console.log('test')
    faceSprite.src = faces.happy;
  });
})();

const Desktop = (() => {
  const desktopBox = document.getElementById('desktopbox');
  const desktop = document.getElementById('desktop');

  function updateDesktopHeight() {
    console.log(desktop.offsetHeight);
    desktopBox.style.height = `${desktop.offsetHeight}px`;
  }

  window.addEventListener('resize', () => {
    updateDesktopHeight();
  });

  updateDesktopHeight();

})();

const Dialogue = (() => {
  const textBox = document.getElementById('textbox');

  const messages = {
    initial: "Hi, there's a uhh, there's a computer over there. You know, if you'd like to play a game or two.",
    tie: "Somehow, this is usually how it ends.",
    win: "But.. but I thought it wasn't possible...",
    loss: "I'm sorry, I didn't choose for it to end this way."
  }

  const displayText = message => {
    textBox.innerText = messages[message];
  }

  displayText('initial');

  return {displayText}
})();


