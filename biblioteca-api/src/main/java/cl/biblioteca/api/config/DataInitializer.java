package cl.biblioteca.api.config;

import cl.biblioteca.api.model.Ejemplar;
import cl.biblioteca.api.model.Libro;
import cl.biblioteca.api.model.Usuario;
import cl.biblioteca.api.model.enums.EstadoCuenta;
import cl.biblioteca.api.model.enums.EstadoEjemplar;
import cl.biblioteca.api.model.enums.Rol;
import cl.biblioteca.api.repository.LibroRepository;
import cl.biblioteca.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        cargarUsuariosIniciales();
        cargarLibrosIniciales();
    }

    private void cargarUsuariosIniciales() {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario bibliotecario = Usuario.builder()
                .nombre("Ana Bibliotecaria")
                .email("bibliotecario@biblioteca.cl")
                .password(passwordEncoder.encode("Admin123!"))
                .rol(Rol.ROLE_BIBLIOTECARIO)
                .estadoCuenta(EstadoCuenta.ACTIVO)
                .limitePrestamos(10)
                .build();

        Usuario socio1 = Usuario.builder()
                .nombre("Carlos Lector")
                .email("socio@biblioteca.cl")
                .password(passwordEncoder.encode("Socio123!"))
                .rol(Rol.ROLE_SOCIO)
                .estadoCuenta(EstadoCuenta.ACTIVO)
                .limitePrestamos(3)
                .build();

        Usuario socio2 = Usuario.builder()
                .nombre("Elena Morales")
                .email("elena@biblioteca.cl")
                .password(passwordEncoder.encode("Socio123!"))
                .rol(Rol.ROLE_SOCIO)
                .estadoCuenta(EstadoCuenta.ACTIVO)
                .limitePrestamos(3)
                .build();

        usuarioRepository.saveAll(List.of(bibliotecario, socio1, socio2));
        log.info("Usuarios de prueba cargados en SQLite.");
    }

    private void cargarLibrosIniciales() {
        if (libroRepository.count() > 0) {
            return;
        }

        Libro quijote = Libro.builder()
                .isbn("978-8420412146")
                .titulo("Don Quijote de la Mancha")
                .autor("Miguel de Cervantes")
                .anioPublicacion(1605)
                .categoria("Clásicos")
                .build();
        quijote.getEjemplares().addAll(List.of(
                Ejemplar.builder().codigoBarras("EJ-QUIJ-001").ubicacion("Pasillo A - Estante 1").estado(EstadoEjemplar.DISPONIBLE).libro(quijote).build(),
                Ejemplar.builder().codigoBarras("EJ-QUIJ-002").ubicacion("Pasillo A - Estante 1").estado(EstadoEjemplar.DISPONIBLE).libro(quijote).build()
        ));

        Libro cienAnios = Libro.builder()
                .isbn("978-0307474728")
                .titulo("Cien años de soledad")
                .autor("Gabriel García Márquez")
                .anioPublicacion(1967)
                .categoria("Realismo Mágico")
                .build();
        cienAnios.getEjemplares().addAll(List.of(
                Ejemplar.builder().codigoBarras("EJ-CIEN-001").ubicacion("Pasillo B - Estante 3").estado(EstadoEjemplar.DISPONIBLE).libro(cienAnios).build(),
                Ejemplar.builder().codigoBarras("EJ-CIEN-002").ubicacion("Pasillo B - Estante 3").estado(EstadoEjemplar.DISPONIBLE).libro(cienAnios).build()
        ));

        Libro milNovecientos = Libro.builder()
                .isbn("978-0451524935")
                .titulo("1984")
                .autor("George Orwell")
                .anioPublicacion(1949)
                .categoria("Distopía")
                .build();
        milNovecientos.getEjemplares().add(
                Ejemplar.builder().codigoBarras("EJ-1984-001").ubicacion("Pasillo C - Estante 2").estado(EstadoEjemplar.DISPONIBLE).libro(milNovecientos).build()
        );

        Libro cleanCode = Libro.builder()
                .isbn("978-0132350884")
                .titulo("Clean Code")
                .autor("Robert C. Martin")
                .anioPublicacion(2008)
                .categoria("Ingeniería de Software")
                .build();
        cleanCode.getEjemplares().addAll(List.of(
                Ejemplar.builder().codigoBarras("EJ-CLN-001").ubicacion("Pasillo T - Estante 5").estado(EstadoEjemplar.DISPONIBLE).libro(cleanCode).build(),
                Ejemplar.builder().codigoBarras("EJ-CLN-002").ubicacion("Pasillo T - Estante 5").estado(EstadoEjemplar.DISPONIBLE).libro(cleanCode).build()
        ));

        libroRepository.saveAll(List.of(quijote, cienAnios, milNovecientos, cleanCode));
        log.info("Catálogo inicial de libros y ejemplares cargado en SQLite.");
    }
}