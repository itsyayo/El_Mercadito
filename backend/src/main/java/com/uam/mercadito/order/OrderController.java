package com.uam.mercadito.order;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.uam.mercadito.user.AppUser;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class OrderController {

    private final OrderService service;
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Long createOrder(@AuthenticationPrincipal AppUser user) {
        // Delega la creación de la orden al servicio, usando el email del usuario.
        return service.createOrder(user.getEmail());
    }


}
