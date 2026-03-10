package com.courtmanager;

public class PlayerRequest{ // this class receives JSON from the frontend and keeps the web layer separate from the domain layer (Player/Stats)
    public String name;

    // stats (set to 5 by default if stats are not provided)
    public int forehandQuality = 5;
    public int backhandQuality = 5;
    public int volleyQuality = 5;
    public int serveQuality = 5;
    public int netSkill = 5;
    public int baselineSkill = 5;
    public int consistency = 5;
    public int speed = 5;
    public int endurance = 5;
}
