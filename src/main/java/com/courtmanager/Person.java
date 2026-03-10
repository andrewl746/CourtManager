package com.courtmanager;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public abstract class Person{
    private final String ID;
    private String name;
    private String photoFileName;

    public Person(String name){
        if (name == null || name.trim().isEmpty()){ // trim() gets rid of whitespace so the user can't enter e.g., " " as their name
            throw new IllegalArgumentException("Name cannot be null or empty.");
        }

        // generates and assigns a random ID to each player
        this.ID = UUID.randomUUID().toString();
        this.name = name.trim();
        this.photoFileName = "";
    }

    // forces subclasses to provide a short description of themselves (for debugging purposes)
    public abstract String getSummary();

    // getters and setters
    @JsonProperty("id")
    public String getID(){
        return ID;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        if (name == null || name.trim().isEmpty()){
            throw new IllegalArgumentException("Name cannot be null or empty.");
        }

        this.name = name.trim();
    }

    public String getPhotoFileName(){
        return photoFileName;
    }

    public void setPhotoFileName(String photoFileName){
        if (photoFileName == null){
            throw new IllegalArgumentException("Photo file name cannot be null.");
        }

        this.photoFileName = photoFileName;
    }

    // for debugging purposes
    @Override
    public String toString() {
        return "Name: " + name + " | ID: " + ID;
    }
}
