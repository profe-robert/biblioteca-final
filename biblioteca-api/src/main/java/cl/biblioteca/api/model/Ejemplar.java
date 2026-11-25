package cl.biblioteca.api.model;

import cl.biblioteca.api.model.enums.EstadoEjemplar;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ejemplares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ejemplar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_barras", nullable = false, unique = true, length = 50)
    private String codigoBarras;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoEjemplar estado = EstadoEjemplar.DISPONIBLE;

    @Column(length = 80)
    private String ubicacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "libro_id", nullable = false)
    private Libro libro;

    public boolean estaDisponible() {
        return this.estado == EstadoEjemplar.DISPONIBLE;
    }

    public void marcarComoPrestado() {
        this.estado = EstadoEjemplar.PRESTADO;
    }

    public void marcarComoDisponible() {
        this.estado = EstadoEjemplar.DISPONIBLE;
    }
}