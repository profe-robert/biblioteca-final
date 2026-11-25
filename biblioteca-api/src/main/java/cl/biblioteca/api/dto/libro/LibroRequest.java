package cl.biblioteca.api.dto.libro;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class LibroRequest {
    @NotBlank(message = "El ISBN es obligatorio")
    private String isbn;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "El autor es obligatorio")
    private String autor;

    @Positive(message = "El año de publicación debe ser positivo")
    private Integer anioPublicacion;

    private String categoria;
}