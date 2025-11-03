// Metadata routes scaffold used to wire upcoming metadata manager screens
export const METADATA_ROUTES = {
  base: '/metadata',
  list: '/metadata',
  detail: (id: string | number) => `/metadata/${id}`
};
