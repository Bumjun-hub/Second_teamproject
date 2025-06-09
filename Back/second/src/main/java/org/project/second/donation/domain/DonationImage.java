package org.project.second.donation.domain;

import jakarta.persistence.*;
import lombok.*;
import org.project.second.community.domain.Community;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class DonationImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include //?
    private Long id;

    private String imgUrl; // filePath + "/" + fileName

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id", nullable = true)
    private Donation donation;
}
