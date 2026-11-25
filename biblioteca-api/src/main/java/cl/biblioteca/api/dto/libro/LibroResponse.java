package cl.biblioteca.api.dto.libro;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LibroResponse {
    private Long id;
    private String isbn;
    private String titulo;
    private String autor;
    private Integer anioPublicacion;
    private String categoria;
    private long ejemplaresDisponibles;
    private List<EjemplarResponse> ejemplares;
}