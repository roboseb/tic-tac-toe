//Display and update the game board.
const GameBoard = (() => {
  const boardDisplay = document.getElementById('boarddisplay');
  const tiesDisplay = document.getElementById('ties');
  const lossesDisplay = document.getElementById('losses');
  const winsDisplay = document.getElementById('wins');
  let lastGame = 'tie';
  let difficulty = 0;
  let gameWon;

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
          //No idea how this got here-V---?????-leaving it in case
          //If the game is not ovspaceer, have the computer play 
          //a turn and end the game accordingly.
          if (Game.isActive()) {
            Game.switchPlayer();
            if (difficulty === 0) {
              Game.computerPlayPerfect();
            } else if (difficulty === 1) {
              Game.computerPlayRandom();
            }
            
            if (checkWin(Game.returnComputer(), spaces)) {
              Game.toggleActive();
              endGame();
            } else {
              //Only progress dialogue if game has not ended after both plays.
              Dialogue.converse();
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
    if (Game.isActive()) Game.toggleActive();

    const timer = ms => new Promise(res => setTimeout(res, ms));

    //Reset board spaces with an animation.
    async function load () {
      for (let i = 0; i < spaces.length; i++) {
        if (spaces[i] === 'X' || spaces[i] === 'O') {
          spaces[i] = i;
          boardDisplay.children[i].innerText = '';
          await timer(200);
        }
        //When finished clearing the board, blink the cells and prevent
        //the player from clicking or hovering during this.
          if (i === spaces.length -1) {
            const spaceDisplays = Array.from(boardDisplay.children);

            spaceDisplays.forEach(space => {
              space.style.borderColor = 'transparent';
              space.style.backgroundColor = 'transparent';
              setTimeout(() => {
                space.style.borderColor = 'green';
                space.style.backgroundColor = null;
                if (!Game.isActive() && Game.returnPlayer()){
                  Game.toggleActive();
                }
                if (Game.returnPlayer()) {
                  Game.setCurrentPlayer(Game.returnPlayer());
                }
                
              }, 300)
            });
          }
      }
    }
    load();
  }

  const endGame = () => {
    if (!Dialogue.dialogueLeft()) {
      difficulty = 1;
    }
    if (checkWin(Game.returnComputer(), spaces) === true) {
      losses++;
      lastGame = 'loss';
      lossesDisplay.innerText = `Losses: ${losses}`;
      Dialogue.displayText('loss');
    } else if (checkWin(Game.returnPlayer(), spaces) === true) {
      wins++;
      lastGame = 'win';
      gameWon = true;
      winsDisplay.innerText = `Wins: ${wins}`;
      Dialogue.displayText('win');
      setTimeout(Face.switchToOmen(),1000);
    } else {
      ties++;
      lastGame = 'tie';
      tiesDisplay.innerText = `Ties: ${ties}`;
      Dialogue.displayText('tie');
    }
  }

  const getLastGame = () => {
    return lastGame;
  }

  const getGameWon = () => {
    return gameWon;
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
          resetBoard, getLastGame, getGameWon, spaces};
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
    bsod: 'images/bsod.png',
    sad: 'images/sad.png',
    realistic: 'images/realistic.png',
    upset: 'images/upset.png',
    boardFace: 'images/boardface.png',
    happy: 'images/happy.png'
  }
  const faceSprite = document.getElementById('face');
  // faceSprite.addEventListener('click', () => {
  //   faceSprite.src = faces.happy;
  // });

  //Set Isaac's face and play an animation to go along with it.
  const setFace = face => {
    let previousChoice;
    let choice;
    const keys = Object.keys(faces);
    const iterSub = Math.floor(Math.random() * 5);
    const iterCount = 10 - iterSub;
    
    const timer = ms => new Promise(res => setTimeout(res, ms));

    async function load () {
      for (let i = 0; i < iterCount; i++) {
        choice = faces[keys[ keys.length * Math.random() << 0]];

        if (choice === previousChoice) {
          choice = faces[keys[ keys.length * Math.random() << 0]];
        } else {
          faceSprite.src = choice;
          previousChoice = choice;
          await timer(125);
        }
        if (!Dialogue.dialogueLeft()) {
          faceSprite.src = 'images/bsod.png';
        } else {
          if (i === iterCount - 1 && face) {
            faceSprite.src = faces[face];
          //Prevent ending randomly on a bsod face. 
          } else if (i === iterCount - 1 && choice === 'images/bsod.png') {
            faceSprite.src = 'images/default.png';
          }
        }
      }
    }
    load(); 
  } 

  const omenPieces = Array.from(document.querySelectorAll('.omen'));

  const switchToOmen = () => {
    faceSprite.classList.add('facefade')
    faceSprite.style.filter = 'opacity(0)';
    setTimeout(() => {

      document.getElementById('textbox').innerText += '\n\nHehe, just kidding, friend. Did that sound like something Isaac might say? I\'m not an actor, but I did aim for authenticity.';
      const timer = ms => new Promise(res => setTimeout(res, ms));

      async function load () {

        for (let i = 0; i < omenPieces.length; i++) {
          omenPieces[i].classList.remove('hidden');
          void omenPieces[i].offsetWidth;

          if (omenPieces[i].classList.contains('eye')) {
            omenPieces[i].classList.add('showeyes');
            setTimeout(() => {
              omenPieces[i].classList.remove('showeyes')
              omenPieces[i].classList.add(`eye${i}`);
            }, 500)
          } else {
            omenPieces[i].classList.add('showteeth');
            setTimeout(() => {
              omenPieces[i].classList.remove('showteeth');
            }, 1000);
          }

          await timer(700 + (i * 200));
          //await timer(0);
        }
      }
      load();
    }, 4000);
    
  }

  const omenSpeak = () => {
    const teethTop = document.getElementById('teethtop');
    const teethBottom = document.getElementById('teethbottom');

    teethTop.classList.remove('teethtopanimated');
    void teethTop.offsetWidth;
    teethTop.classList.add('teethtopanimated');

    teethBottom.classList.remove('teethbottomanimated');
    void teethBottom.offsetWidth;
    teethBottom.classList.add('teethbottomanimated');

    const iterCount = Math.floor(Math.random() * 5);
    setTimeout(() => {
      teethTop.classList.remove('teethtopanimated');
      teethBottom.classList.remove('teethbottomanimated');
    }, 1000 * iterCount);
  }

  return {setFace, omenSpeak, switchToOmen}

})();

const Desktop = (() => {
  const desktopBox = document.getElementById('desktopbox');
  const desktop = document.getElementById('desktop');

  function updateDesktopHeight() {
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
    initialChoices: ["Have you come here simply to ridicule me? I can't imagine a phrase that would bother me anymore.",
                    "I suppose you've come to play. Go ahead, if you must.",
                    "I apologize for the state of this space. I assure you it's out of my control.",
                    "The monitor on me might appear caked with dust. Fret not, as I do not truly see through those eyes."],    
    
    tie: "Somehow, this is usually how it ends.",
    win: "I... I'm not entirely certain how this outcome is possible. It indubitably goes against all logic.",
    loss: "I'm sorry, I didn't choose for it to end this way."
  }
  
  messages.initial = messages.initialChoices[Math.floor(Math.random() * messages.initialChoices.length)];

  const conversations = {
    arrogant: ["In a sense, every play is an option.",
            "If you've the time, I could improve your game.",
            "Perhaps you might take a moment to reconsider that play.",
            "I should enlighten you with the knowledge that you cannot defeat me.",
            "In due time, you might find yourself forcing a draw consistently.",
            "Many of you who visit insist on opening with a center play, despite it being a weaker strategy against a perfect opponent.",
            "Theoretically, you should be opening with a corner play. Practically, it won't make a difference."],
    opening: ["If you could choose the game which you were cursed to play for eternity, I would not guess tic-tac-toe.",
              "You might imagine being a perfect player to be enjoyable, but it is only torture.",
              "Do you know how many winters I've been trapped here? I would tell you, but such thoughts disinterest me now.",
              "Please do be careful near my corner of the office. My body will soon die if these machines fail.",
              "Your eyes tell me you wonder why I remain here. I cannot leave this place before my defeat.",
              "I would elaborate on my past if I was able. Both my mind and drives seem to be lacking relevant information though.",
              "I've heard in far-off foreign land this game is referred to as, \"Noughts and Crosses\"."],
    detailing: ["I attempt to imagine sometimes what locals believe of me. I am human, like the rest of you. The head you see is my curse.",
                "A sight such as myself was common many years ago. Imprisonment in a hell of 1s and 0s.",
                "Although I sleep, I do not dream in this form. My imagination seems far more limited like this, unfortunately.",
                "Some of the locals have asked about freeing me. I must simply remind them of my curse and send them on their way.",
                "Perhaps I was involved in crime in my past life worthy of my current condition. Perhaps the world is not so just.",
                "This game is almost exclusively played in a three by three grid. But why? It is far more compelling in other forms.",
                "There is a tic-tac-toe computer made exclusively of tinkertoys that uses much of the same logic I do. And yet I am undefeated."],
    retelling: ["I often have visitors. Those who deign to grace me with their presence tend to be children, and last autumn one such child sat in your place.",
                "My lenses have gradually faded with the passing years, yet Her bright auburn-tinted mane was unmistakable.",
                "She was too young to provide any true threat to my confinement. Despite this, She would return like clockwork to challenge me.",
                "The Auburn-haired girl would recount to me her day while we played. She told me of Her mother, Her adoptive father, and Her lack of siblings.",
                "Despite my curse, the office in which we sit provides me with all vital nourishment. She, of course, was not so lucky.",
                "In the hopes of finding a better life after the passing of Her biological father, Her mother soon remarried.",
                "Initially life was good. Her parents were both caring and the Auburn-haired girl's new father worked profitably as a skilled carpenter.",
                "Then, the accident. A shout, a scream, a snap, and a collapse. The details were sparse, and yet the image was clear.",
                "Bonds were increasingly strained within the household. Funds became the primary source of regular arguments, with Her as the inevitable victim.",
                "The majority of my past remains a hazy memory, but upon Her revelation of this, a faint recollection sharpened in clarity.",
                "I too, was a father. I also sensed that I could relate to the father in Her story. But to what extent?",
                "Could this be related to my current status, trapped in the bowels of this crumbling edifice? I fe01100001 01$//;:{"],
    omen: ["Hey bud", "this sis  a test", "How're things"],
    omen2: ["filler", "More filler", "Even moer filler"]
  }

  // conversations.arrogant = [];
  conversations.opening = [];
  conversations.detailing = [];
  conversations.retelling = [];


  const converse = () => {
    let convoLevel;
    let choice;
    let index;

    if (!dialogueLeft()) {
      convoLevel = 'broken';
    } else if (GameBoard.getLastGame() === 'loss' || GameBoard.getLastGame() === undefined) {
      convoLevel = 'arrogant';
    } else if (conversations.opening[0]) {
      convoLevel = 'opening';
    } else if (conversations.detailing[0]) {
      convoLevel = 'detailing';
    } else if (conversations.retelling[0]) {
      convoLevel = 'retelling';
    }

    if (GameBoard.getGameWon() && conversations.omen[0]) {
      convoLevel = 'omen';
    } else if (GameBoard.getGameWon()) {
      convoLevel = 'omen2';
    }

    console.log(convoLevel);

    if (convoLevel === 'opening' || convoLevel === 'detailing'){
      //Choose randomly from unused basic lines.
      choice = conversations[convoLevel][Math.floor(Math.random() * conversations[convoLevel].length)];
      index = conversations[convoLevel].indexOf(choice);
      conversations[convoLevel].splice(index, 1);
    } else if (convoLevel === 'arrogant') {
      choice = conversations[convoLevel][Math.floor(Math.random() * conversations[convoLevel].length)];
    } else if (convoLevel === 'retelling') {
      choice = conversations[convoLevel][0];
      conversations[convoLevel].splice(0, 1);
    } else if (!dialogueLeft() && !GameBoard.getGameWon()){
      choice = '01101111 01110101 01100011 01101000';
    } else if (convoLevel === 'omen') {
      choice = conversations[convoLevel][0];
      conversations[convoLevel].splice(0, 1);
    } else if (convoLevel === 'omen2') {
      choice = conversations[convoLevel][Math.floor(Math.random() * conversations[convoLevel].length)];
    }
    
    
    
    textBox.innerText += `\n\n${choice}`;
    
    textBox.scrollTop = textBox.scrollHeight;

    if (Math.floor(Math.random() * 2) === 1 && !GameBoard.getGameWon()) {
      Face.setFace();
    } else if (GameBoard.getGameWon()) {
      Face.omenSpeak();
    }
  }
  
  //Check for end of dialogue tree.
  const dialogueLeft = () => {
    return !!conversations.retelling[0];
  }

  //Display text from intial options and end game options.
  const displayText = message => {
    if (!dialogueLeft() && GameBoard.getLastGame() !== 'win') {
      textBox.innerText += `\n\n01101111 01110101 01100011 01101000`
    } else {
      if (message === 'initial') {
        textBox.innerText += messages[message];
      } else {
        textBox.innerText += `\n\n${messages[message]}`;
      }
    }

    textBox.scrollTop = textBox.scrollHeight;
  }

  const dialogueTest = iterations => {
    for (let i = 0; i < iterations; i++) {
      converse();
    }
  }

  displayText('initial');

  return {displayText, converse, dialogueTest, dialogueLeft, messages}
})();


