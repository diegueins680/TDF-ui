import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

export type Role =
  | 'admin' | 'finanzas' | 'booker' | 'ingeniero' | 'productor'
  | 'artista' | 'profesor' | 'estudiante' | 'promotor';

export interface User { id: string; roles: Role[]; }

function useCurrentUser(): User | null {
  // TODO: Reemplazar por tu hook real (auth).
  return { id: 'demo', roles: ['admin'] };
}

function RequireRole(props: { allowed: '*' | Role[]; children: React.ReactNode }) {
  const { allowed, children } = props;
  const user = useCurrentUser();
  if (!user) return <Navigate to="/inicio" replace />;
  if (allowed === '*') return <>{children}</>;
  if (user.roles.some(r => (allowed as Role[]).includes(r))) return <>{children}</>;
  return <Navigate to="/inicio" replace />;
}

function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12 }}>
        <strong>TDF</strong>
        <select aria-label="Unidad" style={{ marginLeft: 'auto' }}>
          <option>Unidad A</option>
          <option>Unidad B</option>
        </select>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

function Page(props: { title: string }) {
  return <div style={{ padding: 24 }}><h1>{props.title}</h1><p>Placeholder</p></div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Aliases */}
      <Route path="/parties" element={<Navigate to="/crm/contactos" replace />} />
      <Route path="/bookings" element={<Navigate to="/estudio/calendario" replace />} />
      <Route path="/pipelines" element={<Navigate to="/estudio/pipelines" replace />} />
      <Route path="/contactos" element={<Navigate to="/crm/contactos" replace />} />

      <Route element={<Layout />}>
        <Route path="/inicio" element={<Page title="Inicio" />} />

        <Route
          path="/crm"
          element={<RequireRole allowed={['admin','finanzas','booker','ingeniero','productor','profesor','promotor']}><Outlet /></RequireRole>}
        >
          <Route path="contactos" element={<Page title="CRM / Contactos" />} />
          <Route path="empresas" element={<Page title="CRM / Empresas" />} />
          <Route path="leads" element={<Page title="CRM / Leads" />} />
          <Route index element={<Navigate to="contactos" replace />} />
        </Route>

        <Route
          path="/estudio"
          element={<RequireRole allowed={['admin','booker','ingeniero','productor','finanzas']}><Outlet /></RequireRole>}
        >
          <Route path="calendario" element={<Page title="Estudio / Calendario" />} />
          <Route path="salas" element={<Page title="Estudio / Salas y recursos" />} />
          <Route path="ordenes" element={<Page title="Estudio / Órdenes (OS)" />} />
          <Route path="pipelines" element={<Page title="Estudio / Pipelines (Producción)" />} />
          <Route path="reportes" element={<Page title="Estudio / Reportes" />} />
          <Route index element={<Navigate to="calendario" replace />} />
        </Route>

        <Route
          path="/label"
          element={<RequireRole allowed={['admin','productor','finanzas','artista','ingeniero']}><Outlet /></RequireRole>}
        >
          <Route path="artistas" element={<Page title="Label / Artistas" />} />
          <Route path="proyectos" element={<Page title="Label / Proyectos" />} />
          <Route path="releases" element={<Page title="Label / Releases" />} />
          <Route path="tracks" element={<Page title="Label / Tracks" />} />
          <Route path="assets" element={<Page title="Label / Assets" />} />
          <Route path="contratos" element={<Page title="Label / Contratos" />} />
          <Route path="regalias" element={<Page title="Label / Regalías" />} />
          <Route path="marketing" element={<Page title="Label / Marketing" />} />
          <Route index element={<Navigate to="artistas" replace />} />
        </Route>

        <Route
          path="/eventos"
          element={<RequireRole allowed={['admin','promotor','productor','finanzas']}><Outlet /></RequireRole>}
        >
          <Route path="agenda" element={<Page title="Eventos / Agenda" />} />
          <Route path="fechas-y-tours" element={<Page title="Eventos / Fechas y tours" />} />
          <Route path="venues" element={<Page title="Eventos / Venues" />} />
          <Route path="staff" element={<Page title="Eventos / Staff" />} />
          <Route path="presupuestos" element={<Page title="Eventos / Presupuestos" />} />
          <Route path="post-mortem" element={<Page title="Eventos / Post-mortem" />} />
          <Route index element={<Navigate to="agenda" replace />} />
        </Route>

        <Route
          path="/escuela"
          element={<RequireRole allowed={['admin','profesor','estudiante','finanzas']}><Outlet /></RequireRole>}
        >
          <Route path="programas" element={<Page title="Escuela / Programas" />} />
          <Route path="cursos" element={<Page title="Escuela / Cursos" />} />
          <Route path="cohortes" element={<Page title="Escuela / Cohortes" />} />
          <Route path="estudiantes" element={<Page title="Escuela / Estudiantes" />} />
          <Route path="inscripciones" element={<Page title="Escuela / Inscripciones" />} />
          <Route path="pagos" element={<Page title="Escuela / Pagos" />} />
          <Route index element={<Navigate to="cursos" replace />} />
        </Route>

        <Route
          path="/finanzas"
          element={<RequireRole allowed={['admin','finanzas']}><Outlet /></RequireRole>}
        >
          <Route path="cotizaciones" element={<Page title="Finanzas / Cotizaciones" />} />
          <Route path="facturas" element={<Page title="Finanzas / Facturas" />} />
          <Route path="cobros" element={<Page title="Finanzas / Cobros" />} />
          <Route path="regalias" element={<Page title="Finanzas / Regalías (liquidaciones)" />} />
          <Route index element={<Navigate to="cotizaciones" replace />} />
        </Route>

        <Route
          path="/operacion"
          element={<RequireRole allowed={['admin','booker','ingeniero','productor','promotor']}><Outlet /></RequireRole>}
        >
          <Route path="inventario" element={<Page title="Operación / Inventario" />} />
          <Route path="reservas-equipo" element={<Page title="Operación / Reservas de equipo" />} />
          <Route path="mantenimiento" element={<Page title="Operación / Mantenimiento" />} />
          <Route path="paquetes" element={<Page title="Operación / Paquetes" />} />
          <Route index element={<Navigate to="inventario" replace />} />
        </Route>

        <Route
          path="/configuracion"
          element={<RequireRole allowed={['admin']}><Outlet /></RequireRole>}
        >
          <Route path="roles-permisos" element={<Page title="Configuración / Roles y permisos" />} />
          <Route path="impuestos-series" element={<Page title="Configuración / Impuestos y series" />} />
          <Route path="unidades-negocio" element={<Page title="Configuración / Unidades de negocio" />} />
          <Route path="sedes" element={<Page title="Configuración / Sedes" />} />
          <Route path="marcas" element={<Page title="Configuración / Marcas" />} />
          <Route path="integraciones" element={<Page title="Configuración / Integraciones" />} />
          <Route path="preferencias" element={<Page title="Configuración / Preferencias" />} />
          <Route index element={<Navigate to="roles-permisos" replace />} />
        </Route>

        <Route
          path="/insights"
          element={<RequireRole allowed={['admin','finanzas','booker','ingeniero','productor','profesor','promotor']}><Page title="Insights" /></RequireRole>}
        />
      </Route>

      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}
