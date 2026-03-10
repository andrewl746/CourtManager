package com.courtmanager;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.ArrayList;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api")
public class PlayerController{ // this class links the java backend with the html, css, and js frontend
    private final TeamManager teamManager = new TeamManager();

    // returns all players on the roster
    @GetMapping("/players")
    public ResponseEntity<?> getAllPlayers(){
        return ResponseEntity.ok(teamManager.getAllPlayers());
    }

    // adds a new player from a JSON request body
    @PostMapping("/players")
    public ResponseEntity<String> addPlayer(@RequestBody PlayerRequest req){
        try{
            Stats stats = new Stats(req.forehandQuality, req.backhandQuality, req.volleyQuality, req.serveQuality, req.netSkill, req.baselineSkill, req.consistency, req.speed, req.endurance);
            Player player = new Player(req.name, stats);

            teamManager.addPlayer(player);

            return ResponseEntity.ok(player.getID());
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // removes a player by their ID
    @DeleteMapping("/players/{id}")
    public ResponseEntity<String> removePlayer(@PathVariable String id){
        try{
            teamManager.removePlayer(id);

            return ResponseEntity.ok("Player removed.");
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // updates a player's name
    @PutMapping("/players/{id}/name")
    public ResponseEntity<String> updateName(@PathVariable String id, @RequestBody PlayerRequest req){
        try{
            teamManager.getPlayerUsingID(id).setName(req.name);

            return ResponseEntity.ok("Name updated.");
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // updates a player's stats
    @PutMapping("/players/{id}/stats")
    public ResponseEntity<String> updateStats(@PathVariable String id, @RequestBody PlayerRequest req){
        try{
            Player player = teamManager.getPlayerUsingID(id);
            Stats s = player.getStats();

            s.setForehandQuality(req.forehandQuality);
            s.setBackhandQuality(req.backhandQuality);
            s.setVolleyQuality(req.volleyQuality);
            s.setServeQuality(req.serveQuality);
            s.setNetSkill(req.netSkill);
            s.setBaselineSkill(req.baselineSkill);
            s.setConsistency(req.consistency);
            s.setSpeed(req.speed);
            s.setEndurance(req.endurance);
            player.updatePlayStyle();

            return ResponseEntity.ok("Stats updated.");
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // undoes the last add or remove operation for player cards
    @PostMapping("/players/undo")
    public ResponseEntity<String> undo(){
        try{
            teamManager.undo();
            return ResponseEntity.ok("Undo successful.");
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // checks whether an undo is currently safe
    @GetMapping("/players/can-undo")
    public ResponseEntity<Boolean> canUndo(){
        return ResponseEntity.ok(teamManager.canUndo());
    }

    // runs the pairing algorithm and returns the sorted pairs
    @GetMapping("/players/pairings")
    public ResponseEntity<?> getPairings(){
        try {
            ArrayList<Player> players = teamManager.getAllPlayers();
            ArrayList<Pair> pairings = PairingAlgorithm.findOptimalPairings(players);

            return ResponseEntity.ok(pairings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
