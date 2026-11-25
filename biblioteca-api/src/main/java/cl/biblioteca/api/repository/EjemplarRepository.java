package cl.biblioteca.api.repository;

import cl.biblioteca.api.model.Ejemplar;
import cl.biblioteca.api.model.enums.EstadoEjemplar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EjemplarRepository extends JpaRepository<Ejemplar, Long> {
    Optional<Ejemplar> findByCodigoBarras(String codigoBarras);
    boolean existsByCodigoBarras(String codigoBarras);
    List<Ejemplar> findByLibroId(Long libroId);
    long countByLibroIdAndEstado(Long libroId, EstadoEjemplar estado);
}