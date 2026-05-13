import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  ADD_CART_ITEM,
  CREATE_ORDER,
  CREATE_PRODUCT,
  GET_CART,
  GET_CATEGORIES,
  GET_ME,
  GET_PRODUCT,
  GET_PRODUCTS,
  LOGIN,
  REGISTER,
  REMOVE_CART_ITEM,
  UPDATE_PROFILE,
} from "./graphql/queries";
import { clearAuthTokens, setAuthTokens } from "./auth";

type PageView = "catalog" | "product" | "cart" | "profile" | "create";

export function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("ALL");
  const [page, setPage] = useState<PageView>("catalog");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCuit, setProfileCuit] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerCuit, setRegisterCuit] = useState("");

  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPrice, setCreatePrice] = useState("");
  const [createStock, setCreateStock] = useState("");
  const [createCondition, setCreateCondition] = useState<"NUEVO" | "USADO">("NUEVO");
  const [createCategoryId, setCreateCategoryId] = useState<string>("");
  const [createTags, setCreateTags] = useState("");
  const [createImageUrls, setCreateImageUrls] = useState<string[]>([]);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { data: categoryData } = useQuery(GET_CATEGORIES);
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: {
      filter: {
        categoryId: selectedCategory || undefined,
        search: search || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        condition: condition === "ALL" ? undefined : condition,
      },
      page: 1,
      pageSize: 12,
    },
  });

  const { data: meData, loading: meLoading, error: meError, refetch: refetchMe } = useQuery(GET_ME);
  const apolloClient = useApolloClient();
  const isAuthenticated = Boolean(meData?.me);

  const [login, { loading: loggingIn }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const { accessToken, refreshToken } = data.login;
      setAuthTokens(accessToken, refreshToken);
      setMessage("Has iniciado sesión correctamente");
      refetchMe();
      apolloClient.resetStore();
      setPage("catalog");
    },
  });

  const [register, { loading: registering }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      const { accessToken, refreshToken } = data.register;
      setAuthTokens(accessToken, refreshToken);
      setMessage("Cuenta creada y sesión iniciada");
      refetchMe();
      apolloClient.resetStore();
      setPage("catalog");
    },
  });

  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_PROFILE, {
    onCompleted: () => {
      setMessage("Perfil actualizado correctamente");
      refetchMe();
    },
  });

  const [createProduct, { loading: creatingProduct }] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      setMessage("Producto creado correctamente");
      setPage("catalog");
      setSelectedProductId(null);
      setCreateTitle("");
      setCreateDescription("");
      setCreatePrice("");
      setCreateStock("");
      setCreateCondition("NUEVO");
      setCreateTags("");
      setCreateImageUrls([]);
      setImageUploadError(null);
      apolloClient.resetStore();
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setImageUploadError(null);
    setUploadingImages(true);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    try {
      const response = await fetch("http://localhost:4000/api/uploads/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir las imágenes");
      }

      const data = await response.json();
      setCreateImageUrls(data.urls || []);
    } catch (error) {
      console.error(error);
      setImageUploadError("No se pudieron subir las imágenes. Intenta de nuevo.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleCreateProductSubmit = async (event: FormEvent) => {
    event.preventDefault();

    await createProduct({
      variables: {
        input: {
          title: createTitle,
          description: createDescription,
          price: Number(createPrice),
          categoryId: createCategoryId,
          condition: createCondition,
          stock: Number(createStock) || 0,
          tags: createTags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          images: createImageUrls,
        },
      },
    });
  };

  useEffect(() => {
    if (meData?.me) {
      setProfileName(meData.me.name || "");
      setProfilePhone(meData.me.phone || "");
      setProfileCuit(meData.me.cuit || "");
    }
  }, [meData]);

  const {
    data: productData,
    loading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useQuery(GET_PRODUCT, {
    variables: { id: selectedProductId },
    skip: page !== "product" || !selectedProductId,
  });

  const {
    data: cartData,
    loading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useQuery(GET_CART, {
    skip: page !== "cart" || !isAuthenticated,
    fetchPolicy: "network-only",
  });

  const [addCartItem, { loading: addingToCart }] = useMutation(ADD_CART_ITEM, {
    onCompleted: () => {
      setMessage("Producto agregado al carrito");
      refetchCart();
    },
  });

  const [removeCartItem, { loading: removingItem }] = useMutation(REMOVE_CART_ITEM, {
    onCompleted: () => {
      refetchCart();
    },
  });

  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_ORDER, {
    onCompleted: () => {
      setMessage("Orden creada correctamente");
      setPage("catalog");
      setSelectedProductId(null);
      refetchCart();
    },
  });

  const categories = categoryData?.categories || [];

  useEffect(() => {
    if (!createCategoryId && categories.length) {
      setCreateCategoryId(categories[0].id);
    }
  }, [categories, createCategoryId]);

  const categoryLabel = useMemo(() => {
    const found = categories.flatMap((parent: any) => [parent, ...(parent.children || [])]).find((category: any) => category.id === selectedCategory);
    return found?.name || "Todas";
  }, [categories, selectedCategory]);

  const cart = cartData?.cart;
  const cartTotal = cart?.items.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0) || 0;

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    refetch();
  };

  const openProduct = (productId: string) => {
    setSelectedProductId(productId);
    setPage("product");
    setMessage(null);
  };

  const handleAddToCart = async () => {
    if (!selectedProductId) return;

    await addCartItem({
      variables: {
        input: {
          productId: selectedProductId,
          quantity,
        },
      },
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeCartItem({ variables: { itemId } });
  };

  const handleCheckout = async () => {
    await createOrder();
  };

  const handleLogout = async () => {
    clearAuthTokens();
    setMessage("Has cerrado sesión");
    await apolloClient.clearStore();
    setPage("catalog");
  };

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (authMode === "login") {
      await login({
        variables: {
          email: authEmail,
          password: authPassword,
        },
      });
      return;
    }

    await register({
      variables: {
        input: {
          email: authEmail,
          password: authPassword,
          name: registerName,
          phone: registerPhone || null,
          cuit: registerCuit || null,
          roles: ["COMPRADOR"],
        },
      },
    });
  };

  return (
    <div className="container py-4">
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="mb-2">Argentina Cosplay Marketplace</h1>
          <p className="text-muted fs-5">Compra y vende cosplays, pelucas, calzado y props con filtros avanzados.</p>
        </div>

        <div className="btn-group" role="group">
          <button type="button" className={`btn ${page === "catalog" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage("catalog")}>Catálogo</button>
          <button type="button" className={`btn ${page === "cart" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage("cart")}>Carrito</button>
          <button type="button" className={`btn ${page === "profile" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage("profile")}>Perfil</button>
          {isAuthenticated && (
            <button type="button" className={`btn ${page === "create" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPage("create")}>Vender</button>
          )}
        </div>
      </header>

      {message && <div className="alert alert-success rounded-4">{message}</div>}

      {!meData?.me ? (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
              <div>
                <h2 className="h4">{authMode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
                <p className="text-muted mb-0">Ingresa tus datos para acceder o crear tu nueva cuenta de cosplay.</p>
              </div>
              <div className="btn-group" role="group">
                <button type="button" className={`btn ${authMode === "login" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => setAuthMode("login")}>Login</button>
                <button type="button" className={`btn ${authMode === "register" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => setAuthMode("register")}>Registro</button>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} type="email" placeholder="tu@correo.com" required className="form-control" />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Contraseña</label>
                <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} type="password" placeholder="Contraseña" required className="form-control" />
              </div>

              {authMode === "register" && (
                <>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Nombre</label>
                    <input value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="Nombre completo" required className="form-control" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Teléfono</label>
                    <input value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} placeholder="Teléfono" className="form-control" />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">CUIT</label>
                    <input value={registerCuit} onChange={(e) => setRegisterCuit(e.target.value)} placeholder="CUIT" className="form-control" />
                  </div>
                </>
              )}

              <div className="col-12">
                <button type="submit" className="btn btn-primary w-100" disabled={loggingIn || registering}>
                  {authMode === "login" ? (loggingIn ? "Entrando…" : "Iniciar sesión") : registering ? "Registrando…" : "Crear cuenta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm mb-4">
          <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <h2 className="h5 mb-1">Bienvenido, {meData.me.name}</h2>
              <p className="text-muted mb-0">{meData.me.email}</p>
            </div>
            <button className="btn btn-outline-danger" type="button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      )}

      {page === "catalog" && (
        <div className="row gy-4">
          <aside className="col-12 col-lg-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Buscar catálogo</h5>
                  <span className="badge bg-primary">Filtros</span>
                </div>
                <form onSubmit={handleFilterSubmit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Buscar</label>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Palabra clave" className="form-control" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Precio mínimo</label>
                    <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="form-control" />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Precio máximo</label>
                    <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="0" className="form-control" />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Condición</label>
                    <select value={condition} onChange={(e) => setCondition(e.target.value)} className="form-select">
                      <option value="ALL">Todas</option>
                      <option value="NUEVO">Nuevo</option>
                      <option value="USADO">Usado</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary w-100">Aplicar filtros</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Categorías</h5>
                <div className="list-group list-group-flush">
                  <button type="button" className={`list-group-item list-group-item-action ${selectedCategory === null ? "active" : ""}`} onClick={() => setSelectedCategory(null)}>
                    Todas
                  </button>
                  {categories.map((category: any) => (
                    <div key={category.id} className="mb-2">
                      <button type="button" className={`list-group-item list-group-item-action ${selectedCategory === category.id ? "active" : ""}`} onClick={() => setSelectedCategory(category.id)}>
                        {category.name}
                      </button>
                      {category.children?.length > 0 && (
                        <div className="ps-3 mt-2">
                          {category.children.map((child: any) => (
                            <button key={child.id} type="button" className={`list-group-item list-group-item-action ${selectedCategory === child.id ? "active" : ""}`} onClick={() => setSelectedCategory(child.id)}>
                              {child.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="col-12 col-lg-8">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-column flex-sm-row">
              <div>
                <h2 className="h4 mb-1">Catálogo de productos</h2>
                <p className="text-muted mb-0">{categoryLabel} • {data?.products?.data?.length ?? 0} resultados</p>
              </div>
              <button type="button" className="btn btn-outline-secondary" onClick={() => refetch()}>Refrescar</button>
            </div>

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            )}
            {error && <div className="alert alert-danger">Error al cargar productos.</div>}

            <div className="row g-4">
              {data?.products?.data?.map((product: any) => (
                <article className="col-12 col-md-6" key={product.id}>
                  <div className="card h-100 shadow-sm">
                    <div className="ratio ratio-4x3">
                      {product.images[0] ? (
                        <img src={product.images[0].url} alt={product.title} className="card-img-top object-fit-cover" />
                      ) : (
                        <div className="placeholder">Sin imagen</div>
                      )}
                    </div>
                    <div className="card-body d-flex flex-column">
                      <span className="text-primary text-uppercase small mb-2">{product.category?.name || "Sin categoría"}</span>
                      <h5 className="card-title">{product.title}</h5>
                      <p className="card-text text-muted">{product.description.slice(0, 120)}...</p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="fw-semibold">${product.price.toFixed(2)}</span>
                          <span className="badge bg-secondary text-uppercase">{product.condition}</span>
                        </div>
                        <button type="button" className="btn btn-outline-primary w-100" onClick={() => openProduct(product.id)}>
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {page === "create" && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-sm-row gap-3">
              <div>
                <h2 className="h4 mb-1">Crear nuevo producto</h2>
                <p className="text-muted mb-0">Sube imágenes y completa los datos para publicar tu producto en el marketplace.</p>
              </div>
              <button type="button" className="btn btn-link p-0" onClick={() => setPage("catalog")}>← Volver al catálogo</button>
            </div>

            <form className="row g-3" onSubmit={handleCreateProductSubmit}>
              <div className="col-12 col-md-6">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  required
                  placeholder="Título del producto"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={createCategoryId}
                  onChange={(e) => setCreateCategoryId(e.target.value)}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe el producto"
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Precio</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={createStock}
                  onChange={(e) => setCreateStock(e.target.value)}
                  required
                  placeholder="0"
                />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Condición</label>
                <select
                  className="form-select"
                  value={createCondition}
                  onChange={(e) => setCreateCondition(e.target.value as "NUEVO" | "USADO")}
                  required
                >
                  <option value="NUEVO">Nuevo</option>
                  <option value="USADO">Usado</option>
                </select>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">Etiquetas</label>
                <input
                  type="text"
                  className="form-control"
                  value={createTags}
                  onChange={(e) => setCreateTags(e.target.value)}
                  placeholder="cosplay, peluca, prop"
                />
              </div>
              <div className="col-12">
                <label className="form-label">Imágenes</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-control"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
                {imageUploadError && <div className="text-danger mt-2">{imageUploadError}</div>}
                {uploadingImages && <div className="text-muted mt-2">Subiendo imágenes...</div>}
              </div>
              {createImageUrls.length > 0 && (
                <div className="col-12">
                  <div className="row g-3">
                    {createImageUrls.map((url) => (
                      <div key={url} className="col-6 col-md-3">
                        <div className="ratio ratio-1x1 rounded-4 overflow-hidden bg-light">
                          <img src={url} alt="Preview" className="img-fluid object-fit-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="col-12">
                <button type="submit" className="btn btn-primary" disabled={creatingProduct || uploadingImages}>
                  {creatingProduct ? "Creando producto…" : "Crear producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {page === "product" && selectedProductId && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <button type="button" className="btn btn-link mb-4 p-0" onClick={() => setPage("catalog")}>← Volver al catálogo</button>
            {productLoading && <p>Cargando producto...</p>}
            {productError && <div className="alert alert-danger">Error al cargar producto.</div>}
            {productData?.product && (
              <div className="row g-4">
                <div className="col-12 col-lg-6">
                  <div className="row g-3">
                    {productData.product.images.length > 0 ? (
                      productData.product.images.map((image: any, index: number) => (
                        <div className="col-12" key={index}>
                          <div className="ratio ratio-4x3 rounded-4 overflow-hidden">
                            <img src={image.url} alt={`${productData.product.title} ${index + 1}`} className="object-fit-cover" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="placeholder">Sin imagen</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <span className="text-primary text-uppercase small">{productData.product.category?.name || "Sin categoría"}</span>
                  <h2 className="mt-2">{productData.product.title}</h2>
                  <p className="text-muted">Vendedor: {productData.product.seller.name}</p>
                  <p>{productData.product.description}</p>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="card p-3 text-center rounded-4 border-0 bg-light">
                        <span className="d-block text-muted small">Precio</span>
                        <strong>${productData.product.price.toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card p-3 text-center rounded-4 border-0 bg-light">
                        <span className="d-block text-muted small">Stock</span>
                        <strong>{productData.product.stock}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="row g-3 align-items-center">
                    <div className="col-12 col-sm-6">
                      <label className="form-label">Cantidad</label>
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="form-control" />
                    </div>
                    <div className="col-12 col-sm-6 d-grid">
                      <button type="button" className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={addingToCart}>
                        {addingToCart ? "Agregando…" : "Agregar al carrito"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {page === "cart" && (
        <div className="row gy-4">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h2 className="h4 mb-3">Carrito</h2>
                {!isAuthenticated && <p>Debes iniciar sesión para ver tu carrito.</p>}
                {cartLoading && <p>Cargando carrito...</p>}
                {cartError && <div className="alert alert-danger">Error al cargar carrito.</div>}
                {!cartLoading && !cart?.items?.length && <p>El carrito está vacío.</p>}
                <div className="row g-3">
                  {cart?.items?.map((item: any) => (
                    <article className="col-12" key={item.id}>
                      <div className="card border-0 shadow-sm">
                        <div className="row g-0 align-items-center">
                          <div className="col-4">
                            {item.product.images[0] ? (
                              <img src={item.product.images[0].url} alt={item.product.title} className="img-fluid rounded-start object-fit-cover h-100" style={{ minHeight: "160px" }} />
                            ) : (
                              <div className="placeholder">Sin imagen</div>
                            )}
                          </div>
                          <div className="col-8 p-3">
                            <h5>{item.product.title}</h5>
                            <p className="mb-1">{item.variant?.sku ? `Variante: ${item.variant.sku}` : "Sin variante"}</p>
                            <p className="mb-1">Cantidad: {item.quantity}</p>
                            <p className="mb-1">Precio unitario: ${item.unitPrice.toFixed(2)}</p>
                            <p className="mb-3">Total: ${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveItem(item.id)} disabled={removingItem}>
                              {removingItem ? "Eliminando…" : "Eliminar"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <aside className="col-12 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title">Resumen</h5>
                  <p className="text-muted">Total de tu compra</p>
                </div>
                <div>
                  <div className="mb-3">
                    <span className="d-block text-muted">Total</span>
                    <strong className="fs-3">${cartTotal.toFixed(2)}</strong>
                  </div>
                  <button type="button" className="btn btn-primary w-100" onClick={handleCheckout} disabled={creatingOrder || !cart?.items?.length}>
                    {creatingOrder ? "Procesando orden…" : "Finalizar compra"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {page === "profile" && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-4 flex-column flex-md-row">
              <div>
                <h2 className="h4">Perfil de usuario</h2>
                <p className="text-muted mb-0">Actualiza tus datos personales para el marketplace.</p>
              </div>
            </div>
            {!isAuthenticated && <p>Debes iniciar sesión para ver y actualizar tu perfil.</p>}
            {meLoading && <p>Cargando perfil...</p>}
            {meError && <div className="alert alert-danger">Error al cargar perfil.</div>}
            {meData?.me && (
              <form className="row g-3" onSubmit={async (event) => {
                event.preventDefault();
                await updateProfile({
                  variables: {
                    input: {
                      name: profileName || undefined,
                      phone: profilePhone || undefined,
                      cuit: profileCuit || undefined,
                    },
                  },
                });
              }}>
                <div className="col-12 col-md-4">
                  <label className="form-label">Nombre</label>
                  <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nombre" className="form-control" />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Teléfono" className="form-control" />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">CUIT</label>
                  <input value={profileCuit} onChange={(e) => setProfileCuit(e.target.value)} placeholder="CUIT" className="form-control" />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">{updatingProfile ? "Guardando…" : "Actualizar perfil"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
