package com.uam.mercadito.cart;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.uam.mercadito.cart.dto.CartDetailDTO;
import com.uam.mercadito.cart.dto.CartItemAddDTO;
import com.uam.mercadito.cart.dto.CartItemDTO;
import com.uam.mercadito.product.Product;
import com.uam.mercadito.product.ProductRepository;
import com.uam.mercadito.user.AppUser;
import com.uam.mercadito.user.AppUserRepository; 

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShoppingCartService {

    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository itemRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository userRepository;

    private static final String PENDING_STATUS = "PENDING";
    
    // =======================================================
    // Lógica de Lectura y Mapeo
    // =======================================================
    
    @Transactional
    public CartDetailDTO getOrCreateCart(String email) {
        Optional<ShoppingCart> optionalCart = cartRepository.findByUserEmailAndStatus(email, PENDING_STATUS);
        ShoppingCart cart;

        if (optionalCart.isPresent()) {
            cart = optionalCart.get();
        } else {
            var user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            cart = cartRepository.save(ShoppingCart.builder()
                    .user(user)
                    .status(PENDING_STATUS)
                    .createdAt(Instant.now())
                    .build());
        }
        return toDetailDTO(cart);
    }

    // =======================================================
    // Lógica de Modificación (Corregida)
    // =======================================================

    @Transactional
    public void addItem(String email, CartItemAddDTO dto) {
        ShoppingCart cart = cartRepository.findByUserEmailAndStatus(email, PENDING_STATUS)
           .orElseGet(() -> {
                AppUser user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
                return cartRepository.save(ShoppingCart.builder().user(user).build());
            });
        Product product = productRepository.findById(dto.productId())
            .orElseThrow(() -> new RuntimeException("Product not found"));

        if (dto.quantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be positive.");
        }
        
        Optional<CartItem> existingItemOptional = itemRepository.findByCartIdAndProductId(cart.getId(), dto.productId());

        int newTotalQuantity = dto.quantity();
        
        // 1. Calcular la nueva cantidad total (existente + nueva)
        if (existingItemOptional.isPresent()) {
            newTotalQuantity += existingItemOptional.get().getQuantity();
        } 
        
        // 2. Regla de Negocio: Verificar Stock
        if (product.getStock() < newTotalQuantity) {
            throw new RuntimeException("Insufficient stock. Only " + product.getStock() + " available.");
        }

        // 3. Asignación y Guardado (Corrige el error de inicialización)
        final CartItem item; 

        if (existingItemOptional.isPresent()) {
            // Producto EXISTENTE: Actualiza la cantidad
            item = existingItemOptional.get();
            item.setQuantity(newTotalQuantity);
        } else {
            // Producto NUEVO: Crea un nuevo CartItem
            item = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(newTotalQuantity)
                .unitPrice(product.getPrice())
                .build();
            cart.getItems().add(item);
        }
        
        // 4. Guardar y Recalcular Total
        item.setSubTotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        itemRepository.save(item);
        
        recalculateCartTotal(cart);
    }
    
    @Transactional
    public void removeItem(String email, Long itemId) {
        ShoppingCart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCart().getId().equals(cart.getId())) {
             throw new RuntimeException("Item does not belong to this cart.");
        }

        itemRepository.delete(item);
        cart.getItems().remove(item);
        
        recalculateCartTotal(cart);
    }
    
    @Transactional
    public void clearCart(String email) {
        ShoppingCart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        
        itemRepository.deleteAllByCartId(cart.getId());
        cart.getItems().clear();
        
        recalculateCartTotal(cart);
    }

    // =======================================================
    // Lógica de Cálculo y Mapeo
    // =======================================================

    private void recalculateCartTotal(ShoppingCart cart) {
        BigDecimal newTotal = cart.getItems().stream()
                .map(CartItem::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setTotalAmount(newTotal);
        cart.setUpdatedAt(Instant.now());
        cartRepository.save(cart);
    }

    private CartItemDTO toItemDTO(CartItem item) {
        return new CartItemDTO(
            item.getId(),
            item.getProduct().getId(),
            item.getProduct().getName(),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getSubTotal()
        );
    }

    private CartDetailDTO toDetailDTO(ShoppingCart cart) {
        Set<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::toItemDTO)
                .collect(Collectors.toSet());

        return new CartDetailDTO(
            cart.getId(),
            cart.getUser().getId(),
            cart.getStatus(),
            cart.getTotalAmount(),
            cart.getCreatedAt(),
            itemDTOs
        );
    }
}