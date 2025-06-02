package org.project.second.viewHistory.service;

import lombok.RequiredArgsConstructor;
import org.project.second.viewHistory.repository.ViewHisotryRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ViewHistoryService {
    private final ViewHisotryRepository viewHisotryRepository;
}
