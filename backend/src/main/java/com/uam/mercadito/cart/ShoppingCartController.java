package com.uam.mercadito.cart;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.uam.mercadito.cart.dto.CartDetailDTO;
import com.uam.mercadito.cart.dto.CartItemAddDTO;
import com.uam.mercadito.user.AppUser;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()") 
public class ShoppingCartController {

    private final ShoppingCartService service;

    /**
     * Obtiene el carrito activo del usuario.
     * GET /cart
     */
    @GetMapping
    public CartDetailDTO getCart(@RequestHeader("X-User-Id") AppUser user) {
        return service.getOrCreateCart(user.getEmail());
    }

    /**
     * Añade un producto al carrito o incrementa su cantidad.
     * POST /cart/items
     */
    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public void addItemToCart(@RequestHeader("X-User-Id") AppUser user, 
                              @Valid @RequestBody CartItemAddDTO dto) {
        service.addItem(user.getEmail(), dto);
    }

    /**
     * Elimina un CartItem específico del carrito.
     * DELETE /cart/items/{itemId}
     */
    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItemFromCart(@RequestHeader("X-User-Id") AppUser user, 
                                   @PathVariable Long itemId) {
        service.removeItem(user.getEmail(), itemId);
    }

    /**
     * Vacía todo el carrito de compras.
     * DELETE /cart
     */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart(@RequestHeader("X-User-Id") AppUser user) {
        service.clearCart(user.getEmail());
    }
}