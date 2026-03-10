let BASE_URL = "https://courtmanager-production.up.railway.app/api";

// stat labels
let STAT_KEYS = [
    {key: "forehandQuality", label: "Forehand"}, {key: "backhandQuality", label: "Backhand"}, {key: "volleyQuality", label: "Volley"}, {key: "serveQuality", label: "Serve"},
    {key: "netSkill", label: "Net"}, {key: "baselineSkill", label: "Baseline"}, {key: "consistency", label: "Consistency"},
    {key: "speed", label: "Speed"}, {key: "endurance", label: "Endurance"}
];

let currentPairs = [];
let selectedPairIndex;

document.addEventListener("DOMContentLoaded", function(){
    function openOverlay(id){
        document.getElementById(id).classList.add("open");
    }

    function closeOverlay(id){
        document.getElementById(id).classList.remove("open");
    }

    document.getElementById("view-close").onclick = function(){
        closeOverlay("view-overlay");
    };

    document.getElementById("info-btn").onclick = function(){
        openOverlay("info-overlay");
    };

    document.getElementById("info-close").onclick = function(){
        closeOverlay("info-overlay");
    };

    document.getElementById("error-close").onclick = function(){
        closeOverlay("error-overlay");
    };

    // allows the user to close any popup by clicking the dark backdrop behind it
    document.querySelectorAll(".overlay").forEach(function(ov){
        ov.onclick = function(e){
            if (e.target === ov){
                ov.classList.remove("open");
            }
        };
    });

    function showError(msg){
        document.getElementById("error-popup-msg").textContent = msg;
        openOverlay("error-overlay");
    }

    // fetches optimal pairings from the backend and renders the pair cards
    document.getElementById("generate-btn").onclick = function(){
        fetch(BASE_URL + "/players/pairings")
            .then(function(res){
                if (!res.ok){
                    return res.text().then(function(t){
                        throw new Error(t);
                    });
                }

                return res.json();
            })

            .then(function(pairs){
                // re-attaches photos from localStorage since they aren't stored on the backend
                pairs.forEach(function(pair){
                    let photoA = localStorage.getItem("photo_" + pair.playerA.id);
                    let photoB = localStorage.getItem("photo_" + pair.playerB.id);

                    if (photoA){
                        pair.playerA.photoFileName = photoA;
                    }

                    if (photoB){
                        pair.playerB.photoFileName = photoB;
                    }
                });

                currentPairs = pairs;

                let hintEl = document.getElementById("hint-msg");
                if (hintEl){ hintEl.style.display = "none"; }

                // saves a photo-stripped copy so pairs stay saved when the user navigates away and back
                let toSave = pairs.map(function(pair){
                    return{
                        compatibilityScore: pair.compatibilityScore,
                        playerA: {id: pair.playerA.id, name: pair.playerA.name, playStyle: pair.playerA.playStyle, stats: pair.playerA.stats},
                        playerB: {id: pair.playerB.id, name: pair.playerB.name, playStyle: pair.playerB.playStyle, stats: pair.playerB.stats}
                    };
                });

                localStorage.setItem("cm_pairs", JSON.stringify(toSave));
                renderPairs();
            })

            .catch(function(err){
                showError(err.message);
            });
    };

    // UI: draws pair cards from the currentPairs array (backend not needed)
    function renderPairs(){
        let row = document.getElementById("cards-row");
        row.innerHTML = "";

        if (currentPairs.length === 0){
            showError("No pairs could be generated.");
            return;
        }

        currentPairs.forEach(function(pair, index){
            let card = document.createElement("div");
            card.className = "pair-card";

            let rank = document.createElement("div");
            rank.className = "pair-rank";
            rank.textContent = "Pair #" + (index + 1);

            let nameA = document.createElement("div");
            nameA.className = "pair-player-name";
            nameA.textContent = pair.playerA.name;

            let plus = document.createElement("div");
            plus.className = "pair-plus";
            plus.textContent = "+";

            let nameB = document.createElement("div");
            nameB.className = "pair-player-name";
            nameB.textContent = pair.playerB.name;

            let compat = document.createElement("div");
            compat.className = "pair-compat";
            compat.textContent = "Compatibility: " + pair.compatibilityScore.toFixed(2);

            let viewBtn = document.createElement("button");
            viewBtn.className = "view-more-btn";
            viewBtn.textContent = "[View More]";
            viewBtn.onclick = (function(i){
                return function(){
                    openViewMore(i);
                };
            })(index);

            card.appendChild(rank);
            card.appendChild(nameA);
            card.appendChild(plus);
            card.appendChild(nameB);
            card.appendChild(compat);
            card.appendChild(viewBtn);
            row.appendChild(card);
        });
    }

    // UI: finds the pair in the local array and fills the "View More" popup
    function openViewMore(index){
        selectedPairIndex = index;

        let pair = currentPairs[index];
        let a = pair.playerA;
        let b = pair.playerB;

        document.getElementById("view-name-a").textContent = a.name;
        document.getElementById("view-name-b").textContent = b.name;
        document.getElementById("view-compat").textContent = "Compatibility Score: " + pair.compatibilityScore.toFixed(2);
        document.getElementById("view-style-a").textContent = a.playStyle;
        document.getElementById("view-style-b").textContent = b.playStyle;
        document.getElementById("compare-header-a").textContent = a.name;
        document.getElementById("compare-header-b").textContent = b.name;

        // rebuilds the stat comparison rows each time the popup opens
        let list = document.getElementById("stat-compare-list");
        list.innerHTML = "";

        STAT_KEYS.forEach(function(item){
            let valA = a.stats[item.key] || 0; // defaults to 0 if stat is missing
            let valB = b.stats[item.key] || 0;

            let row = document.createElement("div");
            row.className = "stat-compare-row";

            // player A stat is shown in red on the left
            let cellA = document.createElement("div");
            cellA.className = "stat-val-left";
            cellA.textContent = valA;

            let cellLabel = document.createElement("div");
            cellLabel.className = "stat-label-mid";
            cellLabel.textContent = item.label;

            // player B stat is shown in blue on the right
            let cellB = document.createElement("div");
            cellB.className = "stat-val-right";
            cellB.textContent = valB;

            row.appendChild(cellA);
            row.appendChild(cellLabel);
            row.appendChild(cellB);
            list.appendChild(row);
        });

        openOverlay("view-overlay");
    }

    // restores saved pairs if the user navigated away and came back
    let savedPairs = localStorage.getItem("cm_pairs");

    if (savedPairs){
        try{
            currentPairs = JSON.parse(savedPairs);

            // re-attaches photos from localStorage since they aren't stored on the backend
            currentPairs.forEach(function(pair){
                let photoA = localStorage.getItem("photo_" + pair.playerA.id);
                let photoB = localStorage.getItem("photo_" + pair.playerB.id);
                if (photoA){
                    pair.playerA.photoFileName = photoA;
                }

                if (photoB){
                    pair.playerB.photoFileName = photoB;
                }
            });

            document.getElementById("hint-msg").style.display = "none";
            renderPairs();
        } catch(e){
            localStorage.removeItem("cm_pairs");
        }
    }

});
