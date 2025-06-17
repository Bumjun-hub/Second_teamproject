package org.project.second.myAsset.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.member.domain.Member;
import org.project.second.myAsset.domain.MyAsset;
import org.project.second.myAsset.dto.MyAssetDto;
import org.project.second.myAsset.repository.MyAssetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MyAssetService {

    private final MyAssetRepository myAssetRepository;

    //최초생성
    @Transactional
    public void inAsset(MyAssetDto myAssetDto, Member loginUser) {
        if (myAssetRepository.findByMember(loginUser).isPresent()) {
            throw new IllegalArgumentException("이미 자산이 등록되어 있습니다");
        }
            MyAsset newAsset = MyAsset.builder()
                    .member(loginUser)
                    .cash(myAssetDto.getCash() != null ? myAssetDto.getCash() : 0L)
                    .checkCard(myAssetDto.getCheckCard() != null ? myAssetDto.getCheckCard() : 0L)
                    .creditCard(0L)
                    .savingDeposit(myAssetDto.getSavingDeposit() != null ? myAssetDto.getSavingDeposit() : 0L)
                    .savingInstallment(myAssetDto.getSavingInstallment() != null ? myAssetDto.getSavingInstallment() : 0L)
                    .build();
            myAssetRepository.save(newAsset);
        }


    //수정
    @Transactional
    public void edit(MyAssetDto myAssetDto, Member loginUser) {
        MyAsset asset = myAssetRepository.findByMember(loginUser)
                .orElseThrow(() -> new IllegalArgumentException("자산이 등록되어 있지 않습니다"));

            asset.setCash(myAssetDto.getCash() != null ? myAssetDto.getCash() : asset.getCash());
            asset.setCheckCard(myAssetDto.getCheckCard() != null ? myAssetDto.getCheckCard() : asset.getCheckCard());
            asset.setSavingDeposit(myAssetDto.getSavingDeposit() != null ? myAssetDto.getSavingDeposit() : asset.getSavingDeposit());
            asset.setSavingInstallment(myAssetDto.getSavingInstallment() != null ? myAssetDto.getSavingInstallment() : asset.getSavingInstallment());
    }

    //조회
    @Transactional
    public MyAssetDto getMyAsset(Member loginUser) {
        MyAsset asset = myAssetRepository.findByMember(loginUser)
                .orElseThrow(() -> new IllegalArgumentException("자산 정보가 존재하지 않습니다"));
        return MyAssetDto.builder()
                .cash(asset.getCash())
                .checkCard(asset.getCheckCard())
                .creditCard(asset.getCreditCard())
                .savingDeposit(asset.getSavingDeposit())
                .savingInstallment(asset.getSavingInstallment())
                .build();
    }

}
