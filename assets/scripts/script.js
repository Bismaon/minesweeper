var amountList, fail, finished, flagged, height, mineList, nbOfMines, tileList, visited, width, calls, hour, minute, second, count;

window.addEventListener('contextmenu', (event) => {
  
  return false;
})


function stopWatch() {
	if (timer) {
		count++;

		if (count == 100) {
			second++;
			count = 0;
		}

		if (second == 60) {
			minute++;
			second = 0;
		}

		if (minute == 60) {
			hour++;
			minute = 0;
			second = 0;
		}

		let hrString = hour;
		let minString = minute;
		let secString = second;

		if (hour < 10) {
			hrString = "0" + hrString;
		}

		if (minute < 10) {
			minString = "0" + minString;
		}

		if (second < 10) {
			secString = "0" + secString;
		}

		document.getElementById('hr').innerHTML = hrString;
		document.getElementById('min').innerHTML = minString;
		document.getElementById('sec').innerHTML = secString;
		setTimeout(stopWatch, 10);
	}
}

window.onload = function(){
  init()
}

function init() {
  // sets the empty minefield
  setEmptyMinefield();
}

//clic takes as parameters two integer, width and height, and a boolean, if
//the shift key has been pressed or not. It checks which tile has been pressed
//and reacts accordingly. It returns nothing
function clic(row, column, event) {
  if (fail || finished || erreur) {
    return;
  }
  // checks if it the first tile pressed
  else if (visited.length === 0) {
    timer = true;
	  stopWatch();
    // sets the minefield so that no mine is under the first clic
    setMineList([row - 1, row, row + 1], [column - 1, column, column + 1]);
    // gets the number of mines around each cells and stores in amountList
    setAmountList();
    // shows the cell on which the player has clicked and nearby cells
    showTile(row, column);

  }
  //checks if the player has failed if so a message is shown saying "Perdu!"
  else if (fail) {
    timer = false;
    alert("Perdu!");
  }
  //if the tile has not been visited
  else if (!(find(visited,[row, column])!=-1)) {
    //if the shift key is pressed, it flags the tile accordingly
    if (event.shiftKey||event.button==2) {
      flagTile(row, column);
    }

    //else it shows the tile that the player has clicked on
    else {
      showTile(row, column);
    }

    //if the player has not clicked on a mine it checks if the player has
    //clicked on all none-mine tile, if so shows all the tiles and a
    //message saying "Gagné!"
    if (!fail) {
      if (checkFinish()) {
        timer=false
        displayAll();
        alert("Gagn\u00e9!");
      }
    }
    //if the player has clicked on a mine it shows a message saying
    //"Perdu!" and display all the mines
    else {
      timer=false
      displayMines();
      alert("Perdu!");
    }
  }
}

//setEmptyMinefield takes no parameters and creates the empty minefield using
//HTML
function setEmptyMinefield() {
  var currentRow, rowHTML, table;
  //stores the field as table
  table = document.querySelector("#minefield");

  for (var row = 0; row < height; row += 1) {
    //stores the id of the row as line+row
    currentRow = "line" + row.toString();
    table.innerHTML = table.innerHTML + "<tr id=" + currentRow + ">";
    //store the current HTML of the row
    rowHTML = document.querySelector("#" + currentRow);

    for (var column = 0; column < width; column += 1) {
      //stores a new cell of the table in the row, and adds the onmousedown
      //function as well as the id of the cell as tile+row+_+column
      rowHTML.innerHTML = rowHTML.innerHTML + "<td onmousedown=\"clic(" + row.toString() + "," + column.toString() + ",event)\"  id=\"tile" + row.toString() + "_" + column.toString() + "\">" + tileList[11] + "</td>";
    }
    //adds the ending tag of the table
    table.innerHTML = table.innerHTML + "</tr>";
  }
}

//setMineList takes as parameters two list of integers, coordinates were mines
//cannot be put. Sets the location of the mines, in mineList, on the field and
//returns nothing.

function setMineList(rows, columns) {
  var row, tempMineList;
  mineList = [[]];

  //shuffles randomly the mines on the field, and stores the list in
  //tempMineList
  tempMineList = new FYShuffle(rows, columns);
  
  row = 0;

  //for each value in tempMineList add it to the list of list of integers
  //that is mineList
  for (var i = 0; i < tempMineList.length; i += 1) {
    if (Number.parseInt(i / width) > row) {
      row += 1;
      mineList.push([]);
    }

    mineList[row].push(tempMineList[i]);
  }
}

const mul = (arr, times) => Array.from({length: times*arr.length}, (_,i) => arr[i%arr.length]);
//FYShuffle takes as parameters two list of integers, coordinates were mines
//cannot be put. Shuffles the mines in the list and returns the shuffled list.

function FYShuffle(rows, columns) {
  var iColumn, iRow, j, jColumn, jRow, temp, tempMineList;
  tempMineList = mul([1], nbOfMines).concat(mul([0], (width * height - nbOfMines)));

  for (var i = tempMineList.length - 1; i > 0; i += -1) {
    //get a random index between i and 0
    j = Math.floor(Math.random() * (i + 1));
    //converts the coordinate of i and j as coordinates of an array of array
    iRow = Math.floor(i / width);
    jRow = Math.floor(j / width);
    iColumn = i % width;
    jColumn = j % width;
    //checks that no mine end in the 8 tiles surrounding the user clicked tile
    if (rows.includes(iRow) && columns.includes(iColumn)) {
      while (tempMineList[j]===1 || (rows.includes(jRow) && columns.includes(jColumn))){
        j = j < (width * height) - 2 ? j + 1 : 0;
        jColumn = j % width;
        jRow = Math.floor(j / width);
      }
    }
    //swaps the value of the tile i with the tile j
    [tempMineList[i], tempMineList[j]]=[tempMineList[j], tempMineList[i]];
  }
  return tempMineList;
}

//setAmountList takes no parameters and returns nothing. It only adds the
//number of mines surrounding each tile
function setAmountList() {
  for (var row = 0; row < height; row += 1) {
    //adds a new row to amountList
    amountList.push([]);

    for (var column = 0; column < width; column += 1) {
      //calls nbMines which returns the number of mines surrounding the
      //current tile and appends it to the row in amountList
      amountList[row].push(nbMines(row, column));
    }
  }
}

//nbMines takes as parameters two inters, the row and the column of a tile. It
//then checks the number of mines which are surrounding it and returns the
//amount of mines present

function nbMines(row, column) {
  var minesAmount, xrange, yrange;
  minesAmount = 0;
  //xrange and yrange correspond to the coordinates of the tiles surrounding
  //the current tile
  xrange = [column - 1, column, column + 1];
  yrange = [row - 1, row, row + 1];

  for (var column1, i = 0; i < xrange.length; i += 1) {
    column1 = xrange[i];

    //if column1 is out of range of the minefield it skips the value
    if ([-1, width].includes(column1)) {
      continue;
    }

    for (var row1, j = 0; j < yrange.length; j += 1) {
      row1 = yrange[j];
      //if row1 is out of range of the minefield or if column1 and row1
      //corresponds to the cell whose surrounding are being checked it
      //skips the value
      if ([-1, height].includes(row1) || (column1 === column && row1 === row)) {
        continue;
      } 
      //else if the current coordinates corresponds to the location of a
      //mine it increments the amount of mines
      else if (mineList[row1][column1] === 1) {
          minesAmount += 1;
        }
      }
    }
  return minesAmount;
}


//displayMines takes no parameters and returns nothing. It display on the
//minefield the location of the mines.

function displayMines() {
  var tile;

  for (var column = 0; column < width; column += 1) {
    for (var row = 0; row < height; row += 1) {
      //if the current coordinates corresponds to the location of a mine
      //and haven't been already visited or flagged it shows on the
      //minefield the mine
      if (mineList[row][column] === 1 && !((find(visited, [row, column])!=-1) || (find(flagged, [row, column])!=-1))) {
        //gets the tile from the HTML code and changes the images it
        //stores
        tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());
        tile.innerHTML = tileList[9];
      } else if (mineList[row][column] === 0 && (find(flagged,[row, column])!=-1)) {
        //gets the tile from the HTML code and changes the images it
        //stores
        tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());
        tile.innerHTML = tileList[13];
      }
    }
  }
}


//showBlank takes as parameter two integers, the row and column of a tile. It
//returns nothing.

function showBlank(row, column) {
  var tile, xrange, yrange;
  //xrange and yrange correspond to the coordinates of the tiles surrounding
  //the current tile
  xrange = [column - 1, column, column + 1];
  yrange = [row - 1, row, row + 1];

  //If the tile hasn't been visited it adds its coordinates to visited and
  //checks for other surrounding tiles
  if (!(find(visited, [row, column])!=-1)) {
    //Mark the tile visited
    visited.push([row, column]);

    //If the tile is blank then adjust the HTML code of the tile
    if (amountList[row][column] === 0) {
      //Display it to the user
      tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());
      tile.innerHTML = tileList[0];
      
      // if the coordinate are impossible they are removed from the xrange and
      // yrange array
      if (row-1===-1){
        yrange.shift();
      }
      if (row+1===height){
        yrange.pop()
      }
      if (column-1===-1){
        xrange.shift()
      }
      if (column+1===width){
        xrange.pop()
      }

      for (var row1, j = 0; j < yrange.length; j += 1){
        row1=yrange[j];
        for (var column1, i=0; i<xrange.length;i+=1){
          column1=xrange[i];
          //if column1 and row1 corresponds to the cell whose surrounding are being checked it skips the value
          if (column1===column && row1===row){
            continue;
          }
          //if the coordinates of the tile corresponds to another
          //blank tile it calls back showBlank with new coordinates
          else if (amountList[row1][column1]===0){
            showBlank(row1, column1)
          }
          //if the coordinates of the tile corresponds to a list =
          //containing a number, amount of mines surround it, it
          //adjust the HTML code of the tile
          else if (!(find(visited, [row1, column1])!=-1)){
            showTile(row1, column1);
          }
        }
      }
    } else {
      return;
    }
  } else {
    return;
  }
}

// compare takes an array of arrays (haystack) and an array, and returns True
// if the array is pressent in the haystack
function find(haystack, needle){
  var i, j, current;
  for(i = 0; i < haystack.length; ++i){
    if(needle.length === haystack[i].length){
      current = haystack[i];
      for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
      if(j === needle.length)
        return i;
    }
  }
  return -1;
}

//showTile takes as parameters two integers, the row and column. It dislays the
//current tile being pressed accordingly and returns nothing

function showTile(row, column) {
  var tile, amount;
  amount=amountList[row][column];
  tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());
  //if the coordinates of the tile represent one that has been flagged or visited, it exits showTile
  if (find(flagged,[row, column])!=-1 || find(visited,[row, column])!=-1) {
    return;
  }
  //if the coordinates of the tile represent one that is a a mine, it
  //displays the mine to the user and sets the condition of fail as True
  else if (mineList[row][column] === 1) {
    visited.push([row, column]);
    //Display it to the user
    tile.innerHTML = tileList[12];
    //fail condition set to True
    fail = true;
    return;
  }
  //if the coordinates of the tile, show a blank tile it calls showBlank with
  //its coordinates.
  else if (amount === 0) {
    showBlank(row, column);
    return;
  } else {
    //Mark the tile as visited
    visited.push([row, column]);
    //Display it to the user
    tile.innerHTML = tileList[amount];
    return;
  }
}

//flagTile takes as parameters two integers, the row and column. Changes the
//HTML code in order to show the tile as flagged or not flagged accordingly and
//returns nothing

function flagTile(row, column) {
  var tile;
  //gets the HTML code of the tile
  tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());

  if (!(find(flagged, [row, column])!=-1)) {
    //flags the tile
    tile.innerHTML = tileList[10];
    //appends the coordinates to the flagged list
    flagged.push([row, column]);
    document.getElementById("quantity").innerHTML = nbOfMines - flagged.length;
  } else {
    //removes the flag from the tile and removes the coordinates from the
    //flagged list
    tile.innerHTML = tileList[11];
    flagged.splice(flagged.indexOf([row, column]), 1);
  }
}

//checkFinish takes no parameters and checks if all the non-mine tiles have
//been visited and returns a boolean accordingly

function checkFinish() {
  var emptyTiles;
  //gets the number of non-mine tiles
  emptyTiles = (height * width) - nbOfMines;

  //if the number of visited tiles does not corresponds to the number of
  //empty tiles returns False
  if (visited.length != emptyTiles) {
    return false;
  }
  //else it checks for all the visited tiles if they cooresponds to non-mine
  //tiles, if not returns False, else sets finished to True and returns True
  for (var pair, i = 0; i < visited.length; i += 1) {
    pair = visited[i];

    if (mineList[pair[0]][pair[1]] != 0) {
      return false;
    }
  }

  finished = true;
  return finished;
}

//displayAll takes no parameters and changes the HTML code to display all the
//tiles of the field. Returns nothing

function displayAll() {
  var tile, tileID;
  displayMines();

  for (var pair, i = 0; i < visited.length; i += 1) {
    pair = visited[i];
    tileID = "#tile" + pair[0].toString() + "_" + pair[1].toString();
    tile = document.querySelector(tileID);
    tile.innerHTML = tileList[amountList[pair[0]][pair[1]]];
  }
}

function warning(){
  alert("Les paramètres de votre démineur sont incorrects veuillez les vérifier pour pouvoir jouer.")
}

// resets the board, change the minefield size and amount of mines based on the
// user's settings, as well as sets the highscores.
function reset() {
  var table, classement, classementHTML, type, result, classementTitle, tempHeight, tempWidth, tempMineNb;
  tempHeight=Number.parseInt(document.querySelector("#height").value);
  tempWidth=Number.parseInt(document.querySelector("#width").value);
  tempMineNb=Number.parseInt(document.querySelector("#mines").value)
  erreur=tempWidth<2 ||tempHeight<2||tempMineNb>((tempHeight*tempWidth)-9)
  if (erreur){
    warning();
    return;
  }
  if (!fail && finished){
    type=height.toString()+"_"+width.toString()+"_"+nbOfMines.toString();

    classement=JSON.parse(localStorage.getItem('classement'))||{};

    result=[hour+"h"+minute+"m"+second+"s", (hour/360)+(minute/60)+second];
    
    if (classement[type]!==undefined){
      classement[type].push(result);
    }
    else{
      classement[type]=[result];
    }
    classement[type].sort(function(a, b) { return a[1] - b[1]; });
    if (classement[type].length>5){
      classement[type].pop();
    }
    localStorage.setItem("classement",JSON.stringify(classement));

    classementTitle=document.querySelector("#classement-title");
    classementTitle.innerHTML = "Classement for " + height.toString() + "x" + width.toString() + " " + nbOfMines + " mines";
    classementHTML=document.querySelector("#classement");
    classementHTML.innerHTML="";
    for (var i=0; i<classement[type].length; i+=1){
      classementHTML.innerHTML=classementHTML.innerHTML+"<li>"+classement[type][i][0]+"</li>"
    }
  }
  mineList.length=0;
  amountList.length=0;
  flagged.length=0;
  visited.length=0;
  finished = false;
  fail = false;
  table = document.querySelector("#minefield");
  table.innerHTML = "";
  height = Number.parseInt(document.querySelector("#height").value)
  width=Number.parseInt(document.querySelector("#width").value)
  nbOfMines=Number.parseInt(document.querySelector("#mines").value)
  timer = false;
	hour = 0;
	minute = 0;
	second = 0;
  document.getElementById("quantity").innerHTML=nbOfMines.toString();
	document.getElementById('hr').innerHTML = "00";
	document.getElementById('min').innerHTML = "00";
	document.getElementById('sec').innerHTML = "00";

  
  setEmptyMinefield();
}

//                           global values

//stores the field with 1 given for location of a mine and 0 for a non-mine
//tile in a list of list of integers
mineList = [];

//stores the number of mines surrounding a each tile in a list of list of
//integers
amountList = [];

//stores each tile image HTML code in a list
tileList = ["<img src=\"./assets/img/0.png\">", 
            "<img src=\"./assets/img/1.png\">", 
            "<img src=\"./assets/img/2.png\">", 
            "<img src=\"./assets/img/3.png\">", 
            "<img src=\"./assets/img/4.png\">", 
            "<img src=\"./assets/img/5.png\">", 
            "<img src=\"./assets/img/6.png\">", 
            "<img src=\"./assets/img/7.png\">", 
            "<img src=\"./assets/img/8.png\">", 
            "<img src=\"./assets/img/mine.png\">",
            "<img src=\"./assets/img/flag.png\">", 
            "<img src=\"./assets/img/blank.png\">", 
            "<img src=\"./assets/img/mine-red.png\">", 
            "<img src=\"./assets/img/mine-red-x.png\">"];

//stores the coordinates of visited tiles in a list
visited = [];

//stores the coordinates of flagged tiles in a list
flagged = [];

//sets the width of the minefield as an integer
width = 10;

//sets the height of the minefield as an integer
height = 10;

//sets the total number of mines on the field as an integer
nbOfMines = 30;

//fail and finished condition as boolean
fail = false;
finished = false;
erreur = false;
hour = 00;
minute = 00;
second = 00;
count = 00;
