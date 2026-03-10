package com.courtmanager;
import java.util.ArrayList;
import java.util.LinkedHashMap;

public class TeamManager{ // stores players and performs operations on the roster
    private LinkedHashMap<String, Player> playerMap; // key: id, value: Player object, linked hash map used to preserve insertion order
    private final UndoStack undoStack;

    public TeamManager(){
        this.playerMap = new LinkedHashMap<>();
        this.undoStack = new UndoStack();
    }

    // adds a player to the roster
    public void addPlayer(Player player){
        if (player == null){
            throw new IllegalArgumentException("Player cannot be null.");
        }

        if (playerMap.containsKey(player.getID())){
            throw new IllegalArgumentException(player.getName() + " is already on the roster.");
        }

        if (playerMap.size() >= UndoStack.getMX_ROSTER()){
            throw new IllegalArgumentException("Roster is full. There can only be a maximum of " + UndoStack.getMX_ROSTER() + " players.");
        }

        playerMap.put(player.getID(), player);

        Action a = new Action(player, -1);
        undoStack.push(a);
    }

    // removes a player from the roster
    public void removePlayer(String ID){
        Player player = playerMap.get(ID);

        if (player == null){
            throw new IllegalArgumentException("No player found with that ID.");
        }

        playerMap.remove(ID);

        Action a = new Action(player, 1);
        undoStack.push(a);
    }

    // undos an add or remove operation for the roster
    public void undo(){
        if (undoStack.isEmpty()){
            throw new IllegalArgumentException("There is no operation to undo.");
        }

        if (!undoStack.safeToUndo(playerMap.size())){
            throw new IllegalArgumentException("Cannot undo because the roster size will be a number that is out of bounds (beyond 0-12 inclusive).");
        }

        Action last = undoStack.pop();

        if (last.getEffect() == -1){
            playerMap.remove(last.getPlayer().getID());
        } else{
            playerMap.put(last.getPlayer().getID(), last.getPlayer());
        }
    }

    // functions for retrieving players
    public Player getPlayerUsingID(String ID){
        Player p = playerMap.get(ID);

        if (p == null){
            throw new IllegalArgumentException("No player found.");
        }

        return p;
    }

    // gets all players on the team
    public ArrayList<Player> getAllPlayers(){
        ArrayList<Player> p = new ArrayList<>(playerMap.values());
        return p;
    }

    // "getters"/utility functions
    public int getRosterSize(){
        return playerMap.size();
    }

    public boolean isEmpty(){
        return playerMap.isEmpty();
    }

    // checks if there is at least 1 action that can be safely undone
    public boolean canUndo(){
        return !undoStack.isEmpty() && undoStack.safeToUndo(playerMap.size());
    }
}
