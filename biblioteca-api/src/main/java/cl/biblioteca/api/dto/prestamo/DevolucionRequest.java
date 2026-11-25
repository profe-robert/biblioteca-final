package cl.biblioteca.api.dto.prestamo;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DevolucionRequest {
    @NotBlank(message = "El código de barras del ejemplar es obligatorio")
    private String codigoBarras;
}