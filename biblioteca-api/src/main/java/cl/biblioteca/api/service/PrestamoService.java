package cl.biblioteca.api.service;

import cl.biblioteca.api.dto.prestamo.PrestamoRequest;
import cl.biblioteca.api.dto.prestamo.PrestamoResponse;
import cl.biblioteca.api.exception.BusinessRuleException;
import cl.biblioteca.api.exception.ResourceNotFoundException;
import cl.biblioteca.api.model.Ejemplar;
import cl.biblioteca.api.model.Prestamo;
import cl.biblioteca.api.model.Usuario;
import cl.biblioteca.api.model.enums.EstadoCuenta;
import cl.biblioteca.api.model.enums.EstadoPrestamo;
import cl.biblioteca.api.repository.EjemplarRepository;
import cl.biblioteca.api.repository.PrestamoRepository;
import cl.biblioteca.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EjemplarRepository ejemplarRepository;

    @Transactional
    public PrestamoResponse registrarPrestamo(PrestamoRequest request) {
        Usuario usuario = usuarioRepository.findById(request.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + request.getUsuarioId()));

        Ejemplar ejemplar = ejemplarRepository.findByCodigoBarras(request.getCodigoBarras())
                .orElseThrow(() -> new ResourceNotFoundException("Ejemplar no encontrado con código: " + request.getCodigoBarras()));

        long prestamosActivos = prestamoRepository.countByUsuarioIdAndEstado(usuario.getId(), EstadoPrestamo.ACTIVO);
        if (!usuario.puedePedirPrestado(prestamosActivos)) {
            throw new BusinessRuleException("El usuario está suspendido o alcanzó su límite máximo de préstamos (" + usuario.getLimitePrestamos() + ")");
        }

        if (!ejemplar.estaDisponible()) {
            throw new BusinessRuleException("El ejemplar " + ejemplar.getCodigoBarras() + " no está disponible (Estado: " + ejemplar.getEstado() + ")");
        }

        int dias = (request.getDiasPrestamo() != null && request.getDiasPrestamo() > 0) ? request.getDiasPrestamo() : 14;
        LocalDate hoy = LocalDate.now();

        Prestamo prestamo = Prestamo.builder()
                .usuario(usuario)
                .ejemplar(ejemplar)
                .fechaInicio(hoy)
                .fechaVencimiento(hoy.plusDays(dias))
                .estado(EstadoPrestamo.ACTIVO)
                .build();

        ejemplar.marcarComoPrestado();
        ejemplarRepository.save(ejemplar);

        return mapToResponse(prestamoRepository.save(prestamo));
    }

    @Transactional
    public PrestamoResponse registrarDevolucion(String codigoBarras) {
        Prestamo prestamo = prestamoRepository
                .findByEjemplarCodigoBarrasAndEstado(codigoBarras, EstadoPrestamo.ACTIVO)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un préstamo activo para el ejemplar: " + codigoBarras));

        LocalDate hoy = LocalDate.now();
        long diasRetraso = prestamo.calcularDiasRetraso(hoy);

        prestamo.registrarDevolucion(hoy);

        Ejemplar ejemplar = prestamo.getEjemplar();
        ejemplar.marcarComoDisponible();
        ejemplarRepository.save(ejemplar);

        // Regla de negocio: si hay atraso, suspender cuenta del socio
        if (diasRetraso > 0) {
            Usuario usuario = prestamo.getUsuario();
            usuario.setEstadoCuenta(EstadoCuenta.SUSPENDIDO);
            usuarioRepository.save(usuario);
        }

        return mapToResponse(prestamoRepository.save(prestamo));
    }

    @Transactional(readOnly = true)
    public List<PrestamoResponse> listarTodos() {
        return prestamoRepository.findAllByOrderByFechaInicioDesc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PrestamoResponse> listarPorEmailUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + email));

        return prestamoRepository.findByUsuarioIdOrderByFechaInicioDesc(usuario.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PrestamoResponse mapToResponse(Prestamo p) {
        LocalDate fechaCalculo = (p.getFechaDevolucionReal() != null) ? p.getFechaDevolucionReal() : LocalDate.now();
        return PrestamoResponse.builder()
                .id(p.getId())
                .usuarioId(p.getUsuario().getId())
                .nombreUsuario(p.getUsuario().getNombre())
                .emailUsuario(p.getUsuario().getEmail())
                .codigoBarrasEjemplar(p.getEjemplar().getCodigoBarras())
                .tituloLibro(p.getEjemplar().getLibro().getTitulo())
                .fechaInicio(p.getFechaInicio())
                .fechaVencimiento(p.getFechaVencimiento())
                .fechaDevolucionReal(p.getFechaDevolucionReal())
                .estado(p.getEstado())
                .diasRetraso(p.calcularDiasRetraso(fechaCalculo))
                .build();
    }
}