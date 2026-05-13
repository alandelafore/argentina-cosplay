import { Dispatch, SetStateAction, useState } from "react";

type PageView = "catalog" | "product" | "cart" | "profile" | "create";

type Category = {
  id: string;
  name: string;
  slug?: string;
  children?: Array<{ id: string; name: string }>;
};

type HeaderProps = {
  isAuthenticated: boolean;
  currentPage: PageView;
  onNavigate: Dispatch<SetStateAction<PageView>>;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
};

const navItems: Array<{ label: string; page: PageView }> = [
  { label: "Inicio", page: "catalog" },
  { label: "Quiénes Somos", page: "profile" },
  { label: "Contacto", page: "catalog" },
];

export function Header({ isAuthenticated, currentPage, onNavigate, categories, selectedCategory, onSelectCategory }: HeaderProps) {
  const [productsMenuVisible, setProductsMenuVisible] = useState(false);

  const handleCategoryClick = (categoryId: string | null) => {
    onSelectCategory(categoryId);
    onNavigate("catalog");
    setProductsMenuVisible(false);
  };

  return (
    <header className="site-header mb-5">
      <div className="top-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-3">
        <div className="brand-group d-flex flex-column gap-2">
          <button type="button" className="site-logo" onClick={() => onNavigate("catalog")}>
            Cosplay Argentina
          </button>
          <p className="site-subtitle mb-0">
            Confección y venta de cosplay, disfraces y vestuario para tu próxima aventura.
          </p>
        </div>

        <div className="header-actions d-flex flex-wrap gap-2 justify-content-end">
          <div
            className="products-menu-wrapper"
            onMouseEnter={() => setProductsMenuVisible(true)}
            onMouseLeave={() => setProductsMenuVisible(false)}
          >
            <button
              type="button"
              className={`btn btn-outline-secondary site-action-btn ${currentPage === "catalog" && !selectedCategory ? "active-nav" : ""}`}
              onClick={() => handleCategoryClick(null)}
            >
              Productos
            </button>
            <div className={`products-dropdown shadow-sm ${productsMenuVisible ? "visible" : ""}`}>
              <div className="dropdown-title">Categorías</div>
              <div className="dropdown-grid">
                <button
                  type="button"
                  className={`dropdown-category ${selectedCategory === null ? "selected" : ""}`}
                  onClick={() => handleCategoryClick(null)}
                >
                  Todas las categorías
                </button>
                {categories.map((category) => (
                  <div key={category.id} className="dropdown-column">
                    <button
                      type="button"
                      className={`dropdown-category ${selectedCategory === category.id ? "selected" : ""}`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {category.name}
                    </button>
                    {category.children?.length ? (
                      <div className="dropdown-children">
                        {category.children.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            className={`dropdown-child ${selectedCategory === child.id ? "selected" : ""}`}
                            onClick={() => handleCategoryClick(child.id)}
                          >
                            {child.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`btn btn-outline-secondary site-action-btn ${currentPage === item.page ? "active-nav" : ""}`}
              onClick={() => onNavigate(item.page)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className={`btn btn-outline-secondary site-action-btn ${currentPage === "create" ? "active-nav" : ""}`}
            onClick={() => onNavigate("create")}
          >
            Vender
          </button>
        </div>
      </div>

      <div className="hero-card card shadow-sm mb-4">
        <div className="card-body row align-items-center gap-4">
          <div className="col-lg-7">
            <span className="badge badge-kawaii">Envíos a todo el país</span>
            <h1 className="hero-title">Tu tienda online de cosplay 100% argentina</h1>
            <p className="hero-text">
              Explora disfraces, pelucas, props y accesorios con estilo. Todo para tu próxima convención o sesión de fotos.
            </p>
            <div className="hero-actions d-flex flex-wrap gap-2 mt-3">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => onNavigate("catalog")}>
                Ver todos los productos
              </button>
              {isAuthenticated ? (
                <button type="button" className="btn btn-outline-primary btn-lg" onClick={() => onNavigate("create")}>Vender ahora</button>
              ) : (
                <button type="button" className="btn btn-outline-primary btn-lg" onClick={() => onNavigate("catalog")}>Explorar catálogo</button>
              )}
            </div>
          </div>
          <div className="col-lg-4 hero-image-container">
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80"
                alt="Cosplay Argentina"
                className="img-fluid shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
