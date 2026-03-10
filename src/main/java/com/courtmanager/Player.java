package com.courtmanager;

public class Player extends Person{
    private String playStyle;
    private Stats stats;

    public Player(String name, Stats stats){
        super(name);
        if (stats == null){
            throw new IllegalArgumentException("Stats cannot be null.");
        }

        this.stats = stats;
        this.playStyle = computePlayStyle();
    }

    // polymorphism to ensure a summary gets printed
    @Override
    public String getSummary(){
        return getName() + " | Style: " + playStyle;
    }

    // getters
    public Stats getStats(){
        return stats;
    }

    public String getPlayStyle(){
        return playStyle;
    }

    // algorithm to compute the player's playstyle based on their stats
    public String computePlayStyle(){
        int forehandQuality = stats.getForehandQuality();
        int backhandQuality = stats.getBackhandQuality();
        int volleyQuality = stats.getVolleyQuality();
        int serveQuality = stats.getServeQuality();
        int netSkill = stats.getNetSkill();
        int baselineSkill = stats.getBaselineSkill();
        int consistency = stats.getConsistency();
        int speed = stats.getSpeed();
        int endurance = stats.getEndurance();

        // each play style has a score out of 10, and the player's highest score out of these 4 variables is their playstyle
        double serveAndVolley = serveQuality * 0.3 + netSkill * 0.3 + volleyQuality * 0.25 + speed * 0.15;
        double offensiveBaseliner = forehandQuality * 0.25 + backhandQuality * 0.25 + baselineSkill * 0.25 + speed * 0.25;
        double defensiveBaseliner = consistency * 0.3 + endurance * 0.3 + baselineSkill * 0.25 + speed * 0.15;
        double allCourtPlayer = (forehandQuality + backhandQuality + volleyQuality + netSkill + baselineSkill + speed) / 6.0;

        double mx = Math.max(Math.max(serveAndVolley, offensiveBaseliner), Math.max(defensiveBaseliner, allCourtPlayer));

        if (mx == serveAndVolley){
            return "Serve and Volley";
        } else if (mx == offensiveBaseliner){
            return "Offensive Baseliner";
        } else if (mx == defensiveBaseliner){
            return "Defensive Baseliner";
        } else{
            return "All Court Player";
        }
    }

    // updates the player's playstyle
    public void updatePlayStyle(){
        this.playStyle = computePlayStyle();
    }
}
