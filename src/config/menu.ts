export type Role =
  | 'admin' | 'finanzas' | 'booker' | 'ingeniero' | 'productor'
  | 'artista' | 'profesor' | 'estudiante' | 'promotor';

export const topLevel = ["Inicio","CRM","Estudio","Label","Eventos","Escuela","Finanzas","Operación"] as const;

export const submenus: Record<string, string[]> = {
  "CRM": ["Contactos","Empresas","Leads"],
  "Estudio": ["Calendario","Salas y recursos","Órdenes","Pipelines","Reportes"],
  "Label": ["Artistas","Proyectos","Releases","Tracks y assets","Contratos","Regalías","Marketing"],
  "Eventos": ["Agenda","Fechas y tours","Venues","Staff","Presupuestos","Post-mortem"],
  "Escuela": ["Programas","Cursos","Cohortes","Estudiantes","Inscripciones","Pagos"],
  "Finanzas": ["Cotizaciones","Facturas","Cobros","Regalías"],
  "Operación": ["Inventario","Reservas de equipo","Mantenimiento","Paquetes"]
};

export const visibilityByRole: Record<Role, (string | "*")[]> = {
  admin: ["*"],
  finanzas: ["Finanzas","Label.Regalías","Estudio.Órdenes","Estudio.Reportes","Eventos.Presupuestos","CRM","Insights"],
  booker: ["Estudio","CRM","Operación.Reservas de equipo","Operación.Paquetes","Finanzas.Cotizaciones"],
  ingeniero: ["Estudio","Operación","CRM","Label"],
  productor: ["Estudio","Label","Eventos","CRM"],
  artista: ["Label.Contratos","Label.Releases","Label.Tracks y assets","Label.Regalías","Estudio.Calendario","Eventos.Fechas y tours"],
  profesor: ["Escuela","Estudio.Calendario","CRM"],
  estudiante: ["Escuela.Cursos","Escuela.Inscripciones","Escuela.Pagos"],
  promotor: ["Eventos","CRM","Label.Artistas","Operación.Reservas de equipo"]
};

export const quickCreate: Record<Role, string[]> = {
  admin: ["Contacto","Booking","Evento","Curso","Factura","Cotización","Equipo"],
  finanzas: ["Cotización","Factura","Cobro","Liquidación de regalías","Serie de facturación"],
  booker: ["Booking","Orden de servicio","Bloqueo de sala","Paquete","Contacto"],
  ingeniero: ["Parte de mantenimiento","Checklist de sesión","Solicitud de equipo","Nota técnica"],
  productor: ["Proyecto","Release","Reserva de sala","Asignación de staff","Solicitud de assets"],
  artista: ["Solicitud de sesión","Cargar assets","Actualizar datos bancarios"],
  profesor: ["Clase de curso","Evaluación","Material didáctico"],
  estudiante: ["Inscripción","Pago","Ticket de soporte"],
  promotor: ["Evento","Fecha de tour","Venue","Staff"]
};
