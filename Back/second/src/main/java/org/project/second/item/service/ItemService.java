package org.project.second.item.service;

import lombok.RequiredArgsConstructor;
import org.project.second.item.repository.ItemRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
}
