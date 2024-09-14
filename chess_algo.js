//Write a function that accepts the current position of a knight in a chess board, it returns the possible positions that it will end up after 1 move.
//The resulted should be sorted.

// Example
// "a1" -> ["b3", "c2"]

// ATTEMPT ONE
function possiblePositions(str) {
  //declare array of moves
  const moves = [[2,1], [1,2], [-2, -1], [-1, -2],[-2, 1], [2, -1], [-1, 2], [1, -2]]
  //xaxis numerical values
  const xAxis ={a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8}
  //xaxis letter refrence
  const reverseXAxis = Object.fromEntries(
  Object.entries(xAxis).map(([key, value]) => [value, key]))
  //create a numberical refrence for square
  const positionArr = str.split("")
  const position = [xAxis[positionArr[0]], parseInt(positionArr[1])];
  console.log("POSITION", position);
  //prepare array to collect moves
  const possibleMoves = []
  //add each to numerical ref, push into possible moves if still on the board
  for(let i =0; i < moves.length; i++){
  const possibleMove = [position[0] + moves[i][0], position[1] + moves[i][1]]
    if (possibleMove[0] >= 1 && possibleMove[0] <=8 && possibleMove[1] >= 1 && possibleMove[1] <=8){
    possibleMoves.push(possibleMove)
    }
  }
  const newPositionsArray = possibleMoves.map(([x,y])=> {
   return[reverseXAxis[x], y].join("")
  }).sort()
  return newPositionsArray
}

// REFACTORED
function newPossiblePositions(str) {
  const moves = [[1,2], [2, 1], [-2, -1], [-1, -2], [-1, 2], [1, -2], [-2, 1], [2, -1]]
  const numericPos = [str.charCodeAt(0), parseInt(str[1])]
  const possibleMoves = moves.map(([x, y]) => [x + numericPos[0], y+ numericPos[1]])
  .filter((m) => {
      if(m[0] >= 97 && m[0] <=104 && m[1] >= 1 && m[1] <= 8){
    return m
  }
  })
  .map(([x, y]) => [String.fromCharCode(x), y].join("")).sort()
  return possibleMoves
}

// Given two different positions on a chess board, find the least number of moves it would take a knight to get from one to the other. The positions will be passed as two arguments in algebraic notation. For example, knight("a3", "b5") should return 1.

// The knight is not allowed to move off the board. The board is 8x8.

// For information on knight moves, see https://en.wikipedia.org/wiki/Knight_%28chess%29

// For information on algebraic notation, see https://en.wikipedia.org/wiki/Algebraic_notation_%28chess%29

// (Warning: many of the tests were generated randomly. If any do not work, the test cases will return the input, output, and expected output; please post them.)
function knight(start, finish) {
  const moves = [[1, 2], [2,1],[-1, -2], [-2, -1], [-1, 2], [-2, 1], [1, -2], [2, -1]]
  let moveCounter = 0;
  
  const gridToNumber = str =>  [str.charCodeAt(0), parseInt(str[1])]
  const numberToGrid = (arr) => `${String.fromCharCode(arr[0])}${arr[1]}`
  const numericStart = gridToNumber(start)
  const numericFinish = numberToGrid(finish)
  let possiblePositions = [];
  
  const calculatePossiblePositions = (pos) => {
      const betaPositions = moves.map((m) => [pos[0] + m[0], pos[1] + m[1]]).filter((p) => {
    if(p[0] >= 97 && p[0] <= 104 && p[1] >=1 && p[1] <= 8){ 
      return p
    }
  });
  console.log("BETA:", betaPositions);
  betaPositions.forEach((p) => possiblePositions.push(p));
  }
  calculatePossiblePositions(numericStart);
  console.log("POS: ", possiblePositions);
  
  while(possiblePositions.indexOf(numericFinish) === -1){
    possiblePositions.forEach((p) => {
      calculatePossiblePositions(p)
    })
    moveCounter ++
  }
    return moveCounter
  }

  