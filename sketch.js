var db, pc = 0, gs = 0, pr = 0;

var car1, car2, cars = [];

var allPlayers, currentIndex=0, hello="";

function preload(){
  car1Img = loadImage("images/car1.png");
  car2Img = loadImage("images/car2.png");
  trackImage = loadImage("images/track.jpg");
}

function setup(){
    canvas = createCanvas(1200,600);
    db = firebase.database();

    //linking pc to database playerCount
    db.ref('playerCount').on("value", function(data){
      pc = data.val();
    })

    //linking gs to database gameState
    db.ref('gameState').on("value", function(data){
      gs = data.val();
    })

    input = createInput("Name");
    input.position(500,100);

    button = createButton("PLAY");
    button.position(500,200);
    button.mousePressed(enterPlayer);

    resetBtn = createButton("Reset");
    resetBtn.position(1100,100);
    resetBtn.mousePressed(reset);

    car1 = createSprite(200,590,30,30);
    car1.shapeColor = "red";
    car1.addImage(car1Img);

    car2 = createSprite(400,590,30,30);
    car2.shapeColor = "blue";
    car2.addImage(car2Img);

    cars = [car1, car2];
  }

function draw(){
 // console.log(mouseX+ ' '+mouseY);
  //update gameState to 1 when no. of players is 2
  if(pc === 2 && gs === 0){   

    db.ref('/').update({
      gameState : 1
    })
  }

  //get the playerCount only one time from database
  if(allPlayers === undefined && gs === 1){
    db.ref('players').on("value", function(data){
      allPlayers = data.val();
    })
  }

  //get the number of cars at the finish line
  db.ref('CarsAtEnd').on("value", function(data){
    pr = data.val();
  })

  //start the game if gameState = 1
  if(gs ===1){
      
    var index = 0;
    var x = 530;

    background(255);

    image(trackImage,0, -height*2,width, height *3)

    //linking database positions to sprite positions in the browser
    for(var i in allPlayers){
      cars[index].x = x;  
      x = x+200;
      cars[index].y = allPlayers[i].y;
     
      //position the game Camera
       camera.position.x = width/2;
       camera.position.y = cars[currentIndex -1].y-100;
       if(index === currentIndex -1){
         fill("green");
         circle(cars[index].x,cars[currentIndex-1].y,60,60);
       }
       
      index++;
    }

    if(keyDown(UP_ARROW)){
      cars[currentIndex -1].y -=10;
      //keep updating the database
      db.ref("players/player"+currentIndex).update({
        y: cars[currentIndex-1].y
      })
    }

    //have to check this part
    if( cars[currentIndex -1].y < -1200){
        gs = 2;
        console.log("Game Ended");
        console.log(pr);
        //update player rank by 1 and update in database
        pr++;
        db.ref('/').update({
          CarsAtEnd : pr
        })

        //Used sweetalerts for displaying the rank. Added the necessary library in index.html
        swal({
          title: `Awesome!${"\n"}Rank${"\n"}${pr}`,
          text: "You reached the finish line successfully",
          icon: "success",         
          confirmButtonText: "Ok",
        });

    }

    drawSprites();
  }
    
}

function enterPlayer(){
  hello = createElement('h2');
  hello.position(300,200);
  var name = input.value()
  hello.html("Welcome "+name+". Please wait for others to join");
  button.hide();
  input.hide();

  //hide the greeting message after 2 seconds
  setTimeout(function(){hello.hide()}, 2000);

  //increase pc by 1 and update database 
  pc++;
  db.ref('/').update({
    playerCount : pc
  })


  //updating the players information in database, y= 590 since that's at the bottom of the canvas
  db.ref('players/player'+pc).set({
    playerName : name,
    y:590,
    index : pc
  })

  
  currentIndex = pc;
  console.log(currentIndex);

}

function reset(){
  db.ref('/').update({
    gameState : 0,
    playerCount : 0,
    CarsAtEnd : 0
  })

  db.ref('players').remove();
}