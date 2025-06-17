package org.project.second.priceAlert.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.priceAlert.dto.PriceAlertRequest;
import org.project.second.priceAlert.dto.PriceAlertResponse;
import org.project.second.priceAlert.service.PriceAlertService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;


@RestController
@RequestMapping("/api/item/pricealert")
@RequiredArgsConstructor
public class PriceAlertController {
    private final PriceAlertService priceAlertService;

    @PostMapping("/create")
    public Mono<PriceAlertResponse> createPriceAlert(@RequestBody PriceAlertRequest request
                                                    , @AuthenticationPrincipal CustomUserDetails userDetails) {
            Member m = userDetails.getMember();
            return Mono.just(priceAlertService.createPriceAlert(m, request));
    }

    @GetMapping("/list")
    public Mono<List<PriceAlertResponse>> getMemberPriceAlerts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        List<PriceAlertResponse> result = priceAlertService.getMemberPriceAlerts(m);
        return Mono.just(result);
    }

    @DeleteMapping("/remove/{id}")
    public Mono<Void> deletePriceAlert(@PathVariable Long id,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        return Mono.fromRunnable(() -> priceAlertService.deletePriceAlert(id, m));
    }

}
