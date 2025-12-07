package com.uam.mercadito.cart;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {

    Optional<ShoppingCart> findByUserEmailAndStatus(String email, String status);

    Optional<ShoppingCart> findByUserEmail(String email);
}