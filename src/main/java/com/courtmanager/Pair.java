package com.courtmanager;

public class Pair{
    private Player playerA;
    private Player playerB;
    private double compatibilityScore;

    public Pair(Player playerA, Player playerB){
        if (playerA == null || playerB == null){
            throw new IllegalArgumentException("Players cannot be null.");
        }

        if (playerA.getID().equals(playerB.getID())){
            throw new IllegalArgumentException("A player cannot be paired with themselves.");
        }

        this.playerA = playerA;
        this.playerB = playerB;
        updateCompatibilityScore();
    }

    // calculates the compatibility score between 2 players (compatibility algorithm)
    public void updateCompatibilityScore(){
        Stats a = playerA.getStats();
        Stats b = playerB.getStats();

        // rewards one player being good at the net and the other being good at the baseline
        double synergyFactor = Math.max(a.getBaselineSkill() * b.getNetSkill(), a.getNetSkill() * b.getBaselineSkill()) / 10.0;

        // rewards similar consistency levels
        double consistencyFactor = 10 - Math.abs(a.getConsistency() - b.getConsistency());

        // rewards if the pair has different play styles (so similar playstyles don't clash)
        double playStyleFactor = 10;

        if (playerA.getPlayStyle().equals(playerB.getPlayStyle())){
            playStyleFactor = 0;
        }

        compatibilityScore = synergyFactor * 0.5 + consistencyFactor * 0.3 + playStyleFactor * 0.2;
    }

    // getters
    public double getCompatibilityScore(){
        return compatibilityScore;
    }

    public Player getPlayerA(){
        return playerA;
    }

    public Player getPlayerB(){
        return playerB;
    }

    // for debugging purposes
    @Override
    public String toString(){
        return (playerA.getName() + " paired with " + playerB.getName() + " have a compatibility score of " + String.format("%.2f", compatibilityScore) + ".");
    }
}
