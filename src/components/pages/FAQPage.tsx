import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'General',
    question: '¿Qué es MediCitas?',
    answer: 'MediCitas es un sistema de gestión médica diseñado para agendar y administrar citas médicas, controlar jornadas de trabajo, gestionar especialistas, pacientes y diagnósticos de forma centralizada y eficiente.',
  },
  {
    category: 'General',
    question: '¿Qué navegador se recomienda para usar el sistema?',
    answer: 'Se recomienda utilizar Google Chrome, Mozilla Firefox o Microsoft Edge en su versión más reciente para obtener la mejor experiencia. También es compatible con Safari en dispositivos Apple.',
  },
  {
    category: 'Acceso',
    question: '¿Cómo puedo iniciar sesión en el sistema?',
    answer: 'Ingresa a la página de login, escribe tu correo electrónico y contraseña, y presiona "Iniciar Sesión". Si es tu primera vez, solicita tus credenciales al administrador del sistema.',
  },
  {
    category: 'Acceso',
    question: '¿Qué hago si olvidé mi contraseña?',
    answer: 'En la página de login, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico para recibir un código de verificación de 6 dígito válido por 15 minutos. Luego ingresa el código y establece una nueva contraseña.',
  },
  {
    category: 'Acceso',
    question: '¿El código de verificación por correo tiene tiempo de expiración?',
    answer: 'Sí, el código de verificación tiene una vigencia de 15 minutos. Si expira, deberás solicitar uno nuevo desde la opción "Reenviar código".',
  },
  {
    category: 'Citas',
    question: '¿Cómo agendo una nueva cita médica?',
    answer: 'Dirígete a la sección "Citas" en el menú lateral, haz clic en "Nueva Cita" y completa los campos: paciente, especialista, fecha, hora y motivo de la consulta. Confirma para registrar la cita en el sistema.',
  },
  {
    category: 'Citas',
    question: '¿Puedo modificar o cancelar una cita ya registrada?',
    answer: 'Sí, desde la sección de Citas puedes buscar la cita y utilizar las acciones de editar o eliminar. Los cambios quedan registrados en el historial de auditorías del sistema.',
  },
  {
    category: 'Citas',
    question: '¿Cómo filtro las citas por fecha o especialista?',
    answer: 'Utiliza la barra de filtros en la parte superior de la tabla de citas. Puedes filtrar por rango de fechas, especialista, paciente o estado de la cita. También puedes buscar directamente por nombre.',
  },
  {
    category: 'Jornadas',
    question: '¿Cómo planifico las jornadas de trabajo de los especialistas?',
    answer: 'En la sección "Planificación de Jornadas" selecciona el especialista, define los días de la semana, horarios de inicio y fin, y los bloques de atención. Guarda la jornada y el sistema validará que no haya conflictos de horario.',
  },
  {
    category: 'Jornadas',
    question: '¿Qué son los bloques de jornada?',
    answer: 'Los bloques son subdivisiones de la jornada laboral que definen los intervalos de tiempo disponibles para atender pacientes. Por ejemplo, una jornada de 8:00 a 12:00 puede tener bloques de 30 minutos cada uno.',
  },
  {
    category: 'Especialistas',
    question: '¿Cómo registro un nuevo especialista médico?',
    answer: 'En "Especialistas Médicos" haz clic en "Nuevo Especialista", completa la información personal, seleccione la especialidad médica, el número de licencia y la disponibilidad. El sistema validará que no exista un duplicado.',
  },
  {
    category: 'Especialistas',
    question: '¿Puedo asignar más de una especialidad a un médico?',
    answer: 'El sistema permite gestionar las especialidades médicas disponibles. Consulta con el administrador para asignar múltiples especialidades a un mismo especialista si es necesario.',
  },
  {
    category: 'Diagnósticos',
    question: '¿Cómo registro un diagnóstico para un paciente?',
    answer: 'En la sección "Control de Diagnósticos" selecciona la consulta correspondiente, ingresa el código CIE-10, la descripción del diagnóstico y las observaciones clínicas. El sistema registrará la fecha y el médico tratante automáticamente.',
  },
  {
    category: 'Diagnósticos',
    question: '¿Qué es el código CIE-10?',
    answer: 'El CIE-10 (Clasificación Internacional de Enfermedades, Décima Revisión) es un sistema codificado de clasificación de enfermedades utilizado a nivel mundial para el registro y seguimiento de diagnósticos médicos.',
  },
  {
    category: 'Usuarios',
    question: '¿Cómo creo un nuevo usuario en el sistema?',
    answer: 'Solo los administradores pueden gestionar usuarios. Dirígete a "Usuarios", haz clic en "Nuevo Usuario", completa el nombre, correo, rol (Administrador o Auxiliar) y contraseña inicial. El usuario deberá cambiar la contraseña en su primer ingreso.',
  },
  {
    category: 'Usuarios',
    question: '¿Cuáles son los roles disponibles?',
    answer: 'El sistema tiene dos roles: Administrador (acceso total a todas las secciones incluyendo gestión de usuarios y auditorías) y Auxiliar (acceso a citas, jornadas, especialistas, diagnósticos y panel de control).',
  },
  {
    category: 'Ajustes',
    question: '¿Cómo cambio el tema visual del sistema?',
    answer: 'En "Ajustes" encontrarás 14 temas disponibles (7 claros y 7 oscuros). Selecciona el que prefieras y se aplicará inmediatamente en toda la interfaz. Los cambios se guardan automáticamente.',
  },
  {
    category: 'Ajustes',
    question: '¿Puedo cambiar el tamaño de la fuente?',
    answer: 'Sí, en la sección de Ajustes puedes seleccionar entre diferentes tamaños de fuente (pequeño, mediano, grande) para adaptar la interfaz a tus necesidades de legibilidad.',
  },
  {
    category: 'Reportes',
    question: '¿Cómo genero un reporte o exporto datos?',
    answer: 'Desde cualquier tabla con datos, utiliza el botón de exportar para generar archivos en formato PDF, Excel (XLSX) o Word (DOCX). Los reportes incluyen el logo de MediCitas y los filtros aplicados.',
  },
  {
    category: 'Soporte',
    question: '¿A quién contacto si tengo un problema con el sistema?',
    answer: 'Dirígete a la sección "Help Desk" en el menú lateral. Ahí encontrarás los datos de contacto del equipo de soporte técnico para reportar incidencias o solicitar asistencia.',
  },
];

const categories = [...new Set(faqData.map((item) => item.category))];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFaqs = activeCategory
    ? faqData.filter((item) => item.category === activeCategory)
    : faqData;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Preguntas Frecuentes
        </h1>
        <p className="text-muted-foreground">
          Encuentra respuestas a las dudas más comunes sobre el uso del sistema MediCitas.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Categorías de preguntas frecuentes">
        <button
          onClick={() => setActiveCategory(null)}
          aria-pressed={!activeCategory}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
            !activeCategory
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            aria-pressed={activeCategory === cat}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ items */}
      <div className="space-y-2">
        {filteredFaqs.map((item, index) => {
          const globalIndex = faqData.indexOf(item);
          const isOpen = openIndex === globalIndex;
          return (
            <div
              key={globalIndex}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <button
                id={`faq-question-${globalIndex}`}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${globalIndex}`}
                onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <span className="font-medium text-foreground pr-4">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              {isOpen && (
                <div
                  id={`faq-answer-${globalIndex}`}
                  role="region"
                  aria-labelledby={`faq-question-${globalIndex}`}
                  className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-16 text-center text-muted-foreground">
          No se encontraron preguntas en esta categoría.
        </div>
      )}
    </div>
  );
}
