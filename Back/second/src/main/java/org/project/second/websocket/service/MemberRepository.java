package org.project.second.websocket.service;

import org.project.second.member.domain.Member;
import org.springframework.data.repository.Repository;

import java.util.List;

interface MemberRepository extends Repository<Member, Long> {
    List<Member> findAll();
}
