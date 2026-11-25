import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Table, Badge, Button, Spinner, Stack, Card } from 'react-bootstrap';
import { prestamosApi } from '../api/prestamosApi';
import { useAuth, useStore } from '../store/StoreContext';
import NuevoPrestamoModal from '../components/prestamos/NuevoPrestamoModal';
import DevolucionModal from '../components/prestamos/DevolucionModal';

export default function PrestamosPage() {
  const { state, dispatch, notify } = useStore();
  const { isBibliotecario } = useAuth();
  const [showNuevoModal, setShowNuevoModal] = useState(false);
  const [codigoDevolver, setCodigoDevolver] = useState('');
  const [showDevolucionModal, setShowDevolucionModal] = useState(false);

  const cargarPrestamos = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = isBibliotecario
        ? await prestamosApi.listarTodos()
        : await prestamosApi.listarMisPrestamos();
      dispatch({ type: 'SET_PRESTAMOS', payload: data });
    } catch {
      notify('danger', 'No se pudo cargar el historial de préstamos.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, isBibliotecario, notify]);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  const abrirDevolucionRapida = (codigoBarras = '') => {
    setCodigoDevolver(codigoBarras);
    setShowDevolucionModal(true);
  };

  return (
    <Container className="pb-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="fw-bold mb-0">
            {isBibliotecario ? 'Control Global de Préstamos' : 'Mis Préstamos'}
          </h2>
        </Col>
        {isBibliotecario && (
          <Col xs="auto">
            <Stack direction="horizontal" gap={2}>
              <Button variant="primary" onClick={() => setShowNuevoModal(true)}>
                <i className="bi bi-journal-arrow-up me-1"></i> Nuevo Préstamo
              </Button>
              <Button variant="success" onClick={() => abrirDevolucionRapida('')}>
                <i className="bi bi-journal-check me-1"></i> Devolución
              </Button>
            </Stack>
          </Col>
        )}
      </Row>

      {state.loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Libro</th>
                  <th>Ejemplar</th>
                  {isBibliotecario && <th>Socio</th>}
                  <th>Inicio</th>
                  <th>Vencimiento</th>
                  <th>Devolución</th>
                  <th>Estado</th>
                  {isBibliotecario && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {state.prestamos.length === 0 ? (
                  <tr>
                    <td colSpan={isBibliotecario ? 9 : 7} className="text-center py-4 text-body-secondary">
                      No hay préstamos registrados.
                    </td>
                  </tr>
                ) : (
                  state.prestamos.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td className="fw-semibold">{p.tituloLibro}</td>
                      <td className="font-monospace small">{p.codigoBarrasEjemplar}</td>
                      {isBibliotecario && (
                        <td>
                          <div>{p.nombreUsuario}</div>
                          <small className="text-body-secondary">{p.emailUsuario}</small>
                        </td>
                      )}
                      <td>{p.fechaInicio}</td>
                      <td>{p.fechaVencimiento}</td>
                      <td>{p.fechaDevolucionReal || '-'}</td>
                      <td>
                        <Badge
                          bg={
                            p.estado === 'DEVUELTO'
                              ? 'success'
                              : p.diasRetraso > 0
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {p.estado} {p.diasRetraso > 0 && `(${p.diasRetraso}d mora)`}
                        </Badge>
                      </td>
                      {isBibliotecario && (
                        <td>
                          {p.estado === 'ACTIVO' && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => abrirDevolucionRapida(p.codigoBarrasEjemplar)}
                            >
                              Devolver
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <NuevoPrestamoModal
        show={showNuevoModal}
        onHide={() => setShowNuevoModal(false)}
        onCreated={cargarPrestamos}
      />

      <DevolucionModal
        show={showDevolucionModal}
        onHide={() => setShowDevolucionModal(false)}
        codigoBarrasInicial={codigoDevolver}
        onCompleted={cargarPrestamos}
      />
    </Container>
  );
}