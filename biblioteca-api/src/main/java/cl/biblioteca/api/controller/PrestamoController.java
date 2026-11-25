package cl.biblioteca.api.controller;

import cl.biblioteca.api.dto.prestamo.DevolucionRequest;
import cl.biblioteca.api.dto.prestamo.PrestamoRequest;
import cl.biblioteca.api.dto.prestamo.PrestamoResponse;
import cl.biblioteca.api.service.PrestamoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prestamos")
@RequiredArgsConstructor
public class PrestamoController {

    private final PrestamoService prestamoService;

    @GetMapping
    public ResponseEntity<List<PrestamoResponse>> listarTodosLosPrestamos() {
        return ResponseEntity.ok(prestamoService.listarTodos());
    }

    @GetMapping("/mis-prestamos")
    public ResponseEntity<List<PrestamoResponse>> listarMisPrestamos(Authentication authentication) {
        return ResponseEntity.ok(prestamoService.listarPorEmailUsuario(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<PrestamoResponse> registrarPrestamo(@Valid @RequestBody PrestamoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prestamoService.registrarPrestamo(request));
    }

    @PostMapping("/devolucion")
    public ResponseEntity<PrestamoResponse> registrarDevolucion(@Valid @RequestBody DevolucionRequest request) {
        return ResponseEntity.ok(prestamoService.registrarDevolucion(request.getCodigoBarras()));
    }
}