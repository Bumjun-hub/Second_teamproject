package org.project.second.common.enums;

public enum ActivityType {
    COMMUNITY(5, 4),
    COMMENT(1,10),
    DONATION(10, 3),
    ORDER(20,1),
    DAILY_LOGIN(3, 1);

    private final int score;
    private final int dailyLimit;

    ActivityType(int score, int dailyLimit){
        this.score = score;
        this.dailyLimit = dailyLimit;
    }

    public int getScore() {
        return score;
    }

    public int getDailyLimit() {
        return dailyLimit;
    }
}