package com.courtmanager;

public class Stats{
    // stat constraints
    private static final int MN_STAT = 1;
    private static final int MX_STAT = 10;

    // micro skills (1-10)
    private int forehandQuality;
    private int backhandQuality;
    private int volleyQuality;
    private int serveQuality;

    // macro skills (1-10)
    private int netSkill;
    private int baselineSkill;

    // physical traits (1-10)
    private int consistency;
    private int speed;
    private int endurance;

    public Stats(int forehandQuality, int backhandQuality, int volleyQuality, int serveQuality, int netSkill, int baselineSkill, int consistency, int speed, int endurance){
        this.forehandQuality = validate(forehandQuality);
        this.backhandQuality = validate(backhandQuality);
        this.volleyQuality = validate(volleyQuality);
        this.serveQuality = validate(serveQuality);
        this.netSkill = validate(netSkill);
        this.baselineSkill = validate(baselineSkill);
        this.consistency = validate(consistency);
        this.speed = validate(speed);
        this.endurance = validate(endurance);
    }

    // empty constructor is used by Jackson for JSON deserialization
    public Stats(){

    }

    // checks if a stat is valid
    private static int validate(int val){
        if (val >= MN_STAT && val <= MX_STAT){
            return val;
        }

        throw new IllegalArgumentException("The value must be between " + MN_STAT + " and " + MX_STAT + ".");
    }

    // micro skills getters and setters
    public int getForehandQuality(){
        return forehandQuality;
    }

    public void setForehandQuality(int forehandQuality){
        this.forehandQuality = validate(forehandQuality);
    }

    public int getBackhandQuality(){
        return backhandQuality;
    }

    public void setBackhandQuality(int backhandQuality){
        this.backhandQuality = validate(backhandQuality);
    }

    public int getVolleyQuality(){
        return volleyQuality;
    }

    public void setVolleyQuality(int volleyQuality){
        this.volleyQuality = validate(volleyQuality);
    }

    public int getServeQuality(){
        return serveQuality;
    }

    public void setServeQuality(int serveQuality){
        this.serveQuality = validate(serveQuality);
    }

    // macro skills getters and setters
    public int getNetSkill(){
        return netSkill;
    }

    public void setNetSkill(int netSkill){
        this.netSkill = validate(netSkill);
    }

    public int getBaselineSkill(){
        return baselineSkill;
    }

    public void setBaselineSkill(int baselineSkill){
        this.baselineSkill = validate(baselineSkill);
    }

    // physical traits getters and setters
    public int getConsistency(){
        return consistency;
    }

    public void setConsistency(int consistency){
        this.consistency = validate(consistency);
    }

    public int getSpeed(){
        return speed;
    }

    public void setSpeed(int speed){
        this.speed = validate(speed);
    }

    public int getEndurance(){
        return endurance;
    }

    public void setEndurance(int endurance){
        this.endurance = validate(endurance);
    }
}
