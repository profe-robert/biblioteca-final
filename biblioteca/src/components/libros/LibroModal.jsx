import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { librosApi } from '../../api/librosApi';
import { useStore } from '../../store/StoreContext';

export default function LibroModal({ show, onHide, onCreated }) {
  const { notify } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    titulo: '',
    autor: '',
    anioPublicacion: new Date().getFullYear(),
    categoria: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'anioPublicacion' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await librosApi.crearLibro(formData);
      notify('success', 'Libro registrado correctamente en el catálogo.');
      setFormData({ isbn: '', titulo: '', autor: '', anioPublicacion: new Date().getFullYear(), categoria: '' });
      onCreated();
      onHide();
    } catch (err) {
      notify('danger', err.response?.data?.message || 'Error al crear el libro.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-journal-plus me-2 text-primary"></i>Nuevo Libro
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>ISBN</Form.Label>
            <Form.Control
              name="isbn"
              placeholder="Ej: 978-8420412146"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Título</Form.Label>
            <Form.Control
              name="titulo"
              placeholder="Título de la obra"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Autor</Form.Label>
            <Form.Control
              name="autor"
              placeholder="Nombre del autor"
              value={formData.autor}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Año Publicación</Form.Label>
                <Form.Control
                  type="number"
                  name="anioPublicacion"
                  value={formData.anioPublicacion}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Control
                  name="categoria"
                  placeholder="Ej: Novela, Ciencia"
                  value={formData.categoria}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar Libro'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}