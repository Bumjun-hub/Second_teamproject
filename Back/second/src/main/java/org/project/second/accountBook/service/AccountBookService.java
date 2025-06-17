package org.project.second.accountBook.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.project.second.accountBook.domain.AccountBook;
import org.project.second.accountBook.domain.AccountBookImage;
import org.project.second.accountBook.dto.ExpenseDto;
import org.project.second.accountBook.dto.IncomeDto;
import org.project.second.accountBook.repository.AccountBookImageRepository;
import org.project.second.accountBook.repository.AccountBookRepository;
import org.project.second.common.enums.ExpenseCategory;
import org.project.second.common.enums.IncomeCategory;
import org.project.second.common.enums.RecordType;
import org.project.second.common.image.ImageService;
import org.project.second.member.domain.Member;
import org.project.second.myAsset.domain.MyAsset;
import org.project.second.myAsset.repository.MyAssetRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountBookService {

    private final AccountBookRepository accountBookRepository;
    private final ImageService imageService;
    private final AccountBookImageRepository accountBookImageRepository;
    private final MyAssetRepository myAssetRepository;

    //수입
    @Transactional
    public void addIncome(IncomeDto dto, Member loginUser) {
        validateIncomeDto(dto);
        MyAsset asset = validateAsset(loginUser);

        String memo = dto.getMemo() != null ? dto.getMemo() : "";
        LocalDate date = dto.getDate() != null ? dto.getDate() : LocalDate.now();
        IncomeCategory category = dto.getIncomeCategory() != null ? dto.getIncomeCategory() : IncomeCategory.ETC;

        AccountBook income = AccountBook.builder()
                .member(loginUser)
                .recordType(RecordType.INCOME)
                .amount(dto.getAmount())
                .memo(memo)
                .moneyMethod(dto.getMoneyMethod())
                .date(date)
                .incomeCategory(category)
                .build();
        accountBookRepository.save(income);

        switch (dto.getMoneyMethod()) {
            case CASH -> asset.setCash(asset.getCash() + dto.getAmount());
            case CHECK_CARD -> asset.setCheckCard(asset.getCheckCard() + dto.getAmount());
            case CREDIT_CARD -> asset.setCreditCard(asset.getCreditCard() + dto.getAmount());
        }
    }

    //지출
    @Transactional
    public void addExpense(ExpenseDto dto, List<MultipartFile> imageFiles, Member loginUser) {
       validateExpenseDto(dto);
        MyAsset asset = validateAsset(loginUser);

        String memo = dto.getMemo() != null ? dto.getMemo() : "";
        LocalDate date = dto.getDate() != null ? dto.getDate() : LocalDate.now();
        ExpenseCategory category = dto.getExpenseCategory() != null ? dto.getExpenseCategory() : ExpenseCategory.ETC;

        AccountBook expense = AccountBook.builder()
                .member(loginUser)
                .recordType(RecordType.EXPENSE)
                .amount(dto.getAmount())
                .memo(memo)
                .moneyMethod(dto.getMoneyMethod())
                .date(date)
                .expenseCategory(category)
                .build();
        accountBookRepository.save(expense);

        if (imageFiles != null && !imageFiles.isEmpty()) {
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

    //수입수정
    @Transactional
    public void editIncome(Long id, IncomeDto dto, Member loginUSer) {
        //작성자확인
        AccountBook accountBook = validateWriter(id, loginUSer);
        //수입인지확인
        validateRecordType(accountBook, RecordType.INCOME);

        accountBook.setAmount(dto.getAmount());
        accountBook.setMemo(dto.getMemo());
        accountBook.setMoneyMethod(dto.getMoneyMethod());
        accountBook.setDate(dto.getDate());
        accountBook.setIncomeCategory(dto.getIncomeCategory());
    }

    //지출수정
    @Transactional
    public void editExpense(Long id, Member loginUser, ExpenseDto dto, List<MultipartFile> imageFiles, List<String> deleteImageUrls) {
        AccountBook accountBook = validateWriter(id, loginUser);
        validateRecordType(accountBook, RecordType.EXPENSE);

        accountBook.setAmount(dto.getAmount());
        accountBook.setMemo(dto.getMemo());
        accountBook.setMoneyMethod(dto.getMoneyMethod());
        accountBook.setDate(dto.getDate());
        accountBook.setExpenseCategory(dto.getExpenseCategory());

        if (deleteImageUrls != null && !deleteImageUrls.isEmpty()) {
            List<AccountBookImage> deleteImages = new ArrayList<>();
            for (AccountBookImage image : accountBook.getAccountBookImages()) {
                if (deleteImageUrls.contains(image.getImgUrl())) {
                    imageService.deleteImage((image.getImgUrl()));
                    image.setIsDeleted(true);
                }
            }
        }

        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = imageService.saveImage(imageFile);

                AccountBookImage image = AccountBookImage.builder()
                        .imgUrl(imageUrl)
                        .accountBook(accountBook)
                        .isDeleted(false)
                        .build();
                accountBook.getAccountBookImages().add(image);
            }
        }
    }

    //수입삭제
    @Transactional
    public void deleteIncome(Long id, Member loginUSer) {
        AccountBook accountBook = validateWriter(id, loginUSer);
        validateRecordType(accountBook, RecordType.INCOME);

        accountBookRepository.delete(accountBook);
    }

    //지출삭제
    @Transactional
    public void deleteExpense(Long id, Member loginUser) {
        AccountBook accountBook = validateWriter(id, loginUser);
        validateRecordType(accountBook, RecordType.EXPENSE);

        accountBookRepository.delete(accountBook);
    }

    //조회


    //myasset등록여부
    public MyAsset validateAsset(Member loginUSer) {
        return myAssetRepository.findByMember(loginUSer)
                .orElseThrow(() -> new IllegalArgumentException("내 자산이 등록되어 있지 않습니다"));
    }

    //로그인,글존재 여부
    public AccountBook validateWriter(Long id, Member loginUser) {
        AccountBook accountBook = accountBookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 수입/지출 내역이 존재하지 않습니다"));
        if (!accountBook.getMember().getId().equals(loginUser.getId())) {
            throw new AccessDeniedException("작성자만 수정/삭제 할 수 있습니다");
        }
        return accountBook;
    }

    //수입/지출유형
    public void validateRecordType(AccountBook accountBook, RecordType recordType) {
        if (accountBook.getRecordType().equals(recordType)) {
            throw new IllegalArgumentException("타입이 맞지 않습니다");
        }
    }

    //금액, 수단 체크여부
    public void validateIncomeDto(IncomeDto dto) {
        if (dto.getAmount() == null) {
            throw new IllegalArgumentException("금액은 필수 입력 항목입니다");
        }
        if (dto.getMoneyMethod() == null) {
            throw new IllegalArgumentException("결제수단을 선택 해주세요");
        }
    }

    //필수내용입력
    public void validateExpenseDto(ExpenseDto dto) {
        if (dto.getAmount() == null) {
            throw new IllegalArgumentException("금액은 필수 입력 항목입니다");
        }
        if (dto.getMoneyMethod() == null) {
            throw new IllegalArgumentException("결제수단을 선택 해주세요");
        }
    }



}
