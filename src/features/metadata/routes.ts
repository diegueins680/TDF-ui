// Metadata routes scaffold used to wire upcoming metadata manager screens
export const METADATA_ROUTES = {
  base: '/configuracion/metadata',
  list: '/configuracion/metadata',
  detail: (id: string | number) => `/configuracion/metadata/${id}`
};
