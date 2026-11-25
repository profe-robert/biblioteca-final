package cl.biblioteca.api.dto.libro;

import cl.biblioteca.api.model.enums.EstadoEjemplar;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EjemplarResponse {
    private Long id;
    private String codigoBarras;
    private EstadoEjemplar estado;
    private String ubicacion;
    private Long libroId;
    private String tituloLibro;
}