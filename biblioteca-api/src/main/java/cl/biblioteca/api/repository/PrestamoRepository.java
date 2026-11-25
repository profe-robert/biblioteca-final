package cl.biblioteca.api.repository;

import cl.biblioteca.api.model.Prestamo;
import cl.biblioteca.api.model.enums.EstadoPrestamo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    long countByUsuarioIdAndEstado(Long usuarioId, EstadoPrestamo estado);
    Optional<Prestamo> findByEjemplarCodigoBarrasAndEstado(String codigoBarras, EstadoPrestamo estado);
    List<Prestamo> findByUsuarioIdOrderByFechaInicioDesc(Long usuarioId);
    List<Prestamo> findAllByOrderByFechaInicioDesc();
}