package cl.biblioteca.api.service;

import cl.biblioteca.api.dto.libro.EjemplarRequest;
import cl.biblioteca.api.dto.libro.EjemplarResponse;
import cl.biblioteca.api.dto.libro.LibroRequest;
import cl.biblioteca.api.dto.libro.LibroResponse;
import cl.biblioteca.api.exception.BusinessRuleException;
import cl.biblioteca.api.exception.ResourceNotFoundException;
import cl.biblioteca.api.model.Ejemplar;
import cl.biblioteca.api.model.Libro;
import cl.biblioteca.api.model.enums.EstadoEjemplar;
import cl.biblioteca.api.repository.EjemplarRepository;
import cl.biblioteca.api.repository.LibroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final LibroRepository libroRepository;
    private final EjemplarRepository ejemplarRepository;

    @Transactional(readOnly = true)
    public List<LibroResponse> listarTodos() {
        return libroRepository.findAll().stream()
                .map(this::mapToLibroResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LibroResponse obtenerPorId(Long id) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado con ID: " + id));
        return mapToLibroResponse(libro);
    }

    @Transactional
    public LibroResponse crearLibro(LibroRequest request) {
        if (libroRepository.existsByIsbn(request.getIsbn())) {
            throw new BusinessRuleException("Ya existe un libro registrado con el ISBN: " + request.getIsbn());
        }

        Libro libro = Libro.builder()
                .isbn(request.getIsbn())
                .titulo(request.getTitulo())
                .autor(request.getAutor())
                .anioPublicacion(request.getAnioPublicacion())
                .categoria(request.getCategoria())
                .build();

        return mapToLibroResponse(libroRepository.save(libro));
    }

    @Transactional
    public EjemplarResponse agregarEjemplar(EjemplarRequest request) {
        if (ejemplarRepository.existsByCodigoBarras(request.getCodigoBarras())) {
            throw new BusinessRuleException("Ya existe un ejemplar con el código de barras: " + request.getCodigoBarras());
        }

        Libro libro = libroRepository.findById(request.getLibroId())
                .orElseThrow(() -> new ResourceNotFoundException("Libro no encontrado con ID: " + request.getLibroId()));

        Ejemplar ejemplar = Ejemplar.builder()
                .codigoBarras(request.getCodigoBarras())
                .ubicacion(request.getUbicacion())
                .estado(EstadoEjemplar.DISPONIBLE)
                .libro(libro)
                .build();

        return mapToEjemplarResponse(ejemplarRepository.save(ejemplar));
    }

    @Transactional(readOnly = true)
    public List<EjemplarResponse> listarEjemplaresPorLibro(Long libroId) {
        if (!libroRepository.existsById(libroId)) {
            throw new ResourceNotFoundException("Libro no encontrado con ID: " + libroId);
        }
        return ejemplarRepository.findByLibroId(libroId).stream()
                .map(this::mapToEjemplarResponse)
                .toList();
    }

    private LibroResponse mapToLibroResponse(Libro libro) {
        List<EjemplarResponse> ejemplaresDto = libro.getEjemplares().stream()
                .map(this::mapToEjemplarResponse)
                .toList();

        long disponibles = libro.getEjemplares().stream()
                .filter(Ejemplar::estaDisponible)
                .count();

        return LibroResponse.builder()
                .id(libro.getId())
                .isbn(libro.getIsbn())
                .titulo(libro.getTitulo())
                .autor(libro.getAutor())
                .anioPublicacion(libro.getAnioPublicacion())
                .categoria(libro.getCategoria())
                .ejemplaresDisponibles(disponibles)
                .ejemplares(ejemplaresDto)
                .build();
    }

    private EjemplarResponse mapToEjemplarResponse(Ejemplar ejemplar) {
        return EjemplarResponse.builder()
                .id(ejemplar.getId())
                .codigoBarras(ejemplar.getCodigoBarras())
                .estado(ejemplar.getEstado())
                .ubicacion(ejemplar.getUbicacion())
                .libroId(ejemplar.getLibro().getId())
                .tituloLibro(ejemplar.getLibro().getTitulo())
                .build();
    }
}