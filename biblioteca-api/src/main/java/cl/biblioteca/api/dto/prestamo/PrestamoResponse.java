package cl.biblioteca.api.dto.prestamo;

import cl.biblioteca.api.model.enums.EstadoPrestamo;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class PrestamoResponse {
    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private String emailUsuario;
    private String codigoBarrasEjemplar;
    private String tituloLibro;
    private LocalDate fechaInicio;
    private LocalDate fechaVencimiento;
    private LocalDate fechaDevolucionReal;
    private EstadoPrestamo estado;
    private long diasRetraso;
}