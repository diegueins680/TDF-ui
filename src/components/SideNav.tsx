import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { topLevel, submenus, visibilityByRole, Role, normalizeRoles } from '../config/menu';

type SideNavProps = {
  collapsed?: boolean;
  onToggle?: () => void;
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
  const isCollapsed = Boolean(collapsed);
  const navClassName = `side-nav${isCollapsed ? ' is-collapsed' : ''}`;

  return (
    <aside
      id="app-side-nav"
      className={navClassName}
      aria-label="Áreas principales"
      aria-hidden={isCollapsed}
    >
      {!isCollapsed && onToggle && (
        <div className="side-nav__header">
          <button type="button" className="side-nav__dismiss" onClick={onToggle}>
            <span aria-hidden="true">✕</span>
            <span className="side-nav__dismiss-label">Cerrar</span>
          </button>
        </div>
      )}
      {topLevel.map(moduleName => {
        const basePath = MODULE_TO_PATH[moduleName];
        if (!basePath) return null;
        if (!canSeeModule(roles, moduleName)) return null;
        const subs = allowedSubmenus(roles, moduleName);

        return (
          <div key={moduleName} className="side-nav__module">
            <NavLink
              to={basePath}
              className={({ isActive }) => `side-nav__module-link${isActive ? ' is-active' : ''}`}
            >
              {moduleName}
            </NavLink>
            {subs.length > 0 && (
              <ul className="side-nav__submenu">
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
    </aside>
  );
}
