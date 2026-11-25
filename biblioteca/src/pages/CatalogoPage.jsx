import React, { useEffect, useState, useCallback } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Form, InputGroup,
  Spinner, Accordion, Table, Stack
} from 'react-bootstrap';
import { librosApi } from '../api/librosApi';
import { useAuth, useStore } from '../store/StoreContext';
import LibroModal from '../components/libros/LibroModal';
import EjemplarModal from '../components/libros/EjemplarModal';
import NuevoPrestamoModal from '../components/prestamos/NuevoPrestamoModal';

export default function CatalogoPage() {
  const { state, dispatch, notify } = useStore();
  const { isBibliotecario } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [showLibroModal, setShowLibroModal] = useState(false);
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [codigoPrestar, setCodigoPrestar] = useState('');
  const [showPrestamoModal, setShowPrestamoModal] = useState(false);

  const cargarLibros = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await librosApi.listarLibros();
      dispatch({ type: 'SET_LIBROS', payload: data });
    } catch {
      notify('danger', 'No se pudo cargar el catálogo de libros.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, notify]);

  useEffect(() => {
    cargarLibros();
  }, [cargarLibros]);

  const librosFiltrados = state.libros.filter(
    (l) =>
      l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.autor.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.isbn.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirPrestamoRapido = (codigoBarras) => {
    setCodigoPrestar(codigoBarras);
    setShowPrestamoModal(true);
  };

  return (
    <Container className="pb-5">
      <Row className="align-items-center mb-4 g-3">
        <Col md={5}>
          <h2 className="fw-bold mb-0">Catálogo Bibliográfico</h2>
        </Col>
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              placeholder="Buscar por título, autor o ISBN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3} className="text-md-end">
          {isBibliotecario && (
            <Button variant="primary" onClick={() => setShowLibroModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> Nuevo Libro
            </Button>
          )}
        </Col>
      </Row>

      {state.loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Row className="g-4">
          {librosFiltrados.map((libro) => (
            <Col md={6} key={libro.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <Badge bg="secondary" className="mb-1">{libro.categoria || 'General'}</Badge>
                      <Card.Title className="fw-bold mb-1">{libro.titulo}</Card.Title>
                      <Card.Subtitle className="text-body-secondary small">
                        {libro.autor} ({libro.anioPublicacion}) • ISBN: {libro.isbn}
                      </Card.Subtitle>
                    </div>
                    <Badge bg={libro.ejemplaresDisponibles > 0 ? 'success' : 'danger'} pill>
                      {libro.ejemplaresDisponibles} disp.
                    </Badge>
                  </div>

                  <Accordion className="mt-3">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        Ver Ejemplares Físicos ({libro.ejemplares?.length || 0})
                      </Accordion.Header>
                      <Accordion.Body className="p-2">
                        {libro.ejemplares?.length > 0 ? (
                          <Table size="sm" hover responsive className="mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Código</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                {isBibliotecario && <th>Acción</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {libro.ejemplares.map((ej) => (
                                <tr key={ej.id}>
                                  <td className="font-monospace small">{ej.codigoBarras}</td>
                                  <td className="small">{ej.ubicacion}</td>
                                  <td>
                                    <Badge bg={ej.estado === 'DISPONIBLE' ? 'success' : 'warning'}>
                                      {ej.estado}
                                    </Badge>
                                  </td>
                                  {isBibliotecario && (
                                    <td>
                                      {ej.estado === 'DISPONIBLE' && (
                                        <Button
                                          size="sm"
                                          variant="outline-primary"
                                          onClick={() => abrirPrestamoRapido(ej.codigoBarras)}
                                        >
                                          Prestar
                                        </Button>
                                      )}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <p className="text-body-secondary small mb-0">Sin copias físicas registradas.</p>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>

                  {isBibliotecario && (
                    <Stack direction="horizontal" className="mt-auto pt-3 justify-content-end">
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => setLibroSeleccionado(libro)}
                      >
                        <i className="bi bi-upc-scan me-1"></i> Agregar Ejemplar
                      </Button>
                    </Stack>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <LibroModal
        show={showLibroModal}
        onHide={() => setShowLibroModal(false)}
        onCreated={cargarLibros}
      />

      <EjemplarModal
        show={Boolean(libroSeleccionado)}
        onHide={() => setLibroSeleccionado(null)}
        libro={libroSeleccionado}
        onCreated={cargarLibros}
      />

      <NuevoPrestamoModal
        show={showPrestamoModal}
        onHide={() => setShowPrestamoModal(false)}
        codigoBarrasInicial={codigoPrestar}
        onCreated={cargarLibros}
      />
    </Container>
  );
}