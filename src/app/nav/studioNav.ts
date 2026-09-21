/**
 * Menú del hub Pink Purple Studio.
 * Agregar una herramienta = un item aquí (sin tocar el layout).
 */

export type NavItem = {
  id: string;
  label: string;
  to?: string;
  icon: string;
  end?: boolean;
  /** false = bloque “Próximamente” (no navegable). */
  enabled?: boolean;
  children?: NavItem[];
};

export const STUDIO_NAV: NavItem[] = [
  {
    id: 'perfil',
    label: 'Perfil',
    to: '/app',
    icon: '◎',
    end: true,
    enabled: true,
  },
  {
    id: 'seo',
    label: 'Pink Purple SEO',
    to: '/app/seo',
    icon: '✦',
    enabled: true,
    children: [
      { id: 'seo-proyectos', label: 'Proyectos', to: '/app/seo/proyectos', icon: '🗂', enabled: true },
      { id: 'seo-generar', label: 'Generar', to: '/app/seo/generar', icon: '✨', enabled: true },
      { id: 'seo-historial', label: 'Historial', to: '/app/seo/historial', icon: '🕓', enabled: true },
      { id: 'seo-conexiones', label: 'Conexiones', to: '/app/seo/conexiones', icon: '🔌', enabled: true },
    ],
  },
  {
    id: 'config',
    label: 'Configuración',
    to: '/app/configuracion',
    icon: '⚙',
    enabled: true,
    children: [
      {
        id: 'config-plan',
        label: 'Plan y facturación',
        to: '/app/configuracion/plan',
        icon: '💳',
        enabled: true,
      },
    ],
  },
  {
    id: 'soon-ads',
    label: 'Pink Purple Ads',
    icon: '◈',
    enabled: false,
  },
];

export function pathMatchesItem(pathname: string, item: NavItem): boolean {
  if (!item.to) return false;
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export function isGroupActive(pathname: string, item: NavItem): boolean {
  if (pathMatchesItem(pathname, item)) return true;
  return (item.children || []).some((child) => pathMatchesItem(pathname, child));
}
