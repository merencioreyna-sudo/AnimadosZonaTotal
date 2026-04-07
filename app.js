// ===== CONFIGURACIÓN =====
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz7Rjqpa4mqD04a5Q3BgorDvVvIM855Sn5ean2QdU0mnvIeT7JfFNn2z6gc7cULVhnk/exec';
let todosLosAnimados = [];
let animadoActual = null;
let capituloActual = 1;
// Destacados
let destacadosCarousel;
let destacadosPrevBtn;
let destacadosNextBtn;

// ===== DOM ELEMENTS =====
const animadosGrid = document.getElementById('animadosGrid');
const animadosCounter = document.getElementById('animadosCounter');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');
const modalOverlay = document.getElementById('animadoModal');
const closeModal = document.getElementById('closeModal');
const modalTitulo = document.getElementById('modalTitulo');
const modalSinopsis = document.getElementById('modalSinopsis');
const modalIdioma = document.getElementById('modalIdioma');
const modalAnio = document.getElementById('modalAnio');
const modalCategoria = document.getElementById('modalCategoria');
const modalTotalCaps = document.getElementById('modalTotalCaps');
const videoIframe = document.getElementById('videoIframe');
const capitulosLista = document.getElementById('capitulosLista');
const capituloActualSpan = document.getElementById('capituloActual');
const capAnteriorBtn = document.getElementById('capAnterior');
const capSiguienteBtn = document.getElementById('capSiguiente');

// ===== CARGAR ANIMADOS =====
async function cargarAnimados() {
    try {
        mostrarLoading(true);
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        
        if (data.success && data.data) {
            todosLosAnimados = data.data;

            const unicos = [];

            todosLosAnimados.forEach(a => {
                if (!unicos.find(u => u.Titulo === a.Titulo)) {
                    unicos.push(a);
                }
            });

            renderizarAnimados(unicos);
            actualizarContador(unicos.length);

            renderizarDestacados(todosLosAnimados.filter(a => a.Destacado === "SI"));

        } else {
            mostrarError('No se pudieron cargar los animados.');
        }
    } catch (error) {
        console.error(error);
        mostrarError('Error de conexión.');
    } finally {
        mostrarLoading(false);
    }
}

function mostrarLoading(mostrar) {
    if (mostrar) {
        animadosGrid.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando animados...</div>';
    }
}

function mostrarError(mensaje) {
    animadosGrid.innerHTML = `<div class="loading-message"><i class="fas fa-exclamation-triangle"></i> ${mensaje}</div>`;
}

function renderizarAnimados(animados) {
    if (!animados || animados.length === 0) {
        animadosGrid.innerHTML = '<div class="loading-message"><i class="fas fa-star"></i> No hay animados disponibles por ahora.</div>';
        return;
    }

    animadosGrid.innerHTML = animados.map(animado => `
        <div class="animado-card" data-id="${animado.ID}">
            <div class="animado-imagen">
                <img src="${animado.Imagen || 'https://via.placeholder.com/300x200?text=Animados'}" alt="${animado.Titulo}">
            </div>
            <div class="animado-info">
                <h3 class="animado-titulo">${animado.Titulo}</h3>
                <div class="animado-detalles-card">
                    <span><i class="fas fa-calendar"></i> ${animado.Anio || 'N/A'}</span>
                    <span><i class="fas fa-list"></i> ${animado.CapitulosTotales || 0} caps</span>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.animado-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const animado = todosLosAnimados.find(a => a.ID == id);
            if (animado) abrirModal(animado);
        });
    });
}

function actualizarContador(total) {
    if (animadosCounter) {
        animadosCounter.innerHTML = `🎬 ${total} animados`;
    }
}

// ===== FILTRAR =====
function filtrarPorCategoria(categoria) {
    let filtrados = [...todosLosAnimados];
    
    switch(categoria) {
        case 'disney':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('disney'));
            break;
        case 'dreamworks':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('dreamworks'));
            break;
        case 'clasicos':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('clasico'));
            break;
        case 'aventura':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('aventura'));
            break;
        case 'comedia':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('comedia'));
            break;
        case 'educativos':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('educativo'));
            break;
        case 'proximamente':
            filtrados = filtrados.filter(a => a.Categoria?.toLowerCase().includes('proximo'));
            break;
        default:
            filtrados = [...todosLosAnimados];
    }
    
    renderizarAnimados(filtrados);
    actualizarContador(filtrados.length);
}

// ===== MODAL =====
function abrirModal(animado) {
    animadoActual = animado;
    capituloActual = 1;
    const playerArea = document.querySelector(".modal-player-area");
const contenedor = document.getElementById("animadosRelacionados");

if (animado.Destacado === "SI") {
    if (contenedor) contenedor.innerHTML = "";

    // 👇 quitar columna derecha
    if (playerArea) {
        playerArea.style.display = "block";
    }

} else {
    mostrarRelacionados();

    // 👇 volver al layout normal
    if (playerArea) {
        playerArea.style.display = "grid";
    }
}
    
    modalTitulo.textContent = animado.Titulo;
    modalSinopsis.textContent = animado.Sinopsis || 'Sin sinopsis disponible.';
    modalIdioma.textContent = animado.Idioma || 'Español';
    modalAnio.textContent = animado.Anio || 'N/A';
    modalCategoria.textContent = animado.Categoria || 'General';
    
    
    cargarCapitulo(1);
    generarListaCapítulos(animado.CapitulosTotales || 0);
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cargarCapitulo(numero) {
    if (!animadoActual) return;
    
    capituloActual = numero;
    
    let embedUrl = (animadoActual.EmbedUrl || '').trim();
    
    if (!embedUrl) {
        videoIframe.src = '';
        return;
    }
    
    console.log('URL original:', embedUrl);

    const urlConvertida = convertirURLYouTube(embedUrl);

    console.log('URL convertida:', urlConvertida);

    videoIframe.src = urlConvertida + "?rel=0&modestbranding=1";
}

function convertirURLYouTube(url) {
    if (!url) return '';
    url = url.trim();

    // Si viene iframe, extraer src
    if (url.includes('<iframe')) {
        const match = url.match(/src="([^"]+)"/);
        if (match) url = match[1];
    }

    // YouTube watch
    if (url.includes('youtube.com/watch?v=')) {
    let id = url.split('v=')[1];

    if (!id) return '';

    id = id.split('&')[0];
    id = id.split('#')[0];
    id = id.trim();

    return `https://www.youtube.com/embed/${id}`;
}

    if (url.includes('youtu.be/')) {
    let id = url.split('youtu.be/')[1];

    if (!id) return '';

    id = id.split('?')[0];
    id = id.split('&')[0];
    id = id.trim();

    return `https://www.youtube.com/embed/${id}`;
}

    // YouTube embed
    if (url.includes('youtube.com/embed/')) {
        return url;
    }

    // Vimeo
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
        let id = url.split('vimeo.com/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
    }

    // Vimeo embed
    if (url.includes('player.vimeo.com/video/')) {
        return url;
    }

    // Dailymotion
    if (url.includes('dailymotion.com/video/')) {
        let id = url.split('/video/')[1];
        if (id.includes('_')) id = id.split('_')[0];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://www.dailymotion.com/embed/video/${id}`;
    }

    // Google Drive
    if (url.includes('drive.google.com/file/d/')) {
        let id = url.split('/file/d/')[1];
        if (id.includes('/')) id = id.split('/')[0];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://drive.google.com/file/d/${id}/preview`;
    }

    return url;
}

function generarListaCapítulos(total) {
    if (!capitulosLista) return;
    
    if (total === 0) {
        capitulosLista.innerHTML = '<div class="cap-boton" style="cursor: default;">Sin capítulos</div>';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= total; i++) {
        html += `<button class="cap-boton" data-cap="${i}">🎬 Capítulo ${i}</button>`;
    }
    capitulosLista.innerHTML = html;
    
    document.querySelectorAll('.cap-boton').forEach(btn => {
        if (btn.dataset.cap) {
            btn.addEventListener('click', () => {
                const cap = parseInt(btn.dataset.cap);
                cargarCapitulo(cap);
            });
        }
    });
    
    const primerBoton = document.querySelector('.cap-boton[data-cap="1"]');
    if (primerBoton) primerBoton.classList.add('active');
}

function cerrarModal() {
    modalOverlay.classList.remove('active');
    videoIframe.src = '';
    animadoActual = null;
    document.body.style.overflow = '';
}

// ===== MENÚ MÓVIL =====
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

function cerrarMobileMenu() {
    mobileMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    cargarAnimados();
    configurarCarruselDestacados();
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.dataset.category;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrarPorCategoria(categoria);
        });
    });
    
    document.querySelectorAll('.mobile-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.dataset.category;
            document.querySelectorAll('.mobile-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrarPorCategoria(categoria);
            cerrarMobileMenu();
        });
    });
    
    if (menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);
    if (closeMenu) closeMenu.addEventListener('click', cerrarMobileMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', cerrarMobileMenu);
    if (closeModal) closeModal.addEventListener('click', cerrarModal);
    
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) cerrarModal();
    });
    
    if (capAnteriorBtn) {
        capAnteriorBtn.addEventListener('click', () => {
            if (animadoActual && capituloActual > 1) {
                cargarCapitulo(capituloActual - 1);
            }
        });
    }
    
    if (capSiguienteBtn) {
        capSiguienteBtn.addEventListener('click', () => {
            if (animadoActual && capituloActual < (animadoActual.CapitulosTotales || 0)) {
                cargarCapitulo(capituloActual + 1);
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarMobileMenu();
        }
    });

    // ===== CATEGORÍAS Y SUBCATEGORÍAS =====
    const categoriasData = {
        disney: ['Clásicos Disney', 'Pixar', 'Disney Channel'],
        cartoon: ['Cartoon Network', 'Nickelodeon', 'Hanna-Barbera'],
        anime: ['Shonen', 'Shojo', 'Seinen', 'Studio Ghibli'],
        marvel: ['Spider-Man', 'Avengers', 'X-Men', 'Guardianes']
    };

    const catPrincipales = document.querySelectorAll('.cat-principal-btn');
    const subcategoriasContainer = document.getElementById('subcategorias-container');

    function mostrarSubcategorias(categoria) {
        const subcategorias = categoriasData[categoria];
        if (subcategorias && subcategorias.length > 0) {
            subcategoriasContainer.style.display = 'flex';
            subcategoriasContainer.innerHTML = subcategorias.map(sub => `
                <button class="subcat-btn" data-subcat="${sub.toLowerCase().replace(/ /g, '_')}">${sub}</button>
            `).join('');
            
            document.querySelectorAll('.subcat-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.subcat-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const subcategoria = btn.dataset.subcat;
                    filtrarPorSubcategoria(subcategoria);
                });
            });
        } else {
            subcategoriasContainer.style.display = 'none';
            filtrarPorCategoriaPrincipal(categoria);
        }
    }

    function filtrarPorCategoriaPrincipal(categoria) {
        let filtrados = todosLosAnimados.filter(a => a.Categoria?.toLowerCase() === categoria);
        renderizarAnimados(filtrados);
        actualizarContador(filtrados.length);
    }

    function filtrarPorSubcategoria(subcategoria) {
        let filtrados = todosLosAnimados.filter(a => a.Subcategoria?.toLowerCase().replace(/ /g, '_') === subcategoria);
        renderizarAnimados(filtrados);
        actualizarContador(filtrados.length);
    }

    catPrincipales.forEach(btn => {
        btn.addEventListener('click', () => {
            catPrincipales.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const categoria = btn.dataset.cat;
            mostrarSubcategorias(categoria);
        });
    });
});

// ===== RENDERIZAR DESTACADOS (CIRCULARES) =====
function renderizarDestacados(destacados) {
    const contenedor = document.getElementById('destacadosCarousel');
    if (!contenedor) return;
    
    if (!destacados || destacados.length === 0) {
        contenedor.innerHTML = '<div class="loading-message"><i class="fas fa-star"></i> No hay destacados por ahora</div>';
        return;
    }
    
    contenedor.innerHTML = destacados.map(animado => `
        <div class="destacado-card" data-id="${animado.ID}">
            <div class="destacado-imagen">
                <img src="${animado.Imagen || 'https://via.placeholder.com/100x100?text=Animado'}" alt="${animado.Titulo}">
            </div>
            <div class="destacado-titulo">${animado.Titulo}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.destacado-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const animado = todosLosAnimados.find(a => a.ID == id);
            if (animado) abrirModal(animado);
        });
    });
}

// ===== FUNCIONES PARA EL CARRUSEL DE DESTACADOS =====
function configurarCarruselDestacados() {
    const carousel = document.getElementById('destacadosCarousel');
    const prevBtn = document.getElementById('destacadosPrev');
    const nextBtn = document.getElementById('destacadosNext');
    
    if (!carousel || !prevBtn || !nextBtn) return;
    
    prevBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        carousel.scrollBy({ left: 200, behavior: 'smooth' });
    });
}

function mostrarRelacionados() {
    const contenedor = document.getElementById("animadosRelacionados");

    if (!contenedor) return;

    contenedor.innerHTML = todosLosAnimados.map(a => `
       <div class="rel-card" data-id="${a.ID}">
            <img src="${a.Imagen}">
            <p>${a.Titulo}</p>
       </div>
    `).join("");

    // 👇 ESTO VA DENTRO, NO FUERA
    contenedor.querySelectorAll(".rel-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.dataset.id;
            const seleccionado = todosLosAnimados.find(a => a.ID == id);

            if (seleccionado) {
                animadoActual = seleccionado;

                const urlConvertida = convertirURLYouTube(seleccionado.EmbedUrl || "");
                videoIframe.src = urlConvertida + "?rel=0&modestbranding=1";
            }
        });
    });
}