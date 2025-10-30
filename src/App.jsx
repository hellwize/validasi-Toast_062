import { useState, useEffect, useMemo } from 'react';
import {
  Container, Row, Col, Card,
  Form, Button, Table,
  Toast, ToastContainer, FloatingLabel, InputGroup
} from 'react-bootstrap';

export default function App() {
  // Inisialisasi state dari localStorage atau array kosong
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  // State untuk form input
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [stock, setStock] = useState(0);
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Menyimpan data ke localStorage setiap kali state `products` berubah
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const categories = useMemo(() => ['Elektronik', 'Pakaian', 'Makanan'], []);

  // Fungsi untuk validasi form
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();

    // Validasi Nama Produk
    if (!trimmedName) {
      newErrors.name = 'Nama Produk wajib diisi.';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Nama Produk maksimal 100 karakter.';
    }

    // Validasi Deskripsi
    if (description.trim().length > 0 && description.trim().length < 20) {
      newErrors.description = 'Deskripsi minimal 20 karakter.';
    }

    // Validasi Harga
    if (!price) {
      newErrors.price = 'Harga wajib diisi.';
    } else if (isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Harga harus angka dan lebih dari 0.';
    }

    // Validasi Kategori
    if (!category) {
      newErrors.category = 'Kategori wajib dipilih.';
    }

    // Validasi Tanggal Rilis
    if (releaseDate) {
      const today = new Date().toISOString().split('T')[0];
      if (releaseDate > today) {
        newErrors.releaseDate = 'Tanggal rilis tidak boleh di masa depan.';
      }
    }

    // Validasi Stok
    if (isNaN(stock) || Number(stock) < 0) {
      newErrors.stock = 'Stok harus angka dan tidak boleh negatif.';
    } else if (Number(stock) > 10000) {
        newErrors.stock = 'Stok maksimal yang wajar adalah 10.000.';
    }

    return newErrors;
  };

  // Fungsi untuk mereset form
  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setReleaseDate('');
    setStock(0);
    setActive(true);
    setErrors({});
    setEditingId(null);
  };

  // Fungsi untuk menampilkan notifikasi toast
  const showToastMsg = (message, variant = 'success') => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Handler untuk submit form (tambah/update)
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showToastMsg('Periksa kembali input Anda.', 'danger');
      return;
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      releaseDate,
      stock: Number(stock),
      active,
    };

    if (editingId === null) {
      // Tambah produk baru
      setProducts(prev => [{ id: Date.now(), ...productData }, ...prev]);
      showToastMsg('Produk berhasil ditambahkan.', 'success');
    } else {
      // Update produk yang ada
      setProducts(prev =>
        prev.map(p => (p.id === editingId ? { id: editingId, ...productData } : p))
      );
      showToastMsg('Produk berhasil diperbarui.', 'success');
    }

    resetForm();
  };

  // Handler untuk mengisi form saat tombol edit diklik
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setCategory(product.category);
    setReleaseDate(product.releaseDate || '');
    setStock(product.stock);
    setActive(product.active);
    setErrors({});
  };

  // Handler untuk menghapus produk
  const handleDelete = (id) => {
    const target = products.find(p => p.id === id);
    if (!target) return;

    const isConfirmed = window.confirm(`Apakah Anda yakin ingin menghapus produk "${target.name}"?`);
    if (!isConfirmed) return;

    setProducts(prev => prev.filter(p => p.id !== id));
    if (editingId === id) {
        resetForm();
    }
    showToastMsg('Produk berhasil dihapus.', 'success');
  };

  const isEditing = editingId !== null;

  return (
    <Container className="py-4">
      <Row>
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header as="h2">
              {isEditing ? 'Edit Produk' : 'Tambah Produk'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} noValidate>
                {/* Nama Produk */}
                <Form.Group className="mb-3" controlId="namaProduk">
                  <Form.Label>Nama Produk:  </Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      type="text"
                      placeholder="Masukkan nama produk"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      isInvalid={!!errors.name}
                      maxLength={100}
                      required
                    />
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Col>
                </Form.Group>

                {/* Deskripsi */}
                <Form.Group className="mb-3" controlId='deskripsiProduk'>
                  <Form.Label>Deskripsi:  </Form.Label>
                    <Col sm={9}>
                      <Form.Control
                        as="textarea"
                        placeholder="Deskripsi"
                        style={{ height: '100px' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        isInvalid={!!errors.description}
                      />
                    <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Col>
                </Form.Group>

                {/* Harga */}
                <Form.Group className="mb-3" controlId='hargaProduk'>
                  <Form.Label>Harga:  </Form.Label> 
                    <Col sm={9}>
                        <Form.Control
                        type="number"
                        placeholder=" Masukkan harga"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        isInvalid={!!errors.price}
                        required
                        />
                        <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                    </Col>    
                </Form.Group>

                {/* Kategori */}
                <Form.Group className="mb-3" controlId='kategoriProduk'>
                  <Form.Label>Kategori:   </Form.Label>  
                    <Col sm={9}>
                        <Form.Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        isInvalid={!!errors.category}
                        required
                        >
                        <option value="">Pilih Kategori</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback> 
                    </Col> 
                </Form.Group>

                {/* Tanggal Rilis */}
                <Form.Group className="mb-3" controlId='rilisProduk'>
                  <Form.Label>Tanggal Rilis:  </Form.Label> 
                    <Col sm={9}> 
                        <Form.Control
                        type="date"
                        value={releaseDate}
                        onChange={(e) => setReleaseDate(e.target.value)}
                        isInvalid={!!errors.releaseDate}
                        />
                        <Form.Control.Feedback type="invalid">{errors.releaseDate}</Form.Control.Feedback>
                    </Col> 
                </Form.Group>

                {/* Stok Tersedia */}
                <Form.Group className="mb-3" controlId='stokProduk'>
                  <Form.Label>Stok Tersedia:  </Form.Label>
                  <Col sm={9}>
                  <Form.Control
                        type="number"
                        placeholder="Masukkan jumlah stok"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        isInvalid={!!errors.stock}
                        required
                        />
                  <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                  </Col>
                </Form.Group>

                {/* Produk Aktif */}
                <Form.Group className="mb-3" controlId='produkAktif'>
                  <Form.Check
                    type="switch"
                    id="product-active-switch"
                    label="Produk Aktif"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button type="submit" variant={isEditing ? 'primary' : 'success'}>
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="secondary" onClick={resetForm}>
                      Batal
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <Card.Header as="h5">Daftar Produk</Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th className="text-center">#</th>
                    <th>Nama</th>
                    <th>Harga</th>
                    <th>Kategori</th>
                    <th>Status</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        Belum ada data produk.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr key={product.id}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product.name}</td>
                        <td>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</td>
                        <td>{product.category}</td>
                        <td>{product.active ? 'Aktif' : 'Tidak Aktif'}</td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button size="sm" variant="warning" onClick={() => handleEdit(product)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifikasi Toast */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1 }}>
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header closeButton>
            <strong className="me-auto">Notifikasi</strong>
            <small>Baru saja</small>
          </Toast.Header>
          <Toast.Body className={toastVariant === 'danger' ? 'text-white' : ''}>
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}