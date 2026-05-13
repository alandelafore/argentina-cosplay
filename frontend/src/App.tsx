import { FormEvent, useEffect, useMemo, useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  ADD_CART_ITEM,
  CREATE_ORDER,
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

type PageView = "catalog" | "product" | "cart" | "profile";

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
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>Argentina Cosplay Marketplace</h1>
          <p>Compra y vende cosplays, pelucas, calzado y props con filtros avanzados.</p>
        </div>
        <div className="header-actions">
          <button className={page === "catalog" ? "nav-button active" : "nav-button"} onClick={() => setPage("catalog")}>Catálogo</button>
          <button className={page === "cart" ? "nav-button active" : "nav-button"} onClick={() => setPage("cart")}>Carrito</button>
          <button className={page === "profile" ? "nav-button active" : "nav-button"} onClick={() => setPage("profile")}>Perfil</button>
        </div>
      </header>

      <main className="content">
        {message && <div className="flash-message">{message}</div>}

        {!meData?.me ? (
          <div className="auth-panel">
            <div className="auth-header">
              <h2>{authMode === "login" ? "Iniciar sesión" : "Registrar cuenta"}</h2>
              <div className="auth-toggle">
                <button type="button" className={authMode === "login" ? "nav-button active" : "nav-button"} onClick={() => setAuthMode("login")}>Login</button>
                <button type="button" className={authMode === "register" ? "nav-button active" : "nav-button"} onClick={() => setAuthMode("register")}>Registro</button>
              </div>
            </div>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label>
                Email
                <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} type="email" placeholder="Tu email" required />
              </label>
              <label>
                Contraseña
                <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} type="password" placeholder="Tu contraseña" required />
              </label>
              {authMode === "register" && (
                <>
                  <label>
                    Nombre
                    <input value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="Tu nombre" required />
                  </label>
                  <label>
                    Teléfono
                    <input value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value)} placeholder="Teléfono" />
                  </label>
                  <label>
                    CUIT
                    <input value={registerCuit} onChange={(e) => setRegisterCuit(e.target.value)} placeholder="CUIT" />
                  </label>
                </>
              )}
              <button type="submit" className="action-button" disabled={loggingIn || registering}>
                {authMode === "login" ? (loggingIn ? "Entrando…" : "Iniciar sesión") : registering ? "Registrando…" : "Crear cuenta"}
              </button>
            </form>
          </div>
        ) : (
          <div className="user-card">
            <div>
              <strong>Bienvenido, {meData.me.name}</strong>
              <p>{meData.me.email}</p>
            </div>
            <button className="remove-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        )}

        {page === "catalog" && (
          <div className="catalog-layout">
            <aside className="sidebar">
              <div className="filter-panel">
                <h3>Buscar catálogo</h3>
                <form onSubmit={handleFilterSubmit}>
                  <label>
                    Buscar
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Palabra clave" />
                  </label>
                  <label>
                    Precio mínimo
                    <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
                  </label>
                  <label>
                    Precio máximo
                    <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="0" />
                  </label>
                  <label>
                    Condición
                    <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                      <option value="ALL">Todas</option>
                      <option value="NUEVO">Nuevo</option>
                      <option value="USADO">Usado</option>
                    </select>
                  </label>
                  <button type="submit">Aplicar filtros</button>
                </form>
              </div>

              <div className="category-panel">
                <h3>Categorías</h3>
                <button className={selectedCategory === null ? "category-button active" : "category-button"} onClick={() => setSelectedCategory(null)}>
                  Todas
                </button>
                {categories.map((category: any) => (
                  <div key={category.id} className="category-group">
                    <button className={selectedCategory === category.id ? "category-button active" : "category-button"} onClick={() => setSelectedCategory(category.id)}>
                      {category.name}
                    </button>
                    {category.children?.length > 0 && (
                      <div className="category-children">
                        {category.children.map((child: any) => (
                          <button key={child.id} className={selectedCategory === child.id ? "category-button active" : "category-button child"} onClick={() => setSelectedCategory(child.id)}>
                            {child.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </aside>

            <section className="catalog-section">
              <div className="catalog-header">
                <div>
                  <h2>Catálogo de productos</h2>
                  <p>{categoryLabel} • {data?.products?.data?.length ?? 0} resultados</p>
                </div>
              </div>

              {loading && <p>Cargando productos...</p>}
              {error && <p>Error al cargar productos.</p>}

              <div className="product-grid">
                {data?.products?.data?.map((product: any) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image">
                      {product.images[0] ? <img src={product.images[0].url} alt={product.title} /> : <div className="placeholder">Sin imagen</div>}
                    </div>
                    <div className="product-body">
                      <div className="product-category">{product.category?.name || "Sin categoría"}</div>
                      <h4>{product.title}</h4>
                      <p>{product.description.slice(0, 120)}...</p>
                      <div className="product-meta">
                        <span>${product.price.toFixed(2)}</span>
                        <span>{product.condition}</span>
                      </div>
                      <button className="action-button" onClick={() => openProduct(product.id)}>Ver detalles</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {page === "product" && selectedProductId && (
          <div className="product-detail">
            <button className="back-button" onClick={() => setPage("catalog")}>← Volver al catálogo</button>
            {productLoading && <p>Cargando producto...</p>}
            {productError && <p>Error al cargar producto.</p>}
            {productData?.product && (
              <div className="detail-grid">
                <div className="detail-images">
                  {productData.product.images.length > 0 ? (
                    productData.product.images.map((image: any, index: number) => (
                      <img key={index} src={image.url} alt={`${productData.product.title} ${index + 1}`} />
                    ))
                  ) : (
                    <div className="placeholder">Sin imagen</div>
                  )}
                </div>

                <div className="detail-info">
                  <div className="product-category">{productData.product.category?.name || "Sin categoría"}</div>
                  <h2>{productData.product.title}</h2>
                  <p className="product-seller">Vendedor: {productData.product.seller.name}</p>
                  <p>{productData.product.description}</p>
                  <div className="product-meta detail-meta">
                    <span>${productData.product.price.toFixed(2)}</span>
                    <span>{productData.product.condition}</span>
                    <span>Stock: {productData.product.stock}</span>
                  </div>

                  <div className="detail-actions">
                    <label>
                      Cantidad
                      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                    </label>
                    <button className="action-button" onClick={handleAddToCart} disabled={addingToCart}>
                      {addingToCart ? "Agregando…" : "Agregar al carrito"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {page === "cart" && (
          <div className="cart-page">
            <h2>Carrito</h2>
            {!isAuthenticated && <p>Debes iniciar sesión para ver tu carrito.</p>}
            {isAuthenticated && (
              <>
                {cartLoading && <p>Cargando carrito...</p>}
                {cartError && <p>Error al cargar carrito.</p>}
                {!cartLoading && !cart?.items?.length && <p>El carrito está vacío.</p>}

                {cart?.items?.length > 0 && (
                  <>
                    <div className="cart-grid">
                      {cart.items.map((item: any) => (
                        <article className="cart-item" key={item.id}>
                          <div className="cart-image">
                            {item.product.images[0] ? <img src={item.product.images[0].url} alt={item.product.title} /> : <div className="placeholder">Sin imagen</div>}
                          </div>
                          <div className="cart-info">
                            <h3>{item.product.title}</h3>
                            <p>{item.variant?.sku ? `Variante: ${item.variant.sku}` : "Sin variante"}</p>
                            <p>Cantidad: {item.quantity}</p>
                            <p>Precio unitario: ${item.unitPrice.toFixed(2)}</p>
                            <p>Total: ${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            <button className="remove-button" onClick={() => handleRemoveItem(item.id)} disabled={removingItem}>
                              {removingItem ? "Eliminando…" : "Eliminar"}
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="cart-summary">
                      <div>
                        <h3>Total</h3>
                        <p>${cartTotal.toFixed(2)}</p>
                      </div>
                      <button className="checkout-button" onClick={handleCheckout} disabled={creatingOrder}>
                        {creatingOrder ? "Procesando orden…" : "Finalizar compra"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {page === "profile" && (
          <div className="profile-page">
            <h2>Perfil de usuario</h2>
            {!isAuthenticated && <p>Debes iniciar sesión para ver y actualizar tu perfil.</p>}
            {isAuthenticated && (
              <>
                {meLoading && <p>Cargando perfil...</p>}
                {meError && <p>Error al cargar perfil.</p>}
                {meData?.me && (
                  <form
                    className="profile-form"
                    onSubmit={async (event) => {
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
                    }}
                  >
                    <label>
                      Nombre
                      <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Nombre" />
                    </label>
                    <label>
                      Teléfono
                      <input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Teléfono" />
                    </label>
                    <label>
                      CUIT
                      <input value={profileCuit} onChange={(e) => setProfileCuit(e.target.value)} placeholder="CUIT" />
                    </label>
                    <button type="submit" className="action-button" disabled={updatingProfile}>
                      {updatingProfile ? "Guardando…" : "Actualizar perfil"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
