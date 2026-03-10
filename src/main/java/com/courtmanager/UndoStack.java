package com.courtmanager;

public class UndoStack{ // this class implements a stack ADT, which stores recent user actions in case they want to undo them
    // stack constraints
    private static final int MX_UNDO = 20;
    private static final int MN_ROSTER = 0;
    private static final int MX_ROSTER = 12;

    private final Action[] undoStack;
    private int head; // index of the oldest entry
    private int size; // size of the stack
    private int netRosterChange;

    public UndoStack(){
        this.undoStack = new Action[MX_UNDO];
        this.head = 0;
        this.size = 0;
        this.netRosterChange = 0;
    }

    // adds a new action to the stack
    public void push(Action action){
        if (action == null){
            throw new IllegalArgumentException("Cannot push a null Action.");
        }

        int insertIndex = (head + size) % MX_UNDO; // head will be changing (but confined below MX_UNDO, thats why we need the mod

        if (size == MX_UNDO){ // stack is full
            netRosterChange -= undoStack[head].getEffect();
            undoStack[head] = null;
            head = (head + 1) % MX_UNDO;
        } else{
            size++;
        }

        undoStack[insertIndex] = action;
        netRosterChange += action.getEffect();
    }

    // removes the most recently performed action from the stack and returns it
    public Action pop(){
        if (isEmpty()){
            throw new IllegalArgumentException("Cannot undo if there were no elements added or removed.");
        }

        int topIndex = (head + size - 1) % MX_UNDO;
        Action top = undoStack[topIndex];
        undoStack[topIndex] = null;
        netRosterChange -= top.getEffect();
        size--;

        return top;
    }

    // returns the value of the most recently performed action without deleting it
    public Action peek(){
        if (isEmpty()){
            throw new IllegalArgumentException("Cannot peek if there were no elements added or removed.");
        }

        return undoStack[(head + size - 1) % MX_UNDO];
    }

    // clears the undo stack
    public void clear(){
        for (int i = 0; i < size; i++){
            undoStack[(head + i) % MX_UNDO] = null;
        }

        head = 0;
        size = 0;
        netRosterChange = 0;
    }

    // checks if popping the top action will keep the roster size within its bounds
    public boolean safeToUndo(int curSize){
        if (isEmpty()){
            throw new IllegalArgumentException("Cannot evaluate because stack is empty.");
        }

        int futureSize = curSize + peek().getEffect();

        return futureSize >= MN_ROSTER && futureSize <= MX_ROSTER;
    }

    // state of undoStack functions
    public boolean isEmpty(){
        return size == 0;
    }

    public boolean isFull(){
        return size == MX_UNDO;
    }

    // getters
    public static int getMN_ROSTER(){
        return MN_ROSTER;
    }

    public static int getMX_ROSTER(){
        return MX_ROSTER;
    }

    public static int getMX_UNDO(){
        return MX_UNDO;
    }
}
