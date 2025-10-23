import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { topLevel, submenus, visibilityByRole, Role, normalizeRoles } from '../config/menu';

type SideNavProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const MODULE_TO_PATH: Record<string, string> = {
  'Inicio': '/inicio',
  'CRM': '/crm',
  'Estudio': '/estudio',
  'Label': '/label',
  'Eventos': '/eventos',
  'Escuela': '/escuela',
  'Finanzas': '/finanzas',
  'Operación': '/operacion',
  'Configuración': '/configuracion',
  'Insights': '/insights'
};

const SUBPATH_OVERRIDES: Record<string, Record<string, string>> = {
  'Estudio': { 'Salas y recursos': '/estudio/salas', 'Órdenes': '/estudio/ordenes' },
  'Label': { 'Tracks y assets': '/label/tracks' },
  'Eventos': { 'Fechas y tours': '/eventos/fechas-y-tours', 'Post-mortem': '/eventos/post-mortem' },
  'Escuela': {
    'Profesores': '/escuela/profesores',
    'Clases': '/escuela/clases',
    'Trial Lessons': '/escuela/trial-lessons',
    'Trial Queue': '/escuela/trial-queue'
  },
  'Finanzas': { 'Regalías': '/finanzas/regalias' },
  'Operación': {
    'Reservas de equipo': '/operacion/reservas-equipo',
    'Paquetes': '/operacion/paquetes'
  },
  'Configuración': {
    'Roles y permisos': '/configuracion/roles-permisos',
    'Impuestos y series': '/configuracion/impuestos-series',
    'Unidades de negocio': '/configuracion/unidades-negocio',
    'Sedes': '/configuracion/sedes',
    'Marcas': '/configuracion/marcas',
    'Integraciones': '/configuracion/integraciones',
    'Preferencias': '/configuracion/preferencias'
  }
};

function slugify(label: string) {
  return label
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function collectVisibility(roles: Role[]) {
  return roles.flatMap(role => visibilityByRole[role] ?? []);
}

function canSeeModule(roles: Role[], moduleName: string) {
  if (moduleName === 'Inicio') return true;
  const visibility = collectVisibility(roles);
  if (visibility.includes('*')) return true;
  return visibility.some(entry => typeof entry === 'string' && (entry === moduleName || entry.startsWith(`${moduleName}.`)));
}

function buildInitialExpandedState() {
  const initial: Record<string, boolean> = {};
  for (const moduleName of topLevel) {
    initial[moduleName] = false;
  }
  return initial;
}

function allowedSubmenus(roles: Role[], moduleName: string) {
  const all = submenus[moduleName] || [];
  if (all.length === 0) return all;

  const visibility = collectVisibility(roles);
  if (visibility.includes('*') || visibility.includes(moduleName)) {
    return all;
  }

  const allowedTokens = visibility
    .filter(entry => typeof entry === 'string' && entry.startsWith(`${moduleName}.`))
    .map(entry => entry.split('.', 2)[1]);

  if (allowedTokens.length === 0) {
    return all;
  }

  const allowed = new Set(allowedTokens);
  return all.filter(label => allowed.has(label));
}

export default function SideNav({ collapsed, onToggle }: SideNavProps) {
  const { user } = useAuth();
  const roles = normalizeRoles(user?.roles);
  const modulesId = React.useId();

  const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>(
    () => buildInitialExpandedState()
  );

  React.useEffect(() => {
    if (!collapsed) return;
    setExpandedModules(buildInitialExpandedState());
  }, [collapsed]);

  const handleToggleModule = React.useCallback((moduleName: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  }, []);

  return (
    <aside
      className={`side-nav${collapsed ? ' is-collapsed' : ''}`}
      aria-label="Áreas principales"
    >
      <button
        type="button"
        className="side-nav__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={modulesId}
        aria-label="Alternar menú principal"
      >
        <span className="side-nav__toggle-icon" aria-hidden="true">
          {collapsed ? '☰' : '✕'}
        </span>
        <span className="side-nav__toggle-text">Menú</span>
      </button>
      <div id={modulesId} className="side-nav__modules" hidden={collapsed}>
        {topLevel.map(moduleName => {
          const basePath = MODULE_TO_PATH[moduleName];
          if (!basePath) return null;
          if (!canSeeModule(roles, moduleName)) return null;
          const subs = allowedSubmenus(roles, moduleName);
          const isExpanded = Boolean(expandedModules[moduleName]);
          const submenuId = `${modulesId}-${slugify(moduleName)}`;

          return (
            <div
              key={moduleName}
              className={`side-nav__module${isExpanded ? ' is-open' : ''}`}
            >
              <div className="side-nav__module-header">
                <NavLink
                  to={basePath}
                  className={({ isActive }) => `side-nav__module-link${isActive ? ' is-active' : ''}`}
                >
                  {moduleName}
                </NavLink>
                {subs.length > 0 && (
                  <button
                    type="button"
                    className="side-nav__module-toggle"
                    onClick={() => handleToggleModule(moduleName)}
                    aria-expanded={isExpanded}
                    aria-controls={submenuId}
                  >
                    <span className="side-nav__module-toggle-icon" aria-hidden="true">
                      {isExpanded ? '▾' : '▸'}
                    </span>
                    <span className="sr-only">
                      {isExpanded ? 'Ocultar' : 'Mostrar'} {moduleName}
                    </span>
                  </button>
                )}
              </div>
              {subs.length > 0 && isExpanded && (
                <ul
                  id={submenuId}
                  className="side-nav__submenu"
                >
                  {subs.map(label => {
                    const override = SUBPATH_OVERRIDES[moduleName]?.[label];
                    const href = override ?? `${basePath}/${slugify(label)}`;
                    return (
                      <li key={label}>
                        <NavLink
                          to={href}
                          className={({ isActive }) => `side-nav__sublink${isActive ? ' is-active' : ''}`}
                        >
                          {label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
