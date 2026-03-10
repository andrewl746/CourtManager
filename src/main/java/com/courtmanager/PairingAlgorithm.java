package com.courtmanager;
import java.util.ArrayList;

public class PairingAlgorithm{
    // calls helper functions to return a sorted list of doubles pairs in non-ascending order (first calls recursion to find the best lineup, then calls mergesort to sort it)
    public static ArrayList<Pair> findOptimalPairings(ArrayList<Player> players){
        if (players == null || players.size() < 2) {
            throw new IllegalArgumentException("Need at least 2 players to generate a lineup.");
        }
        if (players.size() % 2 != 0) {
            throw new IllegalArgumentException("Cannot have an odd number of players (" + players.size() + "). Add or remove a player.");
        }

        ArrayList<Pair> bestPairing = new ArrayList<>();
        ArrayList<Player> copy = new ArrayList<>(players);

        findBest(copy, bestPairing);

        return mergeSort(bestPairing);
    }

    // recursive paring search
    private static double findBest(ArrayList<Player> remaining, ArrayList<Pair> bestPairing){
        if (remaining.isEmpty()){
            return 0;
        }

        Player first = remaining.get(0), partner;
        double bestScore = -1;
        ArrayList<Pair> bestLocal = new ArrayList<>();

        for (int i = 1; i < remaining.size(); i++){
            partner = remaining.get(i);
            Pair candidate = new Pair(first, partner);

            ArrayList<Player> rest = new ArrayList<>(remaining);
            rest.remove(first);
            rest.remove(partner);

            ArrayList<Pair> localPairs = new ArrayList<>();
            double score = candidate.getCompatibilityScore() + findBest(rest, localPairs);

            if (score > bestScore){
                bestScore = score;
                bestLocal.clear();
                bestLocal.add(candidate);
                bestLocal.addAll(localPairs);
            }
        }

        bestPairing.addAll(bestLocal);
        return bestScore;
    }

    // merge sort
    private static ArrayList<Pair> mergeSort(ArrayList<Pair> pairs){
        if (pairs.size() < 2){
            return pairs;
        }

        ArrayList<Pair> left = new ArrayList<>(), right = new ArrayList<>();

        for (int i = 0; i < pairs.size() / 2; i++){
            left.add(pairs.get(i));
        }

        for (int i = pairs.size() / 2; i < pairs.size(); i++){
            right.add(pairs.get(i));
        }

        left = mergeSort(left);
        right = mergeSort(right);

        return merge(left, right);
    }

    private static ArrayList<Pair> merge(ArrayList<Pair> left, ArrayList<Pair> right){
        ArrayList<Pair> res = new ArrayList<>();
        int i = 0, j = 0;

        while (i < left.size() && j < right.size()){ // sort in non-ascending order
            if (left.get(i).getCompatibilityScore() >= right.get(j).getCompatibilityScore()){
                res.add(left.get(i));
                i++;
            } else{
                res.add(right.get(j));
                j++;
            }
        }

        while (i < left.size()){
            res.add(left.get(i));
            i++;
        }

        while (j < right.size()){
            res.add(right.get(j));
            j++;
        }

        return res;
    }
}
