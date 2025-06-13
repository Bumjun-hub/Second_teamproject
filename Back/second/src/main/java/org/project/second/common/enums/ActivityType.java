package org.project.second.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ActivityType {
    COMMUNITY(5, 4),
    COMMENT(1,10),
    DONATION(10, 3),
    ORDER(20,1),
    DAILY_LOGIN(3, 1),
    LIKE(1, 5);

    private final int score;
    private final int dailyLimit;


}