package cl.biblioteca.api.dto.prestamo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PrestamoRequest {
    @NotNull(message = "El ID del socio es obligatorio")
    private Long usuarioId;

    @NotBlank(message = "El código de barras del ejemplar es obligatorio")
    private String codigoBarras;

    private Integer diasPrestamo = 14;
}