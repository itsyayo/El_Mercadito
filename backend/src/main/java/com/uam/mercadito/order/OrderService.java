package com.uam.mercadito.order;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.uam.mercadito.cart.CartItem;
import com.uam.mercadito.cart.ShoppingCart;
import com.uam.mercadito.cart.ShoppingCartRepository;
import com.uam.mercadito.product.Product;
import com.uam.mercadito.product.ProductRepository;
import com.uam.mercadito.user.AppUser;
import com.uam.mercadito.user.AppUserRepository; 

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShoppingCartRepository cartRepository;
    private final AppUserRepository userRepository;

    @Transactional
    public Long createOrder(String userEmail) {
        // 1. Obtener Usuario y Carrito PENDING
        AppUser user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        ShoppingCart cart = cartRepository.findByUserEmailAndStatus(userEmail, "PENDING")
                .orElseThrow(() -> new RuntimeException("Active shopping cart not found."));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create an order from an empty cart.");
        }
        
        // 2. Preparar Orden, Validar Stock y Restar Inventario
        Set<OrderItem> orderItems = new HashSet<>();
        
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProduct().getId()));

            int quantity = cartItem.getQuantity();

            // A. Validación de Stock
            if (product.getStock() < quantity) {
                throw new RuntimeException("Insufficient stock for product " + product.getName() + 
                                            ". Required: " + quantity + ", Available: " + product.getStock());
            }

            // B. Restar Stock (Actualizar Inventario)
            product.setStock(product.getStock() - quantity);
            productRepository.save(product); 
            
            // C. Crear OrderItem
            OrderItem orderItem = OrderItem.builder()
                    .productName(product.getName()) 
                    .quantity(quantity)
                    .priceAtPurchase(cartItem.getUnitPrice()) 
                    .subTotal(cartItem.getSubTotal())
                    .build();
            
            orderItems.add(orderItem);
        }
        
        // 3. Crear y Guardar la Orden
        final Order order = Order.builder()
                .user(user)
                .total(cart.getTotalAmount())
                .status("CREATED")
                .items(orderItems)
                .build();
        
        orderItems.forEach(item -> item.setOrder(order));
        
        Order savedOrder = orderRepository.save(order);

        // 4. Cambiar Estado del Carrito
        cart.setStatus("COMPLETED");
        cart.setTotalAmount(BigDecimal.ZERO);
        cartRepository.save(cart);

        return savedOrder.getId();
    }
}