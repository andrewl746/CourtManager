// opens the "Information" popup
let infoBtn  = document.getElementById("info-btn");
let overlay = document.getElementById("popup-overlay");
let closeBtn = document.getElementById("popup-close");

infoBtn.onclick  = function(){
    overlay.classList.add("open");
};

// closes the "Information" popup using the X button
closeBtn.onclick = function(){
    overlay.classList.remove("open");
};

// closes the "Information" popup when the user clicks on the dark backdrop
overlay.onclick = function(e){
     if (e.target === overlay){
        overlay.classList.remove("open");
     }
};
