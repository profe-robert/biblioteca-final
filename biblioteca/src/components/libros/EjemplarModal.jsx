import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { librosApi } from '../../api/librosApi';
import { useStore } from '../../store/StoreContext';

export default function EjemplarModal({ show, onHide, libro, onCreated }) {
  const { notify } = useStore();
  const [codigoBarras, setCodigoBarras] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!libro) return;
    setSubmitting(true);
    try {
      await librosApi.agregarEjemplar({
        libroId: libro.id,
        codigoBarras,
        ubicacion,
      });
      notify('success', `Ejemplar ${codigoBarras} agregado a "${libro.titulo}".`);
      setCodigoBarras('');
      setUbicacion('');
      onCreated();
      onHide();
    } catch (err) {
      notify('danger', err.response?.data?.message || 'Error al agregar ejemplar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-upc-scan me-2 text-success"></i>Agregar Ejemplar Físico
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-body-secondary small mb-3">
            Libro seleccionado: <strong>{libro?.titulo}</strong>
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Código de Barras</Form.Label>
            <Form.Control
              placeholder="Ej: EJ-QUIJ-003"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Ubicación en Estantería</Form.Label>
            <Form.Control
              placeholder="Ej: Pasillo A - Estante 2"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={submitting}>
            {submitting ? 'Registrando...' : 'Agregar Copia'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}