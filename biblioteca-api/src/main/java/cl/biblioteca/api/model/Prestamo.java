package cl.biblioteca.api.model;

import cl.biblioteca.api.model.enums.EstadoPrestamo;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "prestamos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ejemplar_id", nullable = false)
    private Ejemplar ejemplar;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "fecha_devolucion_real")
    private LocalDate fechaDevolucionReal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoPrestamo estado = EstadoPrestamo.ACTIVO;

    public void registrarDevolucion(LocalDate fechaDevolucion) {
        this.fechaDevolucionReal = fechaDevolucion;
        this.estado = EstadoPrestamo.DEVUELTO;
    }

    public boolean estaVencido(LocalDate fechaReferencia) {
        return this.estado == EstadoPrestamo.ACTIVO
                && fechaReferencia.isAfter(this.fechaVencimiento);
    }

    public long calcularDiasRetraso(LocalDate fechaReferencia) {
        if (!fechaReferencia.isAfter(this.fechaVencimiento)) {
            return 0;
        }
        return ChronoUnit.DAYS.between(this.fechaVencimiento, fechaReferencia);
    }
}