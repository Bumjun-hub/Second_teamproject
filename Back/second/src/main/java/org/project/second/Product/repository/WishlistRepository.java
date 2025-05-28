package org.project.second.Product.repository;

import org.project.second.Product.domain.Product;
import org.project.second.Product.domain.Wishlist;
import org.project.second.Product.dto.ProductResponseDto;
import org.project.second.member.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    boolean existsByMemberAndProduct(Member member, Product product);

    Optional<Wishlist> findByMemberAndProduct(Member member, Product product);

    List<Wishlist> findByMember(Member member);
}
