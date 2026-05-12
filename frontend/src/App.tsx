import { FormEvent, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_CATEGORIES, GET_PRODUCTS } from "./graphql/queries";

export function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("ALL");

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

  const categories = categoryData?.categories || [];

  const categoryLabel = useMemo(() => {
    const found = categories.flatMap((parent: any) => [parent, ...(parent.children || [])]).find((category: any) => category.id === selectedCategory);
    return found?.name || "Todas";
  }, [categories, selectedCategory]);

  const handleFilterSubmit = (event: FormEvent) => {
    event.preventDefault();
    refetch();
  };

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>Argentina Cosplay Marketplace</h1>
          <p>Compra y vende cosplays, pelucas, calzado y props con filtros avanzados.</p>
        </div>
      </header>

      <main className="content catalog-layout">
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
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
