import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { topLevel, submenus, visibilityByRole, Role } from '../config/menu';

type User = { id: string; roles: Role[] };

// TODO: reemplazar por hook/auth real
function useCurrentUser(): User | null {
  return { id: 'demo', roles: ['admin'] };
}

const MODULE_TO_PATH: Record<string, string> = {
  'Inicio': '/inicio',
  'CRM': '/crm',
  'Estudio': '/estudio',
  'Label': '/label',
  'Eventos': '/eventos',
  'Escuela': '/escuela',
  'Finanzas': '/finanzas',
  'Operación': '/operacion'
};

// Overrides de subrutas con nombres especiales
const SUBPATH_OVERRIDES: Record<string, Record<string, string>> = {
  'Label': { 'Tracks y assets': '/label/tracks' },
  'Estudio': { 'Salas y recursos': '/estudio/salas', 'Órdenes': '/estudio/ordenes' },
  'Eventos': { 'Fechas y tours': '/eventos/fechas-y-tours', 'Post-mortem': '/eventos/post-mortem' }
};

function slugify(label: string) {
  return label
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function canSeeModule(user: User, moduleName: string) {
  const vis = user.roles.flatMap(r => visibilityByRole[r] ?? []);
  if (vis.includes('*')) return true;
  const allowModule = vis.some(v => typeof v === 'string' && (v === moduleName || (v as string).startsWith(moduleName + '.')));
  return allowModule;
}

function allowedSubmenus(user: User, moduleName: string) {
  const all = submenus[moduleName] || [];
  const vis = user.roles.flatMap(r => visibilityByRole[r] ?? []);
  if (vis.includes('*') || vis.includes(moduleName)) return all;
  const allowedTokens = new Set(
    vis
      .filter(v => typeof v === 'string' && (v as string).startsWith(moduleName + '.'))
      .map(v => (v as string).split('.', 2)[1])
  );
  return all.filter(s => allowedTokens.has(s) || allowedTokens.size === 0);
}

export default function SideNav() {
  const user = useCurrentUser();
  const loc = useLocation();
  if (!user) return null;

  return (
    <aside style={{ width: 260, borderRight: '1px solid #eee', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {topLevel.map(mod => {
        const base = MODULE_TO_PATH[mod];
        if (!base) return null;
        if (mod !== 'Inicio' && !canSeeModule(user, mod)) return null;
        const subs = submenus[mod] || [];

        return (
          <div key={mod} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13, textTransform: 'uppercase', margin: '8px 0' }}>
              <NavLink to={base} style={({ isActive }) => ({ color: isActive ? '#111' : '#333', textDecoration: 'none' })}>
                {mod}
              </NavLink>
            </div>
            {subs.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {allowedSubmenus(user, mod).map(sub => {
                  const override = SUBPATH_OVERRIDES[mod]?.[sub];
                  const href = override ?? `${base}/${slugify(sub)}`;
                  return (
                    <li key={sub}>
                      <NavLink
                        to={href}
                        style={({ isActive }) => ({
                          color: isActive ? '#000' : '#555',
                          textDecoration: 'none',
                          fontSize: 14
                        })}
                      >
                        {sub}
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
