package org.project.second.priceAlert.controller;

import lombok.RequiredArgsConstructor;
import org.project.second.member.config.CustomUserDetails;
import org.project.second.member.domain.Member;
import org.project.second.priceAlert.dto.PriceAlertRequest;
import org.project.second.priceAlert.dto.PriceAlertResponse;
import org.project.second.priceAlert.service.PriceAlertService;
import org.project.second.product.dto.MessageResponse;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<PriceAlertResponse> createPriceAlert(@RequestBody PriceAlertRequest request
                                                    , @AuthenticationPrincipal CustomUserDetails userDetails) {
            Member m = userDetails.getMember();
            PriceAlertResponse response = priceAlertService.createPriceAlert(m, request);
            return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<List<PriceAlertResponse>> getMemberPriceAlerts(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        List<PriceAlertResponse> result = priceAlertService.getMemberPriceAlerts(m);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<MessageResponse> deletePriceAlert(@PathVariable Long id,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        Member m = userDetails.getMember();
        priceAlertService.deletePriceAlert(id, m);
        return ResponseEntity.ok().body(new MessageResponse("Successfully deleted"));
    }

}
