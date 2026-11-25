package cl.biblioteca.api.controller;

import cl.biblioteca.api.dto.libro.EjemplarRequest;
import cl.biblioteca.api.dto.libro.EjemplarResponse;
import cl.biblioteca.api.dto.libro.LibroRequest;
import cl.biblioteca.api.dto.libro.LibroResponse;
import cl.biblioteca.api.service.LibroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LibroController {

    private final LibroService libroService;

    @GetMapping("/libros")
    public ResponseEntity<List<LibroResponse>> listarLibros() {
        return ResponseEntity.ok(libroService.listarTodos());
    }

    @GetMapping("/libros/{id}")
    public ResponseEntity<LibroResponse> obtenerLibro(@PathVariable Long id) {
        return ResponseEntity.ok(libroService.obtenerPorId(id));
    }

    @PostMapping("/libros")
    public ResponseEntity<LibroResponse> crearLibro(@Valid @RequestBody LibroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(libroService.crearLibro(request));
    }

    @GetMapping("/libros/{libroId}/ejemplares")
    public ResponseEntity<List<EjemplarResponse>> listarEjemplares(@PathVariable Long libroId) {
        return ResponseEntity.ok(libroService.listarEjemplaresPorLibro(libroId));
    }

    @PostMapping("/ejemplares")
    public ResponseEntity<EjemplarResponse> agregarEjemplar(@Valid @RequestBody EjemplarRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(libroService.agregarEjemplar(request));
    }
}