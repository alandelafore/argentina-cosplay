import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "./graphql/queries";

export function App() {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { filter: { search: "" }, page: 1, pageSize: 10 },
  });

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <h1>Argentina Cosplay Marketplace</h1>
          <p>Comprar y vender cosplays, pelucas, props y más.</p>
        </div>
      </header>

      <main className="content">
        <section className="hero">
          <h2>Bienvenido</h2>
          <p>Explora los cosplays más buscados y productos destacados.</p>
        </section>

        <section className="products">
          <h3>Productos</h3>
          {loading && <p>Cargando productos...</p>}
          {error && <p>Error al cargar productos.</p>}
          <div className="product-grid">
            {data?.products?.data?.map((product: any) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">{product.images[0] ? <img src={product.images[0].url} alt={product.title} /> : <div className="placeholder">Sin imagen</div>}</div>
                <div className="product-body">
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
