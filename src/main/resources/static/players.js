let BASE_URL = "https://courtmanager-production.up.railway.app/api";

// stores all players fetched from the backend
let players = [];

// tracks which player's "View More" popup is currently open
let selectedPlayerId;

// maps each stat's backend field name to its display label (for building stat bars)
let STAT_KEYS = [
    {key: "forehandQuality", label: "Forehand"}, {key: "backhandQuality", label: "Backhand"}, {key: "volleyQuality", label: "Volley"},
    {key: "serveQuality", label: "Serve"}, {key: "netSkill", label: "Net"}, {key: "baselineSkill", label: "Baseline"},
    {key: "consistency", label: "Consistency"}, {key: "speed", label: "Speed"}, {key: "endurance", label: "Endurance"}
];

// compresses a base64 image before storing it in localStorage
function compressImage(dataUrl, maxSize, quality, callback){
    let img = new Image();
    img.onload = function(){
        let w = img.width, h = img.height;

        if (w > h){
            if (w > maxSize){
                h = Math.round(h * maxSize / w);
                w = maxSize;
            }
        } else{
            if (h > maxSize){
                w = Math.round(w * maxSize / h);
                h = maxSize;
            }
        }

        // draws the resized image onto a canvas and then exports it as a JPEG
        let canvas = document.createElement("canvas");
        canvas.width  = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);

        let result = canvas.toDataURL("image/jpeg", quality);

        // if the image still over 200KB, it compresses again at lower quality to stay under the 5MB limit
        if (result.length > 200000){
            result = canvas.toDataURL("image/jpeg", 0.65);
        }

        callback(result);
    };

    img.src = dataUrl;
}

// writes a photo to localStorage and returns false if quota is exceeded
function safeSetPhoto(key, value){
    try{
        localStorage.setItem(key, value);
        return true;
    } catch(e){
        console.warn("localStorage quota exceeded so photo not saved:", key);
        return false;
    }
}

// shows an error message inside the add player popup
function showError(msg){
    let el = document.getElementById("add-error");
    el.textContent = msg;
    el.style.display = "block";
}

// functions to add or remove the "open" class to show or hide an overlay popup
function openOverlay(id){
    document.getElementById(id).classList.add("open");
}

function closeOverlay(id){
    document.getElementById(id).classList.remove("open");
}

// fetches players from the backend and refreshes the UI
// function is called on page load and after every add, remove, or undo
function fetchPlayers(){
    return fetch(BASE_URL + "/players")
        .then(function(res){
            return res.json();
        })

        .then(function(data){
            players = data;

            // re-attaches photos from localStorage since they aren't stored on the backend
            for (let i = 0; i < players.length; i++){
                let saved = localStorage.getItem("photo_" + players[i].id);
                if (saved){
                    players[i].photoFileName = saved;
                }
            }

            renderCards();
            updateUndoBtn();
        })

        .catch(function(){
            alert("Could not connect to the server. Make sure Spring Boot is running.");
        });
}

// enables or disables the undo button based on backend state
function updateUndoBtn(){
    fetch(BASE_URL + "/players/can-undo")
        .then(function(res){
            return res.json();
        })

        .then(function(canUndo){
            document.getElementById("undo-btn").disabled = !canUndo;
        });
}

// render all player cards
// UI: draws cards from the players array and never calls the backend
function renderCards(){
    let row = document.getElementById("cards-row");
    let empty = document.getElementById("empty-msg");

    let existingCards = row.querySelectorAll(".player-card");
    for (let i = 0; i < existingCards.length; i++){
        existingCards[i].remove();
    }

    if (players.length === 0){ // ensures same type and value
        empty.style.display = "block";
        return;
    }

    empty.style.display = "none";

    for (let i = 0; i < players.length; i++){
        let player = players[i];

        let card = document.createElement("div");
        card.className = "player-card";
        card.dataset.id = player.id;

        let nameEl = document.createElement("div");
        nameEl.className = "player-name";
        nameEl.textContent = player.name;

        let photoDiv = document.createElement("div");
        photoDiv.className = "player-photo";

        if (player.photoFileName){
            let img = document.createElement("img");
            img.src = player.photoFileName;
            img.alt = player.name;
            photoDiv.appendChild(img);
        } else{
            photoDiv.textContent = "[NO PLAYER PHOTO]";
        }

        let viewBtn = document.createElement("button");
        viewBtn.className = "view-more-btn";
        viewBtn.textContent = "[View More]";
        viewBtn.dataset.playerId = player.id; // stores id on the button so onclick can read it
        viewBtn.onclick = onViewMoreClick;

        card.appendChild(nameEl);
        card.appendChild(photoDiv);
        card.appendChild(viewBtn);
        row.appendChild(card);
    }
}

// reads the player id stored on the button and opens their popup
function onViewMoreClick(){
    openViewMore(this.dataset.playerId);
}

// "View More" popup
// UI: finds the player in the local array and puts fills the popup (no backend needed)
function openViewMore(playerId){
    let player;

    for (let i = 0; i < players.length; i++){
        if (players[i].id === playerId){ // ensures same type and value
            player = players[i];
            break;
        }
    }

    if (!player){
        return;
    }

    selectedPlayerId = playerId;

    document.getElementById("view-name").textContent = player.name;
    document.getElementById("view-style").textContent = player.playStyle;

    // rebuilds stat bars every time the popup is opened
    let statsList = document.getElementById("view-stats");
    statsList.innerHTML = "";

    for (let i = 0; i < STAT_KEYS.length; i++){
        let item = STAT_KEYS[i];
        let val = player.stats[item.key] || 0; // defaults to 0 if stat is missing

        let row = document.createElement("div");
        row.className = "stat-row";

        let label = document.createElement("span");
        label.textContent = item.label;
        label.style.width = "40%";
        label.style.fontSize = "1.7vh";

        // bar fill width is set proportionally (stat value 1-10 maps to 10%-100%)
        let barWrap = document.createElement("div");
        barWrap.className = "stat-bar-wrap";

        let barFill = document.createElement("div");
        barFill.className = "stat-bar-fill";
        barFill.style.width = (val * 10) + "%";
        barWrap.appendChild(barFill);

        let valEl = document.createElement("span");
        valEl.className = "stat-val";
        valEl.textContent = val;

        row.appendChild(label);
        row.appendChild(barWrap);
        row.appendChild(valEl);
        statsList.appendChild(row);
    }

    openOverlay("view-overlay");
}

// remove player
// when deleting a player, a two-click confirmation is needed before sending the request
let removeClickCount = 0;

// resets remove button back to default appearance
function resetRemoveBtn(){
    removeClickCount = 0;
    let btn = document.getElementById("remove-btn");

    if (btn){
        btn.textContent = "Remove Player"; btn.style.background = "#e05555";
    }
}

// resets the add player form to its default state
function resetAddForm(){
    document.getElementById("input-name").value = "";
    document.getElementById("add-photo-preview").style.display = "none";
    document.getElementById("add-photo-label").style.display = "block";
    document.getElementById("add-photo-input").value = "";
    document.getElementById("add-error").style.display = "none";
    let statIds = ["s-fh","s-bh","s-vol","s-srv","s-net","s-bl","s-con","s-spd","s-end"];

    for (let i = 0; i < statIds.length; i++){
        document.getElementById(statIds[i]).value = 5;
    }
}

// attaches all event handlers once html elements exist on page
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("add-btn").onclick = function(){
        resetAddForm(); openOverlay("add-overlay");
    };

    document.getElementById("add-close").onclick = function(){
        closeOverlay("add-overlay");
    };

    document.getElementById("view-close").onclick = function(){
        resetRemoveBtn(); closeOverlay("view-overlay");
    };

    document.getElementById("info-btn").onclick = function(){
        openOverlay("info-overlay");
    };

    document.getElementById("info-close").onclick = function(){
        closeOverlay("info-overlay");
    };

    // returns the user to the "View More" popup after closing the edit overlays
    document.getElementById("edit-name-close").onclick = function(){
        closeOverlay("edit-name-overlay");
        openOverlay("view-overlay");
    };

    document.getElementById("edit-stats-close").onclick = function(){
        closeOverlay("edit-stats-overlay");
        openOverlay("view-overlay");
    };

    // allows for user to close popup when clicking outside of it
    let overlays = document.querySelectorAll(".overlay");

    for (let i = 0; i < overlays.length; i++){
        overlays[i].onclick = onOverlayClick;
    }

    document.getElementById("add-photo-input").onchange = onAddPhotoChange;
    document.getElementById("add-submit").onclick = onAddSubmit;
    document.getElementById("remove-btn").onclick = onRemoveClick;
    document.getElementById("change-photo-input").onchange = onChangePhotoChange;
    document.getElementById("undo-btn").onclick = onUndoClick;
    document.getElementById("change-name-btn").onclick = onChangeNameClick;
    document.getElementById("edit-name-submit").onclick = onEditNameSubmit;
    document.getElementById("change-stats-btn").onclick = onChangeStatsClick;
    document.getElementById("edit-stats-submit").onclick = onEditStatsSubmit;

    fetchPlayers();
});

// closes the popup if the user clicks on the dark backdrop
function onOverlayClick(e){
    if (e.target === this){
        this.classList.remove("open");
        resetRemoveBtn();
    }
}

// compresses and previews the selected photo in the "+ Add New Players" popup
function onAddPhotoChange(){
    let file = this.files[0];

    if (!file){
        return;
    }

    let reader = new FileReader();
    reader.onload = function(e){
        compressImage(e.target.result, 800, 0.88, function(compressed){
            let preview = document.getElementById("add-photo-preview");
            preview.src = compressed;
            preview.style.display = "block";
            document.getElementById("add-photo-label").style.display = "none";
        });
    };

    reader.readAsDataURL(file);
}

// adds player and saves their photo locally
function onAddSubmit(){
    let errorEl = document.getElementById("add-error");
    errorEl.style.display = "none";

    if (players.length >= 12){
        showError("Roster is full. Maximum 12 players allowed.");
        return;
    }

    let name = document.getElementById("input-name").value.trim();

    if (!name){
        showError("Player name cannot be empty.");
        return;
    }

    let stats = {forehandQuality: parseInt(document.getElementById("s-fh").value), backhandQuality: parseInt(document.getElementById("s-bh").value),
        volleyQuality: parseInt(document.getElementById("s-vol").value), serveQuality: parseInt(document.getElementById("s-srv").value),
        netSkill: parseInt(document.getElementById("s-net").value), baselineSkill: parseInt(document.getElementById("s-bl").value),
        consistency: parseInt(document.getElementById("s-con").value), speed: parseInt(document.getElementById("s-spd").value),
        endurance: parseInt(document.getElementById("s-end").value)
    };

    let statNames = Object.keys(stats);

    for (let i = 0; i < statNames.length; i++){
        if (isNaN(stats[statNames[i]]) || stats[statNames[i]] < 1 || stats[statNames[i]] > 10){
            showError("All stats must be a number between 1 and 10.");
            return;
        }
    }

    // only takes the photo if one was actually selected
    let photoBase64 = "";
    let preview = document.getElementById("add-photo-preview");

    if (preview.style.display !== "none" && preview.src){
        photoBase64 = preview.src;
    }

    // flat body matches PlayerRequest.java field names
    let body = {
        name: name, forehandQuality: stats.forehandQuality, backhandQuality: stats.backhandQuality, volleyQuality: stats.volleyQuality,
        serveQuality: stats.serveQuality, netSkill: stats.netSkill, baselineSkill: stats.baselineSkill,
        consistency: stats.consistency, speed: stats.speed, endurance: stats.endurance
    };

    fetch(BASE_URL + "/players", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(body)
    })

    .then(function(res){
        if (!res.ok){
            return res.text().then(function(t){
                throw new Error(t);
            });
        }

        return res.text(); // backend returns the new player's id
    })

    .then(function(newId){
        let cleanId = newId.replace(/"/g, ''); // strips surrounding quotes the backend may have added

        if (photoBase64){
            safeSetPhoto("photo_" + cleanId, photoBase64);
        }

        // clears cached pairs since the roster has changed
        localStorage.removeItem("cm_pairs");
        closeOverlay("add-overlay");
        fetchPlayers();
    })

    .catch(function(err){
        showError(err.message);
    });
}

// sends a delete request after the 2 click confirmation
function onRemoveClick(){
    if (!selectedPlayerId){
        return;
    }

    // first click changes the button appearance and waits for confirmation
    if (removeClickCount === 0){
        this.textContent = "Click again to confirm";
        this.style.background = "#c03030";
        removeClickCount = 1;
        return;
    }

    // second click deletes
    let idToRemove = selectedPlayerId;

    fetch(BASE_URL + "/players/" + idToRemove, {
        method: "DELETE"
    })

    .then(function(res){
        if (!res.ok){
            return res.text().then(function(t){
                throw new Error(t);
            });
        }

        localStorage.removeItem("cm_pairs");
        selectedPlayerId;
        resetRemoveBtn();
        closeOverlay("view-overlay");
        fetchPlayers();
    })

    .catch(function(err){
        alert(err.message);
    });
}

// compresses and saves the new photo to localStorage, then refreshes the popup
// photos are too large to store on the backend so they are only kept in localStorage
function onChangePhotoChange(){
    let file = this.files[0];

    if (!file){
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e){
        compressImage(e.target.result, 800, 0.88, function(compressed){ // compresses image files so localStorage can store all 12 images (max 5MB)
            let saved = safeSetPhoto("photo_" + selectedPlayerId, compressed);
            let player;

            for (let i = 0; i < players.length; i++){
                if (players[i].id === selectedPlayerId){
                    player = players[i];
                    break;
                }
            }

            if (player){
                if (saved){
                    player.photoFileName = compressed;
                }

                renderCards();
                closeOverlay("view-overlay");
                openViewMore(selectedPlayerId);
            }

            if (!saved){
                alert("Photo could not be saved because storage is full.");
            }
        });
    };

    reader.readAsDataURL(file);
}

// sends post request to backend to reverse the last add or remove
function onUndoClick(){
    fetch(BASE_URL + "/players/undo", {
        method: "POST"
    })

    .then(function(res){
        if (!res.ok){
            return res.text().then(function(t){
                throw new Error(t);
            });
        }

        localStorage.removeItem("cm_pairs");
        fetchPlayers();
    })

    .catch(function(err){
        alert(err.message);
    });
}

// opens the "Change Name" popup with the player's current name pre-filled
function onChangeNameClick(){
    let player;

    for (let i = 0; i < players.length; i++){
        if (players[i].id === selectedPlayerId){
            player = players[i];
            break;
        }
    }

    if (!player){
        return;
    }

    document.getElementById("edit-name-input").value = player.name;
    document.getElementById("edit-name-error").style.display = "none";
    closeOverlay("view-overlay");
    openOverlay("edit-name-overlay");
}

// validates the new name and sends a PUT request to update it on the backend
function onEditNameSubmit(){
    let newName = document.getElementById("edit-name-input").value.trim();
    let errEl = document.getElementById("edit-name-error");
    errEl.style.display = "none";

    if (!newName){
        errEl.textContent = "Name cannot be empty.";
        errEl.style.display = "block";
        return;
    }

    if (newName.length > 50){
        errEl.textContent = "Name cannot exceed 50 characters.";
        errEl.style.display = "block";
        return;
    }

    let idToReopen = selectedPlayerId;

    fetch(BASE_URL + "/players/" + selectedPlayerId + "/name", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({name: newName})
    })

    .then(function(res){
        if (!res.ok){
            return res.text().then(function(t){
                throw new Error(t);
            });
        }

        closeOverlay("edit-name-overlay");

        // re-opens the view popup after fetching so the updated name is shown
        fetchPlayers().then(function(){
            openViewMore(idToReopen);
        });
    })

    .catch(function(err){
        errEl.textContent = err.message;
        errEl.style.display = "block";
    });
}

// change player stats
// opens the edit stats popup with the player's current stats pre-filled
function onChangeStatsClick(){
    let player;

    for (let i = 0; i < players.length; i++){
        if (players[i].id === selectedPlayerId){
            player = players[i];
            break;
        }
    }

    if (!player){
        return;
    }

    document.getElementById("es-fh").value = player.stats.forehandQuality;
    document.getElementById("es-bh").value = player.stats.backhandQuality;
    document.getElementById("es-vol").value = player.stats.volleyQuality;
    document.getElementById("es-srv").value = player.stats.serveQuality;
    document.getElementById("es-net").value = player.stats.netSkill;
    document.getElementById("es-bl").value  = player.stats.baselineSkill;
    document.getElementById("es-con").value = player.stats.consistency;
    document.getElementById("es-spd").value = player.stats.speed;
    document.getElementById("es-end").value = player.stats.endurance;
    document.getElementById("edit-stats-error").style.display = "none";
    closeOverlay("view-overlay");
    openOverlay("edit-stats-overlay");
}

// validates the new stats and sends a PUT request to update them on the backend
// backend also recomputes the player's playstyle
function onEditStatsSubmit(){
    let errEl = document.getElementById("edit-stats-error");
    errEl.style.display = "none";

    let newStats = {
        forehandQuality: parseInt(document.getElementById("es-fh").value), backhandQuality: parseInt(document.getElementById("es-bh").value),
        volleyQuality: parseInt(document.getElementById("es-vol").value),serveQuality: parseInt(document.getElementById("es-srv").value),
        netSkill: parseInt(document.getElementById("es-net").value), baselineSkill: parseInt(document.getElementById("es-bl").value),
        consistency: parseInt(document.getElementById("es-con").value), speed: parseInt(document.getElementById("es-spd").value),
        endurance: parseInt(document.getElementById("es-end").value)
    };

    let keys = Object.keys(newStats);

    for (let i = 0; i < keys.length; i++){
        if (isNaN(newStats[keys[i]]) || newStats[keys[i]] < 1 || newStats[keys[i]] > 10){
            errEl.textContent = "All stats must be a number between 1 and 10.";
            errEl.style.display = "block";
            return;
        }
    }

    let idToReopen = selectedPlayerId;
    fetch(BASE_URL + "/players/" + selectedPlayerId + "/stats", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(newStats)
    })

    .then(function(res){
        if (!res.ok){
            return res.text().then(function(t){
                throw new Error(t);
            });
        }

        closeOverlay("edit-stats-overlay");

        // re-opens the view popup after fetching so the updated stats and play style are shown
        fetchPlayers().then(function(){
            openViewMore(idToReopen);
        });
    })

    .catch(function(err){
        errEl.textContent = err.message; errEl.style.display = "block";
    });
}
