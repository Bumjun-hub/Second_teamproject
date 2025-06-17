package org.project.second.accountBook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.project.second.common.enums.ExpenseCategory;
import org.project.second.common.enums.MoneyMethod;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDto {
    private Long amount;
    private String memo; //메모
    private MoneyMethod moneyMethod;
    private LocalDate date;
    private ExpenseCategory expenseCategory;
}
