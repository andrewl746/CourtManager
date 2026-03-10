package com.courtmanager;

public class Action{
    private final Player player;
    private final int effect;
    /* effect must be either -1 (undoing "add" results in "remove", so if you remove an item the size DECREASES by 1)
    or +1 (undoing "remove" results in "add", so if you remove an item the size INCREASES by 1)
    */

    public Action(Player player, int effect){
        if (player == null){
            throw new IllegalArgumentException("Player cannot be null.");
        }

        if (effect != 1 && effect != -1){
            throw new IllegalArgumentException("Effect must be either +1 or -1.");
        }

        this.player = player;
        this.effect = effect;
    }

    // getters
    public Player getPlayer(){
        return player;
    }

    public int getEffect(){
        return effect;
    }

    // for debugging purposes
    @Override
    public String toString(){
        if (effect == 1){
            return "Removed " + player.getName() + "."; // effect = +1 means undo will re-add this player
        }

        return "Added " + player.getName() + "."; // effect = -1 means undo will remove this player
    }
}
