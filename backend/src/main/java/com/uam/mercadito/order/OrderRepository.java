package com.uam.mercadito.order;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // Puedes añadir métodos de búsqueda por usuario si es necesario (e.g., findByUserEmail)
}
