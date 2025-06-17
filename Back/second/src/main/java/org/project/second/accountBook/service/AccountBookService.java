package org.project.second.accountBook.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.accountBook.domain.AccountBook;
import org.project.second.accountBook.domain.AccountBookImage;
import org.project.second.accountBook.dto.ExpenseDto;
import org.project.second.accountBook.dto.IncomeDto;
import org.project.second.accountBook.repository.AccountBookImageRepository;
import org.project.second.accountBook.repository.AccountBookRepository;
import org.project.second.common.enums.RecordType;
import org.project.second.common.image.ImageService;
import org.project.second.member.domain.Member;
import org.project.second.myAsset.domain.MyAsset;
import org.project.second.myAsset.repository.MyAssetRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountBookService {

    private final AccountBookRepository accountBookRepository;
    private final ImageService imageService;
    private final AccountBookImageRepository accountBookImageRepository;
    private final MyAssetRepository myAssetRepository;



    @Transactional
    public void addIncome(IncomeDto dto, Member loginUser) {
        MyAsset asset = validateAsset(loginUser);
        AccountBook income = AccountBook.builder()
                .member(loginUser)
                .recordType(RecordType.INCOME)
                .amount(dto.getAmount())
                .memo(dto.getMemo())
                .moneyMethod(dto.getMoneyMethod())
                .date(dto.getDate())
                .incomeCategory(dto.getIncomeCategory())
                .build();
        accountBookRepository.save(income);

        switch (dto.getMoneyMethod()) {
            case CASH -> asset.setCash(asset.getCash() + dto.getAmount());
            case CHECK_CARD -> asset.setCheckCard(asset.getCheckCard() + dto.getAmount());
            case CREDIT_CARD -> asset.setCreditCard(asset.getCreditCard()+ dto.getAmount());
        }
    }

    @Transactional
    public void addExpense(ExpenseDto dto, List<MultipartFile> imageFiles, Member loginUser) {
        MyAsset asset = validateAsset(loginUser);
        AccountBook expense = AccountBook.builder()
                .member(loginUser)
                .recordType(RecordType.EXPENSE)
                .amount(dto.getAmount())
                .memo(dto.getMemo())
                .moneyMethod(dto.getMoneyMethod())
                .date(dto.getDate())
                .expenseCategory(dto.getExpenseCategory())
                .build();
        accountBookRepository.save(expense);

        if (imageFiles != null && !imageFiles.isEmpty()){
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                if (imageUrl != null) {
                    AccountBookImage image = AccountBookImage.builder()
                            .imgUrl(imageUrl)
                            .accountBook(expense)
                            .isDeleted(false)
                            .build();

                    accountBookImageRepository.save(image);
                }
            }
        }
        switch (dto.getMoneyMethod()) {
            case CASH -> asset.setCash(asset.getCash() - dto.getAmount());
            case CHECK_CARD -> asset.setCheckCard(asset.getCheckCard() - dto.getAmount());
            case CREDIT_CARD -> asset.setCreditCard(asset.getCreditCard() - dto.getAmount());
        }
    }


    public MyAsset validateAsset (Member loginUSer) {
        return myAssetRepository.findByMember(loginUSer)
                .orElseThrow(() -> new IllegalArgumentException("내 자산이 등록되어 있지 않습니다"));

        }

}
