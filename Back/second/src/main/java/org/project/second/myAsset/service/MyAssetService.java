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

    @Transactional
    public void inAsset(MyAssetDto myAssetDto, Member loginUser) {
        Optional<MyAsset> optionalMyAsset = myAssetRepository.findByMember(loginUser);

        if (optionalMyAsset.isPresent()){ // 존재한다면 수정
            MyAsset asset = optionalMyAsset.get();
            asset.setCash(myAssetDto.getCash());
            asset.setCheckCard(myAssetDto.getCheckCard());
            asset.setCreditCard(myAssetDto.getCreditCard());
            asset.setSavingDeposit(myAssetDto.getSavingDeposit());
            asset.setSavingInstallment(myAssetDto.getSavingInstallment());
        }else {
            MyAsset newAsset = MyAsset.builder()  //없으면 생성
                    .member(loginUser)
                    .cash(myAssetDto.getCash())
                    .checkCard(myAssetDto.getCheckCard())
                    .creditCard(myAssetDto.getCreditCard())
                    .savingDeposit(myAssetDto.getSavingDeposit())
                    .savingInstallment(myAssetDto.getSavingInstallment())
                    .build();
            myAssetRepository.save(newAsset);
        }
    }

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
