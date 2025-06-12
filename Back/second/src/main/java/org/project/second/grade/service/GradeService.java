package org.project.second.grade.service;

import lombok.RequiredArgsConstructor;
import org.project.second.common.enums.ActivityType;
import org.project.second.common.enums.HomitGrade;
import org.project.second.grade.domain.ActivityLog;
import org.project.second.grade.domain.Grade;
import org.project.second.grade.dto.GradeResponseDto;
import org.project.second.grade.repository.ActivityLogRepository;
import org.project.second.grade.repository.GradeRepository;
import org.project.second.member.domain.Member;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GradeService {

    private final GradeRepository gradeRepository;
    private final ActivityLogRepository activityLogRepository;

    public GradeResponseDto addScore(Member member, ActivityType activityType){
        //날짜
        LocalDate today = LocalDate.now();

        Optional<ActivityLog> optionalLog = activityLogRepository
                .findByMemberAndActivityTypeAndDate(member, activityType, today);

        //로그 가져오기
        if (optionalLog.isPresent()){
            ActivityLog log = optionalLog.get();

            int count = log.getScore() / activityType.getScore();

            if (count >= activityType.getDailyLimit()) {
                return new GradeResponseDto(false, null, null);
            }
            log.setScore(log.getScore() + activityType.getScore());
        } else {
            ActivityLog log = ActivityLog.builder()
                    .member(member)
                    .activityType(activityType)
                    .score(activityType.getScore())
                    .date(today)
                    .build();
            activityLogRepository.save(log);
        }
        //등급 가져오기
        Grade grade = gradeRepository.findByMember(member).orElseGet(()-> gradeRepository.save(Grade.builder()
                        .member(member)
                        .homitGrade(HomitGrade.EXPERIENCE)
                        .totalScore(0)
                        .build()));

        // 현재 점수에 활동 점수 추가
        int newTotalScore = grade.getTotalScore() + activityType.getScore();
        grade.setTotalScore(newTotalScore);

        //현재 등급보다 높은 등급점수가 있는지
        HomitGrade newGrade = grade.getHomitGrade();

        for (HomitGrade homitGrade : HomitGrade.values()) {
            if (homitGrade.getUpGread() <= newTotalScore && homitGrade.ordinal() > newGrade.ordinal()){
                newGrade = homitGrade;
            }
        }
        //등급 반영
        boolean upgraded = false;
        if (newGrade != grade.getHomitGrade()) {
            grade.setHomitGrade(newGrade);
            upgraded = true;
        }
        gradeRepository.save(grade);
        return new GradeResponseDto(
                upgraded,
                upgraded ? "등급이" + newGrade.getLabel() + "로 승급되었습니다!" : null,
                newGrade.getLabel()
        );
    }

}
