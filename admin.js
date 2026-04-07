// ===== CONFIGURACIÓN ADMIN =====
let ADMIN_PASSWORD = '';
let adminAutenticado = false;
let todosLosAnimadosAdmin = [];

// ===== DOM ELEMENTS ADMIN =====
const adminBtn = document.getElementById('adminBtn');
const adminModalOverlay = document.getElementById('adminModalOverlay');
const adminCerrar = document.getElementById('adminCerrar');
const adminLoginPanel = document.getElementById('adminLoginPanel');
const adminGestionPanel = document.getElementById('adminGestionPanel');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');

// ===== MOSTRAR MODAL ADMIN =====
function mostrarModalAdmin() {
    adminModalOverlay.classList.add('active');
    adminPasswordInput.value = '';
    adminLoginPanel.style.display = 'block';
    adminGestionPanel.style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function cerrarModalAdmin() {
    adminModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    adminAutenticado = false;
}

// ===== OBTENER CONTRASEÑA DESDE SHEETS =====
async function cargarPasswordAdmin() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        if (data.success && data.data && data.data[0]) {
            ADMIN_PASSWORD = data.data[0].AdminPassword || '';
        } else {
            ADMIN_PASSWORD = '';
        }
    } catch (error) {
        ADMIN_PASSWORD = '';
    }
}

// ===== VERIFICAR CONTRASEÑA =====
async function verificarAdmin() {
    const pass = adminPasswordInput.value;
    await cargarPasswordAdmin();
    if (pass === ADMIN_PASSWORD) {
        adminAutenticado = true;
        adminLoginPanel.style.display = 'none';
        cargarPanelGestion();
    } else {
        alert('❌ Contraseña incorrecta');
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
}

// ===== CARGAR PANEL DE GESTIÓN =====
async function cargarPanelGestion() {
    adminGestionPanel.style.display = 'block';
    await cargarAnimadosAdmin();
    renderizarPanelGestion();
}

// ===== CARGAR ANIMADOS DESDE SHEETS =====
async function cargarAnimadosAdmin() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        if (data.success && data.data) {
            todosLosAnimadosAdmin = data.data;
        } else {
            todosLosAnimadosAdmin = [];
        }
    } catch (error) {
        todosLosAnimadosAdmin = [];
    }
}

// ===== RENDERIZAR PANEL ADMIN =====
function renderizarPanelGestion() {
    adminGestionPanel.innerHTML = `
        <h2>📋 GESTIÓN DE ANIMADOS</h2>
        
        <div style="margin-bottom: 30px; padding: 15px; background: #f0f0f0; border-radius: 20px;">
            <h3 style="color: #ff9800;">➕ Agregar nuevo animado</h3>
            <form id="formAgregarAnimado">
                <input type="text" id="nuevoId" placeholder="ID (ej: 1, 2, 3...)" required>
                <input type="text" id="nuevoTitulo" placeholder="Título" required>
                <input type="text" id="nuevoCategoria" placeholder="Categoría (disney, cartoon, anime, marvel)" required>
                <input type="text" id="nuevoSubcategoria" placeholder="Subcategoría (clásicos_disney, pixar, etc)" required>
                <input type="text" id="nuevoAnio" placeholder="Año" required>
                <input type="url" id="nuevaImagen" placeholder="URL de la imagen" required>
                <input type="url" id="nuevoEmbedUrl" placeholder="URL del video (embed)" required>
                <select id="nuevoDestacado">
                    <option value="SI">Sí (aparece en destacados)</option>
                    <option value="">No (no aparece en destacados)</option>
                </select>
                <button type="submit">💾 Guardar animado</button>
            </form>
        </div>
        
        <div>
            <h3 style="color: #ff9800;">📚 Animados existentes</h3>
            <div id="listaAnimadosAdmin" style="max-height: 400px; overflow-y: auto;">
                ${renderizarListaAnimadosAdmin()}
            </div>
        </div>
        
        <button onclick="cerrarModalAdmin()" style="margin-top: 20px; background: #ff9800; color: white; padding: 10px; border: none; border-radius: 20px;">Cerrar</button>
    `;
    
    document.getElementById('formAgregarAnimado').addEventListener('submit', agregarAnimado);
}

function renderizarListaAnimadosAdmin() {
    if (todosLosAnimadosAdmin.length === 0) {
        return '<p>No hay animados cargados.</p>';
    }
    
    return todosLosAnimadosAdmin.map(animado => `
        <div style="background: #f9f9f9; border-radius: 15px; padding: 12px; margin-bottom: 10px; border-left: 5px solid #ff9800;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <strong style="color: #2196f3;">${animado.Titulo}</strong><br>
                    <small>${animado.Categoria} · ${animado.Subcategoria} · ${animado.Anio}</small>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editarAnimado('${animado.ID}')" style="background: #4caf50; color: white; padding: 5px 12px; border-radius: 20px; border: none;">✏️ Editar</button>
                    <button onclick="eliminarAnimado('${animado.ID}')" style="background: #f44336; color: white; padding: 5px 12px; border-radius: 20px; border: none;">🗑️ Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== AGREGAR ANIMADO =====
async function agregarAnimado(e) {
    e.preventDefault();

    if (document.getElementById('formAgregarAnimado').dataset.editId) {
        console.log('⛔ Bloqueado agregar porque está en modo edición');
        return;
    }

    console.log('🔥 AGREGAR ejecutado');

    const nuevoAnimado = {
        action: 'agregar',
        ID: document.getElementById('nuevoId').value,
        Titulo: document.getElementById('nuevoTitulo').value,
        Categoria: document.getElementById('nuevoCategoria').value,
        Subcategoria: document.getElementById('nuevoSubcategoria').value,
        Anio: document.getElementById('nuevoAnio').value,
        Imagen: document.getElementById('nuevaImagen').value,
        EmbedUrl: document.getElementById('nuevoEmbedUrl').value,
        Destacado: document.getElementById('nuevoDestacado').value,
        AdminPassword: 'admin123'
    };
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(nuevoAnimado)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Animado agregado correctamente');
            document.getElementById('formAgregarAnimado').reset();
            await cargarAnimadosAdmin();
            renderizarPanelGestion();
            if (typeof cargarAnimados === 'function') cargarAnimados();
        } else {
            alert('❌ Error al agregar');
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error de conexión');
    }
}

// ===== EDITAR Y ELIMINAR =====
function editarAnimado(id) {
    const animado = todosLosAnimadosAdmin.find(a => a.ID == id);
    if (!animado) return;
    
    document.getElementById('nuevoId').value = animado.ID;
    document.getElementById('nuevoTitulo').value = animado.Titulo;
    document.getElementById('nuevoCategoria').value = animado.Categoria;
    document.getElementById('nuevoSubcategoria').value = animado.Subcategoria;
    document.getElementById('nuevoAnio').value = animado.Anio;
    document.getElementById('nuevaImagen').value = animado.Imagen;
    document.getElementById('nuevoEmbedUrl').value = animado.EmbedUrl;
    document.getElementById('nuevoDestacado').value = animado.Destacado || '';
    
    const btn = document.querySelector('#formAgregarAnimado button');
    btn.textContent = '✏️ Actualizar animado';
    btn.style.background = '#ff9800';
    
    document.getElementById('formAgregarAnimado').dataset.editId = id;
    document.getElementById('formAgregarAnimado').onsubmit = (e) => actualizarAnimado(e, id);
}

console.log('✏️ ACTUALIZAR ejecutado');
async function actualizarAnimado(e, id) {
    e.preventDefault();
    console.log('Buscando ID:', id);
console.log('IDs en Sheets:', todosLosAnimadosAdmin.map(a => a.ID));
    const animadoActualizado = {
        action: 'actualizar',
        ID: id,
        Titulo: document.getElementById('nuevoTitulo').value,
        Categoria: document.getElementById('nuevoCategoria').value,
        Subcategoria: document.getElementById('nuevoSubcategoria').value,
        Anio: document.getElementById('nuevoAnio').value,
        Imagen: document.getElementById('nuevaImagen').value,
        EmbedUrl: document.getElementById('nuevoEmbedUrl').value,
        Destacado: document.getElementById('nuevoDestacado').value,
        AdminPassword: 'admin123'
    };
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(animadoActualizado)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Animado actualizado correctamente');
            
            // Recargar los datos en el panel admin
            await cargarAnimadosAdmin();
            renderizarPanelGestion();
            
            // Recargar la grilla principal de la página
            if (typeof cargarAnimados === 'function') {
                await cargarAnimados();
            }
            
            // Resetear formulario
            document.getElementById('formAgregarAnimado').reset();
            const btn = document.querySelector('#formAgregarAnimado button');
            btn.textContent = '💾 Guardar animado';
            btn.style.background = '#4caf50';
            document.getElementById('formAgregarAnimado').onsubmit = agregarAnimado;
            delete document.getElementById('formAgregarAnimado').dataset.editId;
            
        } else {
            alert('❌ Error al actualizar: ' + (data.error || 'desconocido'));
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error de conexión');
    }
}

async function eliminarAnimado(id) {
    if (!confirm('¿Eliminar este animado?')) return;
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'eliminar', id: id })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('🗑️ Eliminado correctamente');
            await cargarAnimadosAdmin();
            renderizarPanelGestion();
            if (typeof cargarAnimados === 'function') cargarAnimados();
        } else {
            alert('❌ Error al eliminar');
        }
    } catch (error) {
        alert('❌ Error de conexión');
    }
}

// ===== EVENT LISTENERS ADMIN =====
if (adminBtn) adminBtn.addEventListener('click', mostrarModalAdmin);
if (adminCerrar) adminCerrar.addEventListener('click', cerrarModalAdmin);
if (adminLoginBtn) adminLoginBtn.addEventListener('click', verificarAdmin);
adminPasswordInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verificarAdmin();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModalOverlay?.classList.contains('active')) {
        cerrarModalAdmin();
    }
});


