var amountList, fail, finished, flagged, height, mineList, nbOfMines, tileList, visited, width, calls, hour, minute, second, count, beginner, intermediate, expert, selected;

window.onload = function(){
  width=Number.parseInt(document.querySelector("#width").value);
  height=Number.parseInt(document.querySelector("#height").value);
  nbOfMines=Number.parseInt(document.querySelector("#mines").value);
  document.getElementById("quantity").innerHTML=nbOfMines.toString();
  setEmptyMinefield();
}

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

//clic takes as parameters two integer, width and height, and a boolean, if
//the shift key has been pressed or not. It checks which tile has been pressed
//and reacts accordingly. It returns nothing
function clic(row, column, event) {
  if (fail || finished || erreur) return;

  if (visited.length === 0) {
    timer = true;
    stopWatch();
    setMineList([row - 1, row, row + 1], [column - 1, column, column + 1]);
    setAmountList();
    showTile(row, column);
    progress();
  } else if (find(visited,[row, column])===-1) {
    if (event.shiftKey || event.button === 2) {
      flagTile(row, column);
      return;
    }
    showTile(row, column);
    progress();

    if (!fail && checkFinish()) {
      timer = false;
      displayAll();
      alert("Gagn\u00e9!");
      progress();
    }
  }

  if (fail) {
    timer = false;
    displayMines();
    alert("Perdu!");
  }
}

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

function FYShuffle(rows, columns) {
  var iRow, iColumn, j, jRow, jColumn, tempMineList;
  const rowSet = new Set(rows), columnSet = new Set(columns);
  tempMineList = mul([1], nbOfMines).concat(mul([0], (width * height - nbOfMines)));
  for (var i = tempMineList.length - 1; i > 0; i--) {
    //get a random index between i and 0
    j = Math.floor(Math.random() * (i + 1));
    //calculates the row and column directly
    iRow = Math.floor(i / width);
    jRow = Math.floor(j / width);
    iColumn = i - iRow * width;
    jColumn = j - jRow * width;
    //check if the element is in the Set
    if (rowSet.has(iRow) && columnSet.has(iColumn)) {
      while (tempMineList[j]===1 || (rowSet.has(jRow) && columnSet.has(jColumn))){
        j = j < (width * height) - 2 ? j + 1 : 0;
        //calculates the row and column directly
        jRow = Math.floor(j / width);
        jColumn = j - jRow * width;
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
function nbMines(row, column) {
  var minesAmount = 0;

  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= height) {
      continue;
    }

    for (var j = column - 1; j <= column + 1; j++) {
      if (j < 0 || j >= width || (i === row && j === column)) {
        continue;
      }

      if (mineList[i][j] === 1) {
        minesAmount++;
      }
    }
  }
  return minesAmount;
}

function displayMines() {
  for (var row = 0; row < height; row += 1) {
    for (var column = 0; column < width; column += 1) {
      if (mineList[row][column] === 1 &&
          !((find(visited, [row, column])!=-1) || 
          (find(flagged, [row, column])!=-1))) {
        document.querySelector("#tile" + row.toString() + "_" + column.toString()).innerHTML = tileList[9];
      } else if (mineList[row][column] === 0 &&
          (find(flagged,[row, column])!=-1)) {
        document.querySelector("#tile" + row.toString() + "_" + column.toString()).innerHTML = tileList[13];
      }
    }
  }
}

function showBlank(row, column) {
  var tile, xrange, yrange, row1, column1;
  xrange = [column - 1, column, column + 1];
  yrange = [row - 1, row, row + 1];
  if (find(visited, [row, column])!==-1) return;
  visited.push([row, column]);
  if (amountList[row][column] !== 0) return;
  tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());
  tile.innerHTML = tileList[0];
  if (row === 0) yrange.shift();
  if (row === height - 1) yrange.pop();
  if (column === 0) xrange.shift();
  if (column === width - 1) xrange.pop();
  for (var j = 0; j < yrange.length; j++) {
    for (var i = 0; i < xrange.length; i++) {
      row1 = yrange[j];
      column1 = xrange[i];
      if (row1 === row && column1 === column) continue;
      else if (amountList[row1][column1] === 0) {
        showBlank(row1, column1);
      } else if ((find(visited, [row1, column1])===-1)) {
        showTile(row1, column1);
      }
    }
  }
}

function find(haystack, needle){
  var i, j, current;
  for(i = 0; i < haystack.length; ++i){
    if(needle.length === haystack[i].length){
      current = haystack[i];
      for(j = 0; j < needle.length && needle[j] === current[j]; ++j);
      if(j === needle.length) return i;
    }
  }
  return -1;
}

function showTile(row, column) {
  var tile, amount;
  
  amount=amountList[row][column];
  tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());

  if (find(flagged,[row, column])!=-1 || find(visited,[row, column])!=-1) return;
  else if (mineList[row][column] === 1) {
    visited.push([row, column]);
    tile.innerHTML = tileList[12];
    fail = true;
  } else if (amount === 0) {
    showBlank(row, column);
  } else {
    visited.push([row, column]);
    tile.innerHTML = tileList[amount];
  }
}

function flagTile(row, column) {
  var tile, flagIndex;
  //gets the HTML code of the tile
  tile = document.querySelector("#tile" + row.toString() + "_" + column.toString());

  // find the index of the flagged tile in the flagged array
  flagIndex = find(flagged, [row, column]);

  if (flagIndex === -1) {
    //flags the tile
    tile.innerHTML = tileList[10];
    //appends the coordinates to the flagged list
    flagged.push([row, column]);
    document.getElementById("quantity").innerHTML = nbOfMines - flagged.length;
  } else {
    //removes the flag from the tile and removes the coordinates from the
    //flagged list
    tile.innerHTML = tileList[11];
    flagged.splice(flagIndex, 1);
  }
}

function checkFinish() {
  var emptyTiles = (height * width) - nbOfMines;
  if (visited.length !== emptyTiles) return false;
  for (var i = 0; i < visited.length; i++) {
    if (mineList[visited[i][0]][visited[i][1]]) return false;
  }
  finished = true;
  return true;
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

function specificGrid(row, column, mines, desiredTable){
  var desired;
  if (fail||finished){
    setHighScore();
  }
  height=row;
  width=column;
  nbOfMines=mines;
  if (nbOfMines==10){
    selected="débutant";
  }  else if (nbOfMines==40){
    selected="intermédiaire";
  }  else{
    selected="expert";
  }
  desired=[desiredTable, height, width, nbOfMines]
  reset(true, desired);
}

function warning(){
  alert("Les paramètres de votre démineur sont incorrects veuillez les vérifier pour pouvoir jouer.")
}

// resets the board, change the minefield size and amount of mines based on the
// user's settings, as well as sets the highscores.
function reset(specific, desired) {
  var table;
  setProgressToZero();
  if ((fail||finished) && !specific){
    setHighScore();
  }
  mineList.length=0;
  amountList.length=0;
  flagged.length=0;
  visited.length=0;
  finished = false;
  fail = false;
  table = document.querySelector("#minefield");
  table.innerHTML = "";
  timer = false;
	hour = 0;
	minute = 0;
	second = 0;
	document.getElementById('hr').innerHTML = "00";
	document.getElementById('min').innerHTML = "00";
	document.getElementById('sec').innerHTML = "00";
  
  if (!specific && selected===null){
    height = Number.parseInt(document.querySelector("#height").value);
    width=Number.parseInt(document.querySelector("#width").value);
    nbOfMines=Number.parseInt(document.querySelector("#mines").value);
    document.getElementById("quantity").innerHTML=nbOfMines.toString();
    selected=null;
    showHighScore();
    setEmptyMinefield();
  } else if (selected!==null  && !specific){
    
    setEmptyMinefield();

  } else {
    document.querySelector("#height").value=desired[1];
    document.querySelector("#width").value=desired[2];
    document.querySelector("#mines").value=desired[3];
    document.getElementById("quantity").innerHTML=desired[3].toString();
    table=document.querySelector("#minefield")
    table.innerHTML=""
    table.innerHTML=desired[0];
    showHighScore();
  }
}

function setSpecificToNull(){
  selected=null;
  return;
}

function setHighScore() {
  var classement, type, result;
  erreur=width<4 ||height<4||nbOfMines>((height*width)-9)||nbOfMines<1;
  type=selected!==null ? selected : height.toString() + "_" + width.toString() + "_" + nbOfMines
  if (erreur){
    warning();
    return;
  }
  if (!fail && finished){
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
    showHighScore();
  }
}

function setProgressToZero(){
  var elem;
  elem=document.getElementById("myBar");
  elem.style.width = "0%";
  elem.innerHTML = "0%";
}
function showHighScore(){
  var classementTitle, classementHTML, classement, type;
  type=selected!==null ? selected : height.toString() + "_" + width.toString() + "_" + nbOfMines
  classement=JSON.parse(localStorage.getItem('classement'))||{};
  classementTitle=document.querySelector("#classement-title");
  if (!["débutant", "intermédiaire", "expert"].includes(selected)){
    classementTitle.innerHTML = "Classement pour " + height.toString() + "x" + width.toString() + " " + nbOfMines + " mines";
  }
  else{
    classementTitle.innerHTML = "Classement " + selected;
  }
  
  classementHTML=document.querySelector("#classement");
  classementHTML.innerHTML="";
  if (classement[type] === undefined) return;
  for (var i=0; i<classement[type].length; i+=1){
    classementHTML.innerHTML=classementHTML.innerHTML+"<li>"+classement[type][i][0]+"</li>"
  }
}
function progress() {
  var elem, done;
  
  elem=document.getElementById("myBar");
  done=Math.floor((visited.length/((height*width)-nbOfMines))*100);
  elem.style.width = done + "%";
  elem.innerHTML = done + "%";
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
selected=null;

//prewritten specific grids
beginner='<tbody><tr id="line0"><td onmousedown="clic(0,0,event)" id="tile0_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,1,event)" id="tile0_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,2,event)" id="tile0_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,3,event)" id="tile0_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,4,event)" id="tile0_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,5,event)" id="tile0_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,6,event)" id="tile0_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,7,event)" id="tile0_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line1"><td onmousedown="clic(1,0,event)" id="tile1_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,1,event)" id="tile1_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,2,event)" id="tile1_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,3,event)" id="tile1_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,4,event)" id="tile1_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,5,event)" id="tile1_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,6,event)" id="tile1_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,7,event)" id="tile1_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line2"><td onmousedown="clic(2,0,event)" id="tile2_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,1,event)" id="tile2_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,2,event)" id="tile2_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,3,event)" id="tile2_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,4,event)" id="tile2_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,5,event)" id="tile2_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,6,event)" id="tile2_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,7,event)" id="tile2_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line3"><td onmousedown="clic(3,0,event)" id="tile3_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,1,event)" id="tile3_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,2,event)" id="tile3_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,3,event)" id="tile3_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,4,event)" id="tile3_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,5,event)" id="tile3_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,6,event)" id="tile3_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,7,event)" id="tile3_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line4"><td onmousedown="clic(4,0,event)" id="tile4_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,1,event)" id="tile4_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,2,event)" id="tile4_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,3,event)" id="tile4_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,4,event)" id="tile4_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,5,event)" id="tile4_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,6,event)" id="tile4_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,7,event)" id="tile4_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line5"><td onmousedown="clic(5,0,event)" id="tile5_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,1,event)" id="tile5_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,2,event)" id="tile5_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,3,event)" id="tile5_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,4,event)" id="tile5_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,5,event)" id="tile5_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,6,event)" id="tile5_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,7,event)" id="tile5_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line6"><td onmousedown="clic(6,0,event)" id="tile6_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,1,event)" id="tile6_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,2,event)" id="tile6_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,3,event)" id="tile6_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,4,event)" id="tile6_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,5,event)" id="tile6_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,6,event)" id="tile6_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,7,event)" id="tile6_7"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line7"><td onmousedown="clic(7,0,event)" id="tile7_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,1,event)" id="tile7_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,2,event)" id="tile7_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,3,event)" id="tile7_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,4,event)" id="tile7_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,5,event)" id="tile7_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,6,event)" id="tile7_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,7,event)" id="tile7_7"><img src="./assets/img/blank.png"></td></tr></tbody>'

intermediate='<tbody><tr id="line0"><td onmousedown="clic(0,0,event)" id="tile0_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,1,event)" id="tile0_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,2,event)" id="tile0_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,3,event)" id="tile0_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,4,event)" id="tile0_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,5,event)" id="tile0_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,6,event)" id="tile0_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,7,event)" id="tile0_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,8,event)" id="tile0_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,9,event)" id="tile0_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,10,event)" id="tile0_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,11,event)" id="tile0_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,12,event)" id="tile0_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,13,event)" id="tile0_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,14,event)" id="tile0_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,15,event)" id="tile0_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line1"><td onmousedown="clic(1,0,event)" id="tile1_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,1,event)" id="tile1_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,2,event)" id="tile1_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,3,event)" id="tile1_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,4,event)" id="tile1_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,5,event)" id="tile1_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,6,event)" id="tile1_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,7,event)" id="tile1_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,8,event)" id="tile1_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,9,event)" id="tile1_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,10,event)" id="tile1_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,11,event)" id="tile1_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,12,event)" id="tile1_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,13,event)" id="tile1_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,14,event)" id="tile1_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,15,event)" id="tile1_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line2"><td onmousedown="clic(2,0,event)" id="tile2_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,1,event)" id="tile2_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,2,event)" id="tile2_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,3,event)" id="tile2_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,4,event)" id="tile2_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,5,event)" id="tile2_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,6,event)" id="tile2_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,7,event)" id="tile2_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,8,event)" id="tile2_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,9,event)" id="tile2_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,10,event)" id="tile2_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,11,event)" id="tile2_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,12,event)" id="tile2_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,13,event)" id="tile2_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,14,event)" id="tile2_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,15,event)" id="tile2_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line3"><td onmousedown="clic(3,0,event)" id="tile3_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,1,event)" id="tile3_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,2,event)" id="tile3_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,3,event)" id="tile3_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,4,event)" id="tile3_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,5,event)" id="tile3_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,6,event)" id="tile3_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,7,event)" id="tile3_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,8,event)" id="tile3_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,9,event)" id="tile3_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,10,event)" id="tile3_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,11,event)" id="tile3_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,12,event)" id="tile3_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,13,event)" id="tile3_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,14,event)" id="tile3_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,15,event)" id="tile3_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line4"><td onmousedown="clic(4,0,event)" id="tile4_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,1,event)" id="tile4_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,2,event)" id="tile4_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,3,event)" id="tile4_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,4,event)" id="tile4_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,5,event)" id="tile4_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,6,event)" id="tile4_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,7,event)" id="tile4_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,8,event)" id="tile4_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,9,event)" id="tile4_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,10,event)" id="tile4_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,11,event)" id="tile4_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,12,event)" id="tile4_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,13,event)" id="tile4_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,14,event)" id="tile4_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,15,event)" id="tile4_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line5"><td onmousedown="clic(5,0,event)" id="tile5_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,1,event)" id="tile5_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,2,event)" id="tile5_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,3,event)" id="tile5_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,4,event)" id="tile5_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,5,event)" id="tile5_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,6,event)" id="tile5_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,7,event)" id="tile5_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,8,event)" id="tile5_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,9,event)" id="tile5_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,10,event)" id="tile5_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,11,event)" id="tile5_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,12,event)" id="tile5_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,13,event)" id="tile5_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,14,event)" id="tile5_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,15,event)" id="tile5_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line6"><td onmousedown="clic(6,0,event)" id="tile6_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,1,event)" id="tile6_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,2,event)" id="tile6_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,3,event)" id="tile6_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,4,event)" id="tile6_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,5,event)" id="tile6_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,6,event)" id="tile6_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,7,event)" id="tile6_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,8,event)" id="tile6_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,9,event)" id="tile6_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,10,event)" id="tile6_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,11,event)" id="tile6_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,12,event)" id="tile6_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,13,event)" id="tile6_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,14,event)" id="tile6_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,15,event)" id="tile6_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line7"><td onmousedown="clic(7,0,event)" id="tile7_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,1,event)" id="tile7_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,2,event)" id="tile7_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,3,event)" id="tile7_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,4,event)" id="tile7_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,5,event)" id="tile7_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,6,event)" id="tile7_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,7,event)" id="tile7_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,8,event)" id="tile7_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,9,event)" id="tile7_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,10,event)" id="tile7_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,11,event)" id="tile7_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,12,event)" id="tile7_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,13,event)" id="tile7_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,14,event)" id="tile7_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,15,event)" id="tile7_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line8"><td onmousedown="clic(8,0,event)" id="tile8_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,1,event)" id="tile8_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,2,event)" id="tile8_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,3,event)" id="tile8_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,4,event)" id="tile8_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,5,event)" id="tile8_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,6,event)" id="tile8_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,7,event)" id="tile8_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,8,event)" id="tile8_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,9,event)" id="tile8_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,10,event)" id="tile8_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,11,event)" id="tile8_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,12,event)" id="tile8_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,13,event)" id="tile8_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,14,event)" id="tile8_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,15,event)" id="tile8_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line9"><td onmousedown="clic(9,0,event)" id="tile9_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,1,event)" id="tile9_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,2,event)" id="tile9_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,3,event)" id="tile9_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,4,event)" id="tile9_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,5,event)" id="tile9_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,6,event)" id="tile9_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,7,event)" id="tile9_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,8,event)" id="tile9_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,9,event)" id="tile9_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,10,event)" id="tile9_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,11,event)" id="tile9_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,12,event)" id="tile9_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,13,event)" id="tile9_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,14,event)" id="tile9_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,15,event)" id="tile9_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line10"><td onmousedown="clic(10,0,event)" id="tile10_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,1,event)" id="tile10_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,2,event)" id="tile10_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,3,event)" id="tile10_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,4,event)" id="tile10_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,5,event)" id="tile10_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,6,event)" id="tile10_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,7,event)" id="tile10_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,8,event)" id="tile10_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,9,event)" id="tile10_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,10,event)" id="tile10_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,11,event)" id="tile10_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,12,event)" id="tile10_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,13,event)" id="tile10_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,14,event)" id="tile10_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,15,event)" id="tile10_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line11"><td onmousedown="clic(11,0,event)" id="tile11_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,1,event)" id="tile11_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,2,event)" id="tile11_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,3,event)" id="tile11_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,4,event)" id="tile11_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,5,event)" id="tile11_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,6,event)" id="tile11_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,7,event)" id="tile11_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,8,event)" id="tile11_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,9,event)" id="tile11_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,10,event)" id="tile11_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,11,event)" id="tile11_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,12,event)" id="tile11_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,13,event)" id="tile11_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,14,event)" id="tile11_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,15,event)" id="tile11_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line12"><td onmousedown="clic(12,0,event)" id="tile12_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,1,event)" id="tile12_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,2,event)" id="tile12_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,3,event)" id="tile12_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,4,event)" id="tile12_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,5,event)" id="tile12_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,6,event)" id="tile12_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,7,event)" id="tile12_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,8,event)" id="tile12_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,9,event)" id="tile12_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,10,event)" id="tile12_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,11,event)" id="tile12_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,12,event)" id="tile12_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,13,event)" id="tile12_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,14,event)" id="tile12_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,15,event)" id="tile12_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line13"><td onmousedown="clic(13,0,event)" id="tile13_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,1,event)" id="tile13_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,2,event)" id="tile13_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,3,event)" id="tile13_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,4,event)" id="tile13_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,5,event)" id="tile13_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,6,event)" id="tile13_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,7,event)" id="tile13_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,8,event)" id="tile13_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,9,event)" id="tile13_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,10,event)" id="tile13_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,11,event)" id="tile13_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,12,event)" id="tile13_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,13,event)" id="tile13_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,14,event)" id="tile13_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,15,event)" id="tile13_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line14"><td onmousedown="clic(14,0,event)" id="tile14_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,1,event)" id="tile14_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,2,event)" id="tile14_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,3,event)" id="tile14_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,4,event)" id="tile14_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,5,event)" id="tile14_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,6,event)" id="tile14_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,7,event)" id="tile14_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,8,event)" id="tile14_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,9,event)" id="tile14_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,10,event)" id="tile14_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,11,event)" id="tile14_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,12,event)" id="tile14_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,13,event)" id="tile14_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,14,event)" id="tile14_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,15,event)" id="tile14_15"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line15"><td onmousedown="clic(15,0,event)" id="tile15_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,1,event)" id="tile15_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,2,event)" id="tile15_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,3,event)" id="tile15_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,4,event)" id="tile15_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,5,event)" id="tile15_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,6,event)" id="tile15_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,7,event)" id="tile15_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,8,event)" id="tile15_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,9,event)" id="tile15_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,10,event)" id="tile15_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,11,event)" id="tile15_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,12,event)" id="tile15_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,13,event)" id="tile15_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,14,event)" id="tile15_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,15,event)" id="tile15_15"><img src="./assets/img/blank.png"></td></tr></tbody>'

expert='<tbody><tr id="line0"><td onmousedown="clic(0,0,event)" id="tile0_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,1,event)" id="tile0_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,2,event)" id="tile0_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,3,event)" id="tile0_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,4,event)" id="tile0_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,5,event)" id="tile0_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,6,event)" id="tile0_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,7,event)" id="tile0_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,8,event)" id="tile0_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,9,event)" id="tile0_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,10,event)" id="tile0_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,11,event)" id="tile0_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,12,event)" id="tile0_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,13,event)" id="tile0_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,14,event)" id="tile0_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,15,event)" id="tile0_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,16,event)" id="tile0_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,17,event)" id="tile0_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,18,event)" id="tile0_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,19,event)" id="tile0_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,20,event)" id="tile0_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,21,event)" id="tile0_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,22,event)" id="tile0_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,23,event)" id="tile0_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,24,event)" id="tile0_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,25,event)" id="tile0_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,26,event)" id="tile0_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,27,event)" id="tile0_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,28,event)" id="tile0_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(0,29,event)" id="tile0_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line1"><td onmousedown="clic(1,0,event)" id="tile1_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,1,event)" id="tile1_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,2,event)" id="tile1_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,3,event)" id="tile1_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,4,event)" id="tile1_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,5,event)" id="tile1_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,6,event)" id="tile1_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,7,event)" id="tile1_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,8,event)" id="tile1_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,9,event)" id="tile1_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,10,event)" id="tile1_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,11,event)" id="tile1_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,12,event)" id="tile1_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,13,event)" id="tile1_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,14,event)" id="tile1_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,15,event)" id="tile1_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,16,event)" id="tile1_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,17,event)" id="tile1_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,18,event)" id="tile1_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,19,event)" id="tile1_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,20,event)" id="tile1_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,21,event)" id="tile1_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,22,event)" id="tile1_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,23,event)" id="tile1_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,24,event)" id="tile1_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,25,event)" id="tile1_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,26,event)" id="tile1_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,27,event)" id="tile1_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,28,event)" id="tile1_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(1,29,event)" id="tile1_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line2"><td onmousedown="clic(2,0,event)" id="tile2_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,1,event)" id="tile2_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,2,event)" id="tile2_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,3,event)" id="tile2_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,4,event)" id="tile2_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,5,event)" id="tile2_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,6,event)" id="tile2_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,7,event)" id="tile2_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,8,event)" id="tile2_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,9,event)" id="tile2_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,10,event)" id="tile2_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,11,event)" id="tile2_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,12,event)" id="tile2_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,13,event)" id="tile2_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,14,event)" id="tile2_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,15,event)" id="tile2_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,16,event)" id="tile2_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,17,event)" id="tile2_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,18,event)" id="tile2_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,19,event)" id="tile2_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,20,event)" id="tile2_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,21,event)" id="tile2_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,22,event)" id="tile2_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,23,event)" id="tile2_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,24,event)" id="tile2_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,25,event)" id="tile2_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,26,event)" id="tile2_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,27,event)" id="tile2_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,28,event)" id="tile2_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(2,29,event)" id="tile2_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line3"><td onmousedown="clic(3,0,event)" id="tile3_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,1,event)" id="tile3_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,2,event)" id="tile3_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,3,event)" id="tile3_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,4,event)" id="tile3_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,5,event)" id="tile3_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,6,event)" id="tile3_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,7,event)" id="tile3_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,8,event)" id="tile3_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,9,event)" id="tile3_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,10,event)" id="tile3_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,11,event)" id="tile3_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,12,event)" id="tile3_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,13,event)" id="tile3_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,14,event)" id="tile3_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,15,event)" id="tile3_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,16,event)" id="tile3_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,17,event)" id="tile3_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,18,event)" id="tile3_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,19,event)" id="tile3_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,20,event)" id="tile3_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,21,event)" id="tile3_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,22,event)" id="tile3_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,23,event)" id="tile3_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,24,event)" id="tile3_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,25,event)" id="tile3_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,26,event)" id="tile3_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,27,event)" id="tile3_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,28,event)" id="tile3_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(3,29,event)" id="tile3_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line4"><td onmousedown="clic(4,0,event)" id="tile4_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,1,event)" id="tile4_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,2,event)" id="tile4_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,3,event)" id="tile4_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,4,event)" id="tile4_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,5,event)" id="tile4_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,6,event)" id="tile4_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,7,event)" id="tile4_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,8,event)" id="tile4_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,9,event)" id="tile4_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,10,event)" id="tile4_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,11,event)" id="tile4_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,12,event)" id="tile4_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,13,event)" id="tile4_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,14,event)" id="tile4_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,15,event)" id="tile4_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,16,event)" id="tile4_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,17,event)" id="tile4_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,18,event)" id="tile4_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,19,event)" id="tile4_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,20,event)" id="tile4_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,21,event)" id="tile4_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,22,event)" id="tile4_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,23,event)" id="tile4_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,24,event)" id="tile4_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,25,event)" id="tile4_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,26,event)" id="tile4_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,27,event)" id="tile4_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,28,event)" id="tile4_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(4,29,event)" id="tile4_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line5"><td onmousedown="clic(5,0,event)" id="tile5_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,1,event)" id="tile5_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,2,event)" id="tile5_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,3,event)" id="tile5_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,4,event)" id="tile5_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,5,event)" id="tile5_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,6,event)" id="tile5_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,7,event)" id="tile5_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,8,event)" id="tile5_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,9,event)" id="tile5_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,10,event)" id="tile5_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,11,event)" id="tile5_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,12,event)" id="tile5_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,13,event)" id="tile5_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,14,event)" id="tile5_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,15,event)" id="tile5_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,16,event)" id="tile5_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,17,event)" id="tile5_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,18,event)" id="tile5_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,19,event)" id="tile5_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,20,event)" id="tile5_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,21,event)" id="tile5_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,22,event)" id="tile5_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,23,event)" id="tile5_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,24,event)" id="tile5_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,25,event)" id="tile5_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,26,event)" id="tile5_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,27,event)" id="tile5_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,28,event)" id="tile5_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(5,29,event)" id="tile5_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line6"><td onmousedown="clic(6,0,event)" id="tile6_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,1,event)" id="tile6_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,2,event)" id="tile6_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,3,event)" id="tile6_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,4,event)" id="tile6_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,5,event)" id="tile6_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,6,event)" id="tile6_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,7,event)" id="tile6_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,8,event)" id="tile6_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,9,event)" id="tile6_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,10,event)" id="tile6_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,11,event)" id="tile6_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,12,event)" id="tile6_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,13,event)" id="tile6_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,14,event)" id="tile6_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,15,event)" id="tile6_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,16,event)" id="tile6_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,17,event)" id="tile6_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,18,event)" id="tile6_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,19,event)" id="tile6_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,20,event)" id="tile6_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,21,event)" id="tile6_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,22,event)" id="tile6_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,23,event)" id="tile6_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,24,event)" id="tile6_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,25,event)" id="tile6_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,26,event)" id="tile6_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,27,event)" id="tile6_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,28,event)" id="tile6_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(6,29,event)" id="tile6_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line7"><td onmousedown="clic(7,0,event)" id="tile7_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,1,event)" id="tile7_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,2,event)" id="tile7_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,3,event)" id="tile7_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,4,event)" id="tile7_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,5,event)" id="tile7_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,6,event)" id="tile7_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,7,event)" id="tile7_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,8,event)" id="tile7_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,9,event)" id="tile7_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,10,event)" id="tile7_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,11,event)" id="tile7_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,12,event)" id="tile7_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,13,event)" id="tile7_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,14,event)" id="tile7_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,15,event)" id="tile7_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,16,event)" id="tile7_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,17,event)" id="tile7_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,18,event)" id="tile7_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,19,event)" id="tile7_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,20,event)" id="tile7_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,21,event)" id="tile7_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,22,event)" id="tile7_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,23,event)" id="tile7_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,24,event)" id="tile7_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,25,event)" id="tile7_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,26,event)" id="tile7_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,27,event)" id="tile7_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,28,event)" id="tile7_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(7,29,event)" id="tile7_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line8"><td onmousedown="clic(8,0,event)" id="tile8_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,1,event)" id="tile8_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,2,event)" id="tile8_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,3,event)" id="tile8_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,4,event)" id="tile8_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,5,event)" id="tile8_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,6,event)" id="tile8_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,7,event)" id="tile8_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,8,event)" id="tile8_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,9,event)" id="tile8_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,10,event)" id="tile8_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,11,event)" id="tile8_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,12,event)" id="tile8_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,13,event)" id="tile8_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,14,event)" id="tile8_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,15,event)" id="tile8_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,16,event)" id="tile8_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,17,event)" id="tile8_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,18,event)" id="tile8_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,19,event)" id="tile8_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,20,event)" id="tile8_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,21,event)" id="tile8_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,22,event)" id="tile8_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,23,event)" id="tile8_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,24,event)" id="tile8_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,25,event)" id="tile8_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,26,event)" id="tile8_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,27,event)" id="tile8_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,28,event)" id="tile8_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(8,29,event)" id="tile8_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line9"><td onmousedown="clic(9,0,event)" id="tile9_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,1,event)" id="tile9_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,2,event)" id="tile9_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,3,event)" id="tile9_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,4,event)" id="tile9_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,5,event)" id="tile9_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,6,event)" id="tile9_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,7,event)" id="tile9_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,8,event)" id="tile9_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,9,event)" id="tile9_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,10,event)" id="tile9_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,11,event)" id="tile9_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,12,event)" id="tile9_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,13,event)" id="tile9_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,14,event)" id="tile9_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,15,event)" id="tile9_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,16,event)" id="tile9_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,17,event)" id="tile9_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,18,event)" id="tile9_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,19,event)" id="tile9_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,20,event)" id="tile9_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,21,event)" id="tile9_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,22,event)" id="tile9_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,23,event)" id="tile9_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,24,event)" id="tile9_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,25,event)" id="tile9_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,26,event)" id="tile9_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,27,event)" id="tile9_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,28,event)" id="tile9_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(9,29,event)" id="tile9_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line10"><td onmousedown="clic(10,0,event)" id="tile10_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,1,event)" id="tile10_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,2,event)" id="tile10_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,3,event)" id="tile10_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,4,event)" id="tile10_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,5,event)" id="tile10_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,6,event)" id="tile10_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,7,event)" id="tile10_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,8,event)" id="tile10_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,9,event)" id="tile10_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,10,event)" id="tile10_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,11,event)" id="tile10_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,12,event)" id="tile10_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,13,event)" id="tile10_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,14,event)" id="tile10_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,15,event)" id="tile10_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,16,event)" id="tile10_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,17,event)" id="tile10_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,18,event)" id="tile10_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,19,event)" id="tile10_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,20,event)" id="tile10_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,21,event)" id="tile10_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,22,event)" id="tile10_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,23,event)" id="tile10_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,24,event)" id="tile10_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,25,event)" id="tile10_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,26,event)" id="tile10_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,27,event)" id="tile10_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,28,event)" id="tile10_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(10,29,event)" id="tile10_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line11"><td onmousedown="clic(11,0,event)" id="tile11_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,1,event)" id="tile11_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,2,event)" id="tile11_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,3,event)" id="tile11_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,4,event)" id="tile11_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,5,event)" id="tile11_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,6,event)" id="tile11_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,7,event)" id="tile11_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,8,event)" id="tile11_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,9,event)" id="tile11_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,10,event)" id="tile11_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,11,event)" id="tile11_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,12,event)" id="tile11_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,13,event)" id="tile11_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,14,event)" id="tile11_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,15,event)" id="tile11_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,16,event)" id="tile11_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,17,event)" id="tile11_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,18,event)" id="tile11_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,19,event)" id="tile11_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,20,event)" id="tile11_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,21,event)" id="tile11_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,22,event)" id="tile11_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,23,event)" id="tile11_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,24,event)" id="tile11_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,25,event)" id="tile11_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,26,event)" id="tile11_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,27,event)" id="tile11_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,28,event)" id="tile11_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(11,29,event)" id="tile11_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line12"><td onmousedown="clic(12,0,event)" id="tile12_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,1,event)" id="tile12_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,2,event)" id="tile12_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,3,event)" id="tile12_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,4,event)" id="tile12_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,5,event)" id="tile12_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,6,event)" id="tile12_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,7,event)" id="tile12_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,8,event)" id="tile12_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,9,event)" id="tile12_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,10,event)" id="tile12_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,11,event)" id="tile12_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,12,event)" id="tile12_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,13,event)" id="tile12_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,14,event)" id="tile12_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,15,event)" id="tile12_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,16,event)" id="tile12_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,17,event)" id="tile12_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,18,event)" id="tile12_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,19,event)" id="tile12_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,20,event)" id="tile12_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,21,event)" id="tile12_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,22,event)" id="tile12_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,23,event)" id="tile12_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,24,event)" id="tile12_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,25,event)" id="tile12_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,26,event)" id="tile12_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,27,event)" id="tile12_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,28,event)" id="tile12_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(12,29,event)" id="tile12_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line13"><td onmousedown="clic(13,0,event)" id="tile13_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,1,event)" id="tile13_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,2,event)" id="tile13_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,3,event)" id="tile13_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,4,event)" id="tile13_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,5,event)" id="tile13_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,6,event)" id="tile13_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,7,event)" id="tile13_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,8,event)" id="tile13_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,9,event)" id="tile13_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,10,event)" id="tile13_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,11,event)" id="tile13_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,12,event)" id="tile13_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,13,event)" id="tile13_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,14,event)" id="tile13_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,15,event)" id="tile13_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,16,event)" id="tile13_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,17,event)" id="tile13_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,18,event)" id="tile13_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,19,event)" id="tile13_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,20,event)" id="tile13_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,21,event)" id="tile13_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,22,event)" id="tile13_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,23,event)" id="tile13_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,24,event)" id="tile13_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,25,event)" id="tile13_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,26,event)" id="tile13_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,27,event)" id="tile13_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,28,event)" id="tile13_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(13,29,event)" id="tile13_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line14"><td onmousedown="clic(14,0,event)" id="tile14_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,1,event)" id="tile14_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,2,event)" id="tile14_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,3,event)" id="tile14_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,4,event)" id="tile14_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,5,event)" id="tile14_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,6,event)" id="tile14_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,7,event)" id="tile14_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,8,event)" id="tile14_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,9,event)" id="tile14_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,10,event)" id="tile14_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,11,event)" id="tile14_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,12,event)" id="tile14_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,13,event)" id="tile14_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,14,event)" id="tile14_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,15,event)" id="tile14_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,16,event)" id="tile14_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,17,event)" id="tile14_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,18,event)" id="tile14_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,19,event)" id="tile14_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,20,event)" id="tile14_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,21,event)" id="tile14_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,22,event)" id="tile14_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,23,event)" id="tile14_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,24,event)" id="tile14_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,25,event)" id="tile14_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,26,event)" id="tile14_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,27,event)" id="tile14_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,28,event)" id="tile14_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(14,29,event)" id="tile14_29"><img src="./assets/img/blank.png"></td></tr></tbody><tbody><tr id="line15"><td onmousedown="clic(15,0,event)" id="tile15_0"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,1,event)" id="tile15_1"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,2,event)" id="tile15_2"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,3,event)" id="tile15_3"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,4,event)" id="tile15_4"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,5,event)" id="tile15_5"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,6,event)" id="tile15_6"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,7,event)" id="tile15_7"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,8,event)" id="tile15_8"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,9,event)" id="tile15_9"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,10,event)" id="tile15_10"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,11,event)" id="tile15_11"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,12,event)" id="tile15_12"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,13,event)" id="tile15_13"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,14,event)" id="tile15_14"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,15,event)" id="tile15_15"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,16,event)" id="tile15_16"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,17,event)" id="tile15_17"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,18,event)" id="tile15_18"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,19,event)" id="tile15_19"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,20,event)" id="tile15_20"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,21,event)" id="tile15_21"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,22,event)" id="tile15_22"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,23,event)" id="tile15_23"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,24,event)" id="tile15_24"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,25,event)" id="tile15_25"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,26,event)" id="tile15_26"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,27,event)" id="tile15_27"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,28,event)" id="tile15_28"><img src="./assets/img/blank.png"></td><td onmousedown="clic(15,29,event)" id="tile15_29"><img src="./assets/img/blank.png"></td></tr></tbody>'
// setEmptyMinefield creates an empty minefield using HTML
