const fs = require('fs');

// ===== UTILITIES =====
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtDate(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function dateToStr(d) {
  return fmtDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function timeStr(h, m, s) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function randDate(y, m) {
  const maxD = daysInMonth(y, m);
  return new Date(y, m - 1, rand(1, maxD));
}

function getDayName(d) {
  return ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'][d.getDay()];
}

// ===== STATIC DATA =====

const MALE_NAMES = [
  'Carlos','José','Luis','Miguel','Juan','Pedro','Antonio','Francisco','Manuel',
  'Alejandro','Andrés','Rafael','Diego','Fernando','Gabriel','Roberto','Jorge',
  'Enrique','Ricardo','Eduardo','Arturo','César','Leonardo','Omar','Alberto',
  'Alfredo','Bernardo','Cristian','Daniel','David','Edwin','Elvis','Ernesto',
  'Franco','Héctor','Hugo','Jesús','Jonathan','Kevin','Leandro','Marco','Mario',
  'Néstor','Óscar','Pablo','Rubén','Sergio','Víctor','Vladimir','Yorman','Brayan',
  'Dennycker','Ender','Evelio','Ildemaro','Yerson','Yorlander','Zairo','Dario',
  'Cristopher','Emerson','Fabián','Guillermo','Hernán','Iván','Jhonny','Kerwin',
  'Luis','Manuel','Nelson','Osvaldo','Reinaldo','Samuel','Teodoro','Uriel',
  'Williams','Yeferson','Yonatan','Yulian','Zamir','Alexander','Bryant','Darwin',
  'Eduard','Elier','Enderson','Freddy','Gerson','Harold','Ismael','Jair',
  'Jhostin','Jordan','José','Kervin','Luis','Marcos','Nicolás','Oswaldo'
];

const FEMALE_NAMES = [
  'María','Carmen','Rosa','Ana','Isabel','Jessica','Jennifer','Gabriela','Patricia',
  'Claudia','Andrea','Daniela','Carolina','Cristina','Elena','Fernanda','Grecia',
  'Heidi','Iliana','Ingrid','Iraida','Jaimery','Katherine','Kenia','Lady','Laura',
  'Liseth','Lourdes','Maibel','Mailin','Mariana','Marlene','Naily','Nelly','Noraima',
  'Omaira','Oriana','Osmara','Yalimar','Yelitza','Yerlin','Yohana','Yoselin',
  'Yuleisi','Yulibeth','Zuleyma','Adriana','Beatriz','Carla','Diana','Erika',
  'Gloria','Lilia','Marta','Nancy','Sandra','Teresa','Verónica','Violeta',
  'Yessenia','Aixa','Bárbara','Carolina','Dayana','Eliana','Francisca','Geraldine',
  'Iris','Jazmín','Kirenia','Lilibeth','Mairelys','Nadielis','Odalys','Priscila',
  'Ruth','Silvia','Thalía','Ursula','Valentina','Wendy','Yanira','Zaida',
  'Ayleen','Briselda','Cindy','Dahiana','Estefanía','Fátima','Greisy','Hilda',
  'Ismely','Jenifer','Katty','Lisandro','Milagros','Norelis','Olga','Paola'
];

const LAST_NAMES = [
  'González','Rodríguez','Martínez','Hernández','López','García','Pérez','Sánchez',
  'Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Cruz','Morales','Reyes',
  'Gutiérrez','Ortega','Vargas','Castillo','Ramos','Romero','Herrera','Medina',
  'Castro','Jiménez','Ruiz','Álvarez','Mendoza','Padilla','Peña','Contreras',
  'Paredes','Rivas','Salazar','Aguirre','Rojas','Delgado','Briceño','Cordero',
  'Fuentes','Leal','Marín','Quintero','Ponce','Villanueva','Zamora','Blanco',
  'Cárdenas','Navarro','Montilla','Sequera','Pernía','Márquez','Landaeta','Soto',
  'Piñango','Casanova','Acosta','Pereira','Yánez','Trujillo','Uzcátegui','Manzano',
  'Rincón','Colina','Bravo','Camacho','Carrillo','Espinoza','Gallegos','Hidalgo',
  'Izquierdo','Lugo','Meléndez','Nieves','Ochoa','Pacheco','Quiroga','Sandoval',
  'Tovar','Valera','Vergara','Yepez','Zerpa','Alvarado','Bermúdez','Carreño',
  'Domínguez','Escalona','Figueroa','Guerra','Linares','Montenegro','Noguera','Pinto'
];

const GEO = [
  { ciudad:'San Cristóbal', estado:'Táchira', municipio:'San Cristóbal', parroquia:'San Cristóbal' },
  { ciudad:'San Cristóbal', estado:'Táchira', municipio:'San Cristóbal', parroquia:'La Concordia' },
  { ciudad:'Mérida', estado:'Mérida', municipio:'Libertador', parroquia:'Mérida' },
  { ciudad:'Mérida', estado:'Mérida', municipio:'Libertador', parroquia:'El Llano' },
  { ciudad:'Barquisimeto', estado:'Lara', municipio:'Iribarren', parroquia:'Barquisimeto' },
  { ciudad:'Barquisimeto', estado:'Lara', municipio:'Iribarren', parroquia:'Agua Viva' },
  { ciudad:'Valencia', estado:'Carabobo', municipio:'Valencia', parroquia:'Valencia' },
  { ciudad:'Valencia', estado:'Carabobo', municipio:'Valencia', parroquia:'El Socorro' },
  { ciudad:'Maracaibo', estado:'Zulia', municipio:'Maracaibo', parroquia:'Cacique Mara' },
  { ciudad:'Maracaibo', estado:'Zulia', municipio:'Maracaibo', parroquia:'Chiquinquirá' },
  { ciudad:'Caracas', estado:'Distrito Capital', municipio:'Libertador', parroquia:'El Recreo' },
  { ciudad:'Caracas', estado:'Distrito Capital', municipio:'Libertador', parroquia:'Antímano' },
  { ciudad:'Ciudad Guayana', estado:'Bolívar', municipio:'Caroní', parroquia:'Vista Hermosa' },
  { ciudad:'Ciudad Guayana', estado:'Bolívar', municipio:'Caroní', parroquia:'San Félix' },
  { ciudad:'Maturín', estado:'Monagas', municipio:'Maturín', parroquia:'Maturín' },
  { ciudad:'Maturín', estado:'Monagas', municipio:'Maturín', parroquia:'La Rita' },
  { ciudad:'Barcelona', estado:'Anzoátegui', municipio:'Simón Rodríguez', parroquia:'Barcelona' },
  { ciudad:'Barcelona', estado:'Anzoátegui', municipio:'Simón Rodríguez', parroquia:'Naricual' },
  { ciudad:'Barinas', estado:'Barinas', municipio:'Barinas', parroquia:'Barinas' },
  { ciudad:'Barinas', estado:'Barinas', municipio:'Barinas', parroquia:'San Silvestre' },
  { ciudad:'Coro', estado:'Falcón', municipio:'Miranda', parroquia:'Coro' },
  { ciudad:'Coro', estado:'Falcón', municipio:'Miranda', parroquia:'La Vela de Coro' },
  { ciudad:'Punto Fijo', estado:'Falcón', municipio:'Carirubana', parroquia:'Punto Fijo' },
  { ciudad:'Puerto Ayacucho', estado:'Amazonas', municipio:'Atures', parroquia:'Fernando de Apure' },
  { ciudad:'Tucupita', estado:'Delta Amacuro', municipio:'Tucupita', parroquia:'Tucupita' },
  { ciudad:'Ciudad Bolívar', estado:'Bolívar', municipio:'Heres', parroquia:'Ciudad Bolívar' },
  { ciudad:'Los Teques', estado:'Miranda', municipio:'Gual', parroquia:'Los Teques' },
  { ciudad:'Guanare', estado:'Portuguesa', municipio:'Guanare', parroquia:'Guanare' },
  { ciudad:'Acarigua', estado:'Portuguesa', municipio:'Paez', parroquia:'Acarigua' },
  { ciudad:'Maracay', estado:'Aragua', municipio:'Girardot', parroquia:'Maracay' },
];

const ESPECIALIDADES = [
  { nombre:'Medicina General', descripcion:'Atención médica primaria y preventiva' },
  { nombre:'Pediatría', descripcion:'Atención médica infantil y del adolescente' },
  { nombre:'Cardiología', descripcion:'Diagnóstico y tratamiento del corazón' },
  { nombre:'Dermatología', descripcion:'Enfermedades de la piel y tejidos' },
  { nombre:'Ginecología', descripcion:'Salud femenina y reproductiva' },
  { nombre:'Neurología', descripcion:'Enfermedades del sistema nervioso' },
  { nombre:'Ortopedia', descripcion:'Enfermedades del sistema musculoesquelético' },
  { nombre:'Oftalmología', descripcion:'Enfermedades de los ojos' },
  { nombre:'Otorrinolaringología', descripcion:'Enfermedades de oídos, nariz y garganta' },
  { nombre:'Urología', descripcion:'Enfermedades del sistema urinario' },
  { nombre:'Psiquiatría', descripcion:'Salud mental y trastornos psicológicos' },
  { nombre:'Endocrinología', descripcion:'Enfermedades hormonales y metabólicas' },
  { nombre:'Neumología', descripcion:'Enfermedades del sistema respiratorio' },
  { nombre:'Gastroenterología', descripcion:'Enfermedades del sistema digestivo' },
  { nombre:'Reumatología', descripcion:'Enfermedades reumáticas y autoinmunes' },
];

const ENFERMEDADES = [
  { nombre:'Hipertensión', cronica:true, descripcion:'Presión arterial elevada de forma crónica' },
  { nombre:'Diabetes Mellitus Tipo 2', cronica:true, descripcion:'Trastorno metabólico con resistencia a la insulina' },
  { nombre:'Gripe', cronica:false, descripcion:'Infección viral respiratoria aguda' },
  { nombre:'Asma', cronica:true, descripcion:'Enfermedad inflamatoria de las vías respiratorias' },
  { nombre:'Dermatitis', cronica:false, descripcion:'Inflamación de la piel con erupciones' },
  { nombre:'Gastritis', cronica:false, descripcion:'Inflamación de la mucosa gástrica' },
  { nombre:'Migraña', cronica:true, descripcion:'Cefalea intensa recurrente con aura' },
  { nombre:'Anemia', cronica:false, descripcion:'Deficiencia de hemoglobina en sangre' },
  { nombre:'Neumonía', cronica:false, descripcion:'Infección del tejido pulmonar' },
  { nombre:'COVID-19', cronica:false, descripcion:'Infección por coronavirus SARS-CoV-2' },
  { nombre:'Artritis', cronica:true, descripcion:'Inflamación de las articulaciones' },
  { nombre:'Colesterol Alto', cronica:true, descripcion:'Niveles elevados de colesterol en sangre' },
  { nombre:'Obesidad', cronica:true, descripcion:'Exceso de peso corporal por acumulación de grasa' },
  { nombre:'Ansiedad', cronica:true, descripcion:'Trastorno de ansiedad generalizada' },
  { nombre:'Depresión', cronica:true, descripcion:'Trastorno depresivo mayor' },
  { nombre:'Bronquitis', cronica:false, descripcion:'Inflamación de los bronquios' },
  { nombre:'Rinitis', cronica:true, descripcion:'Inflamación de la mucosa nasal' },
  { nombre:'Reflujo Gastroesofágico', cronica:true, descripcion:'Retroceso del ácido estomacal al esófago' },
  { nombre:'Litiasis Renal', cronica:false, descripcion:'Cálculos renales en las vías urinarias' },
  { nombre:'Hipotiroidismo', cronica:true, descripcion:'Deficiencia de hormonas tiroideas' },
  { nombre:'Insuficiencia Cardíaca', cronica:true, descripcion:'El corazón no bombea adecuadamente' },
  { nombre:'Epilepsia', cronica:true, descripcion:'Trastorno neurológico con convulsiones recurrentes' },
  { nombre:'Varicela', cronica:false, descripcion:'Enfermedad viral con erupciones cutáneas' },
  { nombre:'Conjuntivitis', cronica:false, descripcion:'Inflamación de la conjuntiva del ojo' },
  { nombre:'Otitis', cronica:false, descripcion:'Infección del oído medio' },
  { nombre:'Amigdalitis', cronica:false, descripcion:'Inflamación de las amígdalas' },
  { nombre:'Eccema', cronica:true, descripcion:'Dermatitis crónica con piel seca y picazón' },
  { nombre:'Diabetes Mellitus Tipo 1', cronica:true, descripcion:'Deficiencia de insulina de origen autoinmune' },
  { nombre:'Enfermedad Renal Crónica', cronica:true, descripcion:'Pérdida progresiva de función renal' },
  { nombre:'Fibrilación Auricular', cronica:true, descripcion:'Ritmo cardíaco irregular y rápido' },
];

const SINTOMAS = [
  { nombre:'Dolor de cabeza', descripcion:'Cefalea de intensidad variable en cualquier zona del cráneo', gravedad:'3' },
  { nombre:'Fiebre', descripcion:'Elevación de la temperatura corporal por encima de 37.5°C', gravedad:'3' },
  { nombre:'Tos', descripcion:'Expulsión reflexiva de aire de los pulmones de forma repetida', gravedad:'2' },
  { nombre:'Náuseas', descripcion:'Sensación de malestar estomacal con deseos de vomitar', gravedad:'2' },
  { nombre:'Dolor abdominal', descripcion:'Malestar o dolor en la región del abdomen', gravedad:'3' },
  { nombre:'Fatiga', descripcion:'Sensación de cansancio extremo y falta de energía', gravedad:'2' },
  { nombre:'Mareo', descripcion:'Sensación de inestabilidad o que todo gira a su alrededor', gravedad:'3' },
  { nombre:'Dolor articular', descripcion:'Malestar en las articulaciones al moverlas', gravedad:'3' },
  { nombre:'Dolor muscular', descripcion:'Contractura o molestia en los músculos del cuerpo', gravedad:'2' },
  { nombre:'Sudoración', descripcion:'Producción excesiva de sudor sin actividad física', gravedad:'2' },
  { nombre:'Pérdida de apetito', descripcion:'Disminución o ausencia del deseo de comer', gravedad:'2' },
  { nombre:'Insomnio', descripcion:'Dificultad para conciliar o mantener el sueño', gravedad:'2' },
  { nombre:'Palpitaciones', descripcion:'Sensación de latido cardíaco acelerado o irregular', gravedad:'4' },
  { nombre:'Dificultad para respirar', descripcion:'Sensación de falta de aire o disnea al realizar esfuerzos', gravedad:'4' },
  { nombre:'Hinchazón', descripcion:'Acumulación de líquido en tejidos provocando inflamación', gravedad:'3' },
  { nombre:'Dolor torácico', descripcion:'Dolor o presión en el pecho que puede irradiarse', gravedad:'5' },
  { nombre:'Vómitos', descripcion:'Expulsión del contenido gástrico por la boca', gravedad:'3' },
  { nombre:'Diarrea', descripcion:'Evacuaciones intestinales frecuentes con heces líquidas', gravedad:'2' },
  { nombre:'Estreñimiento', descripcion:'Dificultad para evacuar el intestino de forma regular', gravedad:'1' },
  { nombre:'Erupción cutánea', descripcion:'Lesiones visibles en la piel con cambio de color o textura', gravedad:'2' },
  { nombre:'Picazón', descripcion:'Sensación molesta que provoca deseo de rascarse', gravedad:'1' },
  { nombre:'Congestión nasal', descripcion:'Obstrucción o inflamación de las fosas nasales', gravedad:'2' },
  { nombre:'Secreción nasal', descripcion:'Fluido que escurre por las fosas nasales', gravedad:'1' },
  { nombre:'Dolor de garganta', descripcion:'Molestia o ardor en la garganta al tragar', gravedad:'2' },
  { nombre:'Ojos rojos', descripcion:'Enrojecimiento de la conjuntiva ocular', gravedad:'2' },
  { nombre:'Sangrado nasal', descripcion:'Flujo de sangre por las fosas nasales', gravedad:'3' },
  { nombre:'Hormigueo', descripcion:'Sensación de pinchazos o entumecimiento en extremidades', gravedad:'2' },
  { nombre:'Pérdida de peso', descripcion:'Disminución involuntaria del peso corporal', gravedad:'3' },
  { nombre:'Aumento de peso', descripcion:'Incremento rápido e inesperado del peso corporal', gravedad:'2' },
  { nombre:'Boca seca', descripcion:'Sensación de sequedad en la cavidad bucal', gravedad:'1' },
  { nombre:'Visión borrosa', descripcion:'Dificultad para ver con claridad a cualquier distancia', gravedad:'3' },
  { nombre:'Zumbido de oídos', descripcion:'Sonido percibido en los oídos sin estímulo externo', gravedad:'2' },
  { nombre:'Dolor lumbar', descripcion:'Molestia en la zona inferior de la espalda', gravedad:'3' },
  { nombre:'Calambres', descripcion:'Contracciones musculares involuntarias y dolorosas', gravedad:'2' },
  { nombre:'Frecuencia urinaria', descripcion:'Necesidad de orinar más veces de lo normal', gravedad:'2' },
  { nombre:'Incontinencia urinaria', descripcion:'Pérdida involuntaria de orina', gravedad:'3' },
  { nombre:'Debilidad generalizada', descripcion:'Sensación de falta de fuerza en todo el cuerpo', gravedad:'3' },
  { nombre:'Inflamación de ganglios', descripcion:'Aumento del tamaño de los ganglios linfáticos', gravedad:'3' },
  { nombre:'Temblores', descripcion:'Movimientos involuntarios y rítmicos de las extremidades', gravedad:'3' },
  { nombre:'Dificultad para concentrarse', descripcion:'Incapacidad para mantener la atención en una tarea', gravedad:'2' },
  { nombre:'Cambios de humor', descripcion:'Variaciones repentinas del estado de ánimo', gravedad:'2' },
  { nombre:'Pérdida del olfato', descripcion:'Disminución o ausencia de la capacidad de oler', gravedad:'2' },
  { nombre:'Pérdida del gusto', descripcion:'Disminución o ausencia del sentido del gusto', gravedad:'2' },
  { nombre:'Dolor mandibular', descripcion:'Molestia en la articulación o huesos de la mandíbula', gravedad:'2' },
  { nombre:'Salivación excesiva', descripcion:'Producción de más saliva de lo normal', gravedad:'1' },
  { nombre:'Ronquera', descripcion:'Voz ronca o cambiada por irritación de cuerdas vocales', gravedad:'2' },
  { nombre:'Dolor ocular', descripcion:'Molestia o presión dentro o alrededor del ojo', gravedad:'3' },
  { nombre:'Molestia al tragar', descripcion:'Dificultad o dolor al deglutir alimentos o líquidos', gravedad:'3' },
  { nombre:'Piernas inquietas', descripcion:'Sensación incómoda que provoca deseos de mover las piernas', gravedad:'1' },
];

const MOTIVO_DESCS = [
  'Dolor de cabeza persistente desde hace varios días',
  'Fiebre alta con escalofríos y malestar general',
  'Tos seca continua por más de una semana',
  'Dolor abdominal intenso después de las comidas',
  'Náuseas y vómitos desde la mañana',
  'Dificultad para respirar durante el ejercicio',
  'Dolor en el pecho al inhalar profundamente',
  'Mareos frecuentes al levantarse de la cama',
  'Dolor lumbar que se irradia a la pierna derecha',
  'Sangrado nasal recurrente sin causa aparente',
  'Hinchazón en ambas piernas desde hace una semana',
  'Erupciones en la piel con picazón intensa',
  'Pérdida de peso inexplicable en el último mes',
  'Aumento de peso rápido sin cambios en la dieta',
  'Insomnio crónico por más de tres semanas',
  'Ansiedad y nerviosismo constante en el trabajo',
  'Palpitaciones del corazón en reposo',
  'Dificultad para orinar con dolor al final',
  'Dolor en las articulaciones de las manos',
  'Hormigueo persistente en las manos y pies',
  'Falta de aire al subir escaleras',
  'Opresión en el pecho que irradia al brazo izquierdo',
  'Vómitos con presencia de sangre',
  'Diarrea persistente por más de tres días',
  'Estreñimiento de larga duración',
  'Comezón generalizada por todo el cuerpo',
  'Sequedad excesiva en los ojos',
  'Dolor de garganta con dificultad para tragar',
  'Oído derecho tapado con zumbidos constantes',
  'Dolor intenso en la zona renal',
  'Visión borrosa en el ojo izquierdo',
  'Inflamación del rostro y párpados',
  'Temblores involuntarios en las manos',
  'Dolor en el estómago que empeora en ayunas',
  'Fiebre prolongada de más de una semana',
  'Tos con expectoración verdosa',
  'Dolor en el cuello que limita el movimiento',
  'Sudoración nocturna excesiva con pérdida de peso',
  'Cambios de humor frecuentes e intensos',
  'Dificultad para mantener la concentración',
  'Dolor en el talón al caminar',
  'Pérdida del apetito por más de dos semanas',
  'Molestia al respirar en ambientes fríos',
  'Inflamación de los ganglios del cuello',
  'Dolor en la mandíbula al masticar',
  'Secreción abundante por la nariz',
  'Picazón intensa en la zona íntima',
  'Hinchazón de las articulaciones de los pies',
  'Dolor agudo en la rodilla derecha',
  'Sensación de ahogo en las noches',
  'Calambres frecuentes en las piernas',
  'Orina con coloración oscura y olor fuerte',
  'Dolor de espalda alta entre los omóplatos',
  'Inflamación del abdomen con sensación de plenitud',
  'Dolor detrás de los ojos al moverlos',
  'Sangrado de encías al cepillarse los dientes',
  'Dolor en el pecho al toser o respirar profundo',
  'Cansancio excesivo sin realizar esfuerzo físico',
  'Dolor en las muñecas al escribir o usar el teléfono',
  'Manchas oscuras que aparecen en la piel',
  'Sensación de nudo en la garganta',
  'Hormigueo que sube por el brazo izquierdo',
  'Dolor abdominal bajo con sensación de presión',
  'Sangrado vaginal fuera del período menstrual',
  'Dolor agudo en la zona baja del abdomen',
  'Inflamación roja y dolorosa en un dedo del pie',
  'Dolor en la articulación de la cadera al caminar',
  'Fiebre baja constante por la tarde',
  'Dolor que se intensifica con la luz',
  'Sensación de cuerpo extraño en el ojo',
  'Dolor de muelas intenso con inflamación',
  'Dificultad para dormir por dolor de espalda',
  'Inapetencia con náuseas leves',
  'Dolor punzante en el costado izquierdo',
  'Tos seca que empeora al acostarse',
  'Dolor en los dedos de los pies al caminar',
  'Sensación de calor excesivo en el cuerpo',
  'Molestia urinaria con escozor',
  'Dolor en la barriga con diarrea',
  'Opresión en el cuello dificultando la deglución',
  'Hinchazón del abdomen con dificultad para respirar',
  'Dolor en los ojos que se agrava al leer',
  'Sudoración fría con mareo intenso',
  'Sensación de desmayo al estar de pie',
];

const OBSERVACIONES = [
  'Paciente refiere que los síntomas empeoran por la noche',
  'Sin mejoría con medicamentos recetados previamente',
  'Presenta cuadro desde hace aproximadamente una semana',
  'Requiere evaluación urgente por severidad de síntomas',
  'Paciente con antecedentes familiares de la enfermedad',
  'Se recomiendan exámenes de laboratorio complementarios',
  'Paciente refiere alivio parcial con tratamiento actual',
  'Se indica reposo relativo y seguimiento en una semana',
  'Historial de enfermedad similar hace seis meses',
  'Paciente niega tratamiento previo para esta condición',
  'Se programa consulta de especialista para seguimiento',
  'Paciente presenta factores de riesgo que requieren evaluación',
  'Se observa empeoramiento del cuadro clínico',
  'Paciente manifiesta mejoría desde la última consulta',
  'Se solicitan estudios imagenológicos para descartar patología',
  'Condiciones laborales pueden estar contribuyendo al cuadro',
  'Se inicia tratamiento farmacológico y se controla en 15 días',
  'Paciente refiere estrés laboral como factor desencadenante',
  'Se valora internación por estado del paciente',
  'Paciente estable, se mantiene plan terapéutico actual',
  'Se descartan causas infecciosas con estudios realizados',
  'Paciente con tratamiento previo que requiere ajuste',
  'Se recomienda cambio de hábitos alimenticios',
  'Se indica dieta especial y control en una semana',
  'Paciente refiere efectos adversos del medicamento indicado',
  'Evolución favorable con el tratamiento indicado',
  'Se solicita interconsulta con otro especialista',
  'Paciente con cuadro agudo que requiere manejo inmediato',
  'Se documentan signos vitales dentro de parámetros normales',
  'Se programa control periódico cada tres meses',
];

const TRATAMIENTOS = [
  'Ibuprofeno 400mg cada 8 horas por 7 días',
  'Losartán 50mg diario en ayunas',
  'Metformina 850mg dos veces al día con alimentos',
  'Amoxicilina 500mg cada 8 horas por 10 días',
  'Paracetamol 500mg cada 6 horas según necesidad',
  'Omeprazol 20mg en ayunas por 14 días',
  'Salbutamol inhalado cada 6 horas según necesidad',
  'Loratadina 10mg diario por 5 días',
  'Naproxeno 250mg cada 12 horas por 5 días',
  'Fluoxetina 20mg diario por la mañana',
  'Enalapril 10mg diario',
  'Atorvastatina 20mg nocte por 3 meses',
  'Dexametasona 4mg cada 24 horas por 5 días',
  'Metoprolol 50mg cada 12 horas',
  'Diclofenaco 75mg cada 12 horas por 7 días',
  'Ranitidina 150mg cada 12 horas por 14 días',
  'Prednisona 10mg diario con reducción gradual',
  'Azitromicina 500mg diario por 3 días',
  'Ciprofloxacino 500mg cada 12 horas por 7 días',
  'Insulina NPH según esquema de dosificación',
  'Hidroclorotiazida 25mg diario',
  'Sertralina 50mg diario por la mañana',
  'Tramadol 50mg cada 8 horas por 5 días',
  'Doxiciclina 100mg cada 12 horas por 14 días',
  'Amlodipino 5mg diario',
  'Albendazol 400mg dosis única',
  'Pantoprazol 40mg diario en ayunas',
  'Montelukast 10mg nocte por 30 días',
  'Warfarina según INR controlado',
  'Furosemida 40mg diario',
];

// ===== 1. COMUNIDADES (30) =====
const comunidades = GEO.map((g, i) => ({
  pk_num_comunidad: i + 1,
  nombre_comunidad: g.ciudad,
  estado: g.estado,
  municipio: g.municipio,
  parroquia: g.parroquia,
}));

// ===== 2. ESPECIALIDADES (15) =====
const especialidades = ESPECIALIDADES.map((e, i) => ({
  pk_num_especialidad: i + 1,
  nombre: e.nombre,
  descripcion: e.descripcion,
}));

// ===== 3. MÉDICOS (50) =====
const medicos = [];
for (let i = 0; i < 50; i++) {
  const male = Math.random() < 0.55;
  const nombre = pick(male ? MALE_NAMES : FEMALE_NAMES);
  const a1 = pick(LAST_NAMES);
  const a2 = pick(LAST_NAMES);
  const pref = pick(['0412','0414','0416','0424','0426']);
  medicos.push({
    pk_num_medico_ministerio_salud: 10001 + i,
    fk_cm_a001_num_especialidad: (i % 15) + 1,
    nombre,
    apellido: `${a1} ${a2}`,
    telefono: `${pref}-${rand(1000000, 9999999)}`,
    carga_paciente: rand(0, 25),
  });
}

// ===== 4. PACIENTES (500) =====
const pacientes = [];
const usedCI = new Set();
for (let i = 0; i < 500; i++) {
  const male = Math.random() < 0.48;
  const nombre = pick(male ? MALE_NAMES : FEMALE_NAMES);
  const a1 = pick(LAST_NAMES);
  const a2 = pick(LAST_NAMES);
  let ci;
  do { ci = String(rand(10000000, 32999999)); } while (usedCI.has(ci));
  usedCI.add(ci);

  let y, m;
  const r = Math.random();
  if (r < 0.10) { y = rand(2014, 2026); m = rand(1, 12); }
  else if (r < 0.16) { y = rand(2008, 2013); m = rand(1, 12); }
  else if (r < 0.86) { y = rand(1967, 2007); m = rand(1, 12); }
  else { y = rand(1940, 1966); m = rand(1, 12); }
  const maxD = daysInMonth(y, m);
  const d = rand(1, maxD);

  const pref = pick(['0412','0414','0416','0424','0426']);
  pacientes.push({
    pk_num_paciente: i + 1,
    fk_ps_a001_num_comunidad: rand(1, 30),
    ci,
    nombres: nombre,
    apellidos: `${a1} ${a2}`,
    fecha_nacimiento: fmtDate(y, m, d),
    sexo: male ? 'masculino' : 'femenino',
    direccion: `Calle ${rand(1, 50)} #${rand(1, 30)}-${rand(1, 20)}`,
    telefono: `${pref}-${rand(1000000, 9999999)}`,
    nacionalidad: Math.random() < 0.92 ? 'venezolano' : 'extranjero',
    estado_paciente: Math.random() < 0.90 ? 'activo' : 'encamado',
    estado_civil: pick(['soltero','casado','divorciado','viudo']),
  });
}

// ===== 5. ENFERMEDADES (30) =====
const enfermedades = ENFERMEDADES.map((e, i) => ({
  pk_num_enfermedad: i + 1,
  nombre: e.nombre,
  enfermedad_cronica: e.cronica,
  descripcion: e.descripcion,
}));

// ===== 6. SÍNTOMAS (50) =====
const sintomas = SINTOMAS.map((s, i) => ({
  pk_num_sintoma: i + 1,
  nombre: s.nombre,
  descripcion: s.descripcion,
  gravedad: s.gravedad,
}));

// ===== 7. SESIONES MÉDICAS (200) =====
const sesiones = [];
const sessionsByDay = {};
const allDays = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'];

for (let doc = 0; doc < 50; doc++) {
  const docId = 10001 + doc;
  const days = shuffle(allDays).slice(0, 4);
  for (const day of days) {
    const turno = pick(['mañana','tarde','noche']);
    let sh, eh;
    if (turno === 'mañana') { sh = rand(7, 8); eh = rand(11, 12); }
    else if (turno === 'tarde') { sh = rand(13, 14); eh = rand(17, 18); }
    else { sh = rand(18, 19); eh = rand(22, 23); }

    const sid = sesiones.length + 1;
    const sess = {
      pk_num_sesion_medica: sid,
      fk_cm_b001_num_medico_ministerio_salud: docId,
      turno,
      dias_semana: day,
      hora_inicio: timeStr(sh, 0, 0),
      hora_fin: timeStr(eh, 0, 0),
    };
    sesiones.push(sess);
    if (!sessionsByDay[day]) sessionsByDay[day] = [];
    sessionsByDay[day].push(sess);
  }
}

// ===== 8. MOTIVOS DE CONSULTA (800) =====
const motivos = [];
for (let i = 0; i < 800; i++) {
  let fecha;
  const mr = Math.random();
  if (mr < 0.125) fecha = randDate(2026, 5);
  else if (mr < 0.4375) fecha = randDate(2026, 6);
  else fecha = randDate(2026, 7);

  const ur = Math.random();
  motivos.push({
    pk_num_motivo_consulta: i + 1,
    fk_ps_b001_num_paciente: rand(1, 500),
    descripcion_motivo: pick(MOTIVO_DESCS),
    nivel_urgencia: ur < 0.4 ? 'baja' : ur < 0.8 ? 'media' : 'alta',
    fecha_motivo: dateToStr(fecha),
    observacion_motivo: pick(OBSERVACIONES),
  });
}

// ===== 9. CITAS MÉDICAS (600) =====
const citas = [];
const usedMotivos = new Set();

function genCitas(dateGen, count) {
  for (let i = 0; i < count; i++) {
    const fecha = dateGen();
    const dayName = getDayName(fecha);
    const avail = sessionsByDay[dayName];
    if (!avail || avail.length === 0) continue;
    const sess = pick(avail);
    const sH = parseInt(sess.hora_inicio.split(':')[0]);
    const eH = parseInt(sess.hora_fin.split(':')[0]);
    const h = rand(sH, eH - 1);
    const min = pick([0, 15, 30, 45]);

    let mid;
    do { mid = rand(1, 800); } while (usedMotivos.has(mid));
    usedMotivos.add(mid);

    const tr = Math.random();
    const tipo = tr < 0.5 ? 'primera vez' : tr < 0.8 ? 'control' : 'emergencia';
    const er = Math.random();
    const estado = er < 0.2 ? 'agendada' : er < 0.8 ? 'atendida' : 'cancelada';

    citas.push({
      fk_ps_b001_num_paciente: rand(1, 500),
      fk_cm_b005_num_sesion: sess.pk_num_sesion_medica,
      fk_cm_b004_num_motivo_consulta: mid,
      estado_cita: estado,
      fecha: dateToStr(fecha),
      hora: timeStr(h, min, 0),
      tipo_cita: tipo,
      estado_caso: Math.random() < 0.5 ? 'nuevo' : 'sucesivo',
      remitido: Math.random() < 0.15,
    });
  }
}

// ~30 today (July 14, 2026 - Tuesday)
genCitas(() => new Date(2026, 6, 14), 30);
// ~100 rest of July
genCitas(() => {
  const d = Math.random() < 13 / 30 ? rand(1, 13) : rand(15, 31);
  return new Date(2026, 6, d);
}, 100);
// ~150 June
genCitas(() => randDate(2026, 6), 150);
// ~150 May
genCitas(() => randDate(2026, 5), 150);
// ~170 Jan-Apr
genCitas(() => {
  const m = rand(1, 4);
  return new Date(2026, m - 1, rand(1, daysInMonth(2026, m)));
}, 170);

// Assign sequential PKs
citas.forEach((c, i) => { c.pk_num_cita_medica = i + 1; });

// ===== 10. DIAGNÓSTICOS DE ENFERMEDAD (300) =====
const atendidas = citas.filter(c => c.estado_cita === 'atendida');
const selectedCitas = shuffle(atendidas).slice(0, 300);

const diagnosticos = selectedCitas.map((cit, i) => {
  const etR = Math.random();
  return {
    pk_num_diagnostico: i + 1,
    fk_ps_b001_num_paciente: cit.fk_ps_b001_num_paciente,
    fk_cm_a002_num_enfermedad: rand(1, 30),
    fk_cm_b002_num_cita_medica: cit.pk_num_cita_medica,
    critico: Math.random() < 0.15,
    tratamiento: pick(TRATAMIENTOS),
    etapa: etR < 0.3 ? 'leve' : etR < 0.8 ? 'inicial' : 'avanzada',
    fecha_diagnostico: cit.fecha,
  };
});

// ===== 11. BLOQUEOS DE AGENDA (50) =====
const RAZONES = ['vacaciones','permiso','reposo','cirugia','capacitacion','congreso','bloqueo_manual','mantenimiento','rotacion'];
const bloqueos = [];
for (let i = 0; i < 50; i++) {
  const fIni = randDate(2026, rand(1, 8));
  const fFin = new Date(fIni.getTime() + rand(1, 15) * 86400000);
  const hasSess = Math.random() < 0.80;
  bloqueos.push({
    pk_num_bloqueo_agenda: i + 1,
    fk_cm_b001_num_medico_ministerio_salud: 10001 + rand(0, 49),
    fk_cm_b005_num_sesion: hasSess ? pick(sesiones).pk_num_sesion_medica : null,
    fecha_inicio: dateToStr(fIni),
    fecha_fin: dateToStr(fFin),
    razon_bloqueo: pick(RAZONES),
    motivo_bloqueo: pick([
      'Vacaciones programadas por el médico',
      'Permiso personal aprobado por la dirección',
      'Reposo médico por cirugía menor',
      'Capacitación en medicina interna',
      'Asistencia a congreso de especialidad',
      'Bloqueo manual por mantenimiento de agenda',
      'Rotación a otra sede temporal',
      'Cirugía programada que requiere recuperación',
      'Ausencia por razones familiares',
      'Compromiso académico en universidad',
      'Licencia por maternidad/paternidad',
      'Reposo post-operatorio de corta duración',
    ]),
  });
}

// ===== 12. DIAGNÓSTICO-SÍNTOMA (600) =====
const diagSintomas = [];
const usedDiagSint = new Set();
for (const diag of diagnosticos) {
  const s1 = rand(1, 50);
  let s2;
  do { s2 = rand(1, 50); } while (s2 === s1);
  const key1 = `${s1}-${diag.pk_num_diagnostico}`;
  const key2 = `${s2}-${diag.pk_num_diagnostico}`;
  diagSintomas.push({ fk_cm_a003_num_sintoma: s1, fk_cm_b003_num_diagnostico: diag.pk_num_diagnostico });
  diagSintomas.push({ fk_cm_a003_num_sintoma: s2, fk_cm_b003_num_diagnostico: diag.pk_num_diagnostico });
}

// ===== 13. MOTIVO-SÍNTOMA (500) =====
const motivoSintomas = [];
const usedMS = new Set();
while (motivoSintomas.length < 500) {
  const mid = rand(1, 800);
  const sid = rand(1, 50);
  const key = `${mid}-${sid}`;
  if (!usedMS.has(key)) {
    usedMS.add(key);
    motivoSintomas.push({ fk_cm_b004_num_motivo_consulta: mid, fk_cm_a003_num_sintoma: sid });
  }
}

// ===== BUILD OUTPUT =====
const data = {
  createdAt: '2026-07-14T00:00:00.000Z',
  version: '1',
  entities: {
    ps_a001_comunidad: comunidades,
    cm_a001_especialidad: especialidades,
    cm_b001_medico: medicos,
    ps_b001_paciente: pacientes,
    cm_a002_enfermedad: enfermedades,
    cm_a003_sintoma: sintomas,
    cm_b005_sesion_medica: sesiones,
    cm_b004_motivo_consulta: motivos,
    cm_b002_cita_medica: citas,
    cm_b003_diagnostico_enfermedad: diagnosticos,
    cm_b006_bloqueo_agenda: bloqueos,
    cm_c001_diagnostico_sintoma: diagSintomas,
    cm_c002_motivo_sintoma: motivoSintomas,
  }
};

fs.writeFileSync('test-data.json', JSON.stringify(data, null, 2));

console.log('\n=== Generation Complete ===');
for (const [table, rows] of Object.entries(data.entities)) {
  console.log(`${table}: ${rows.length} records`);
}

// Verify today's citas
const todayCitas = citas.filter(c => c.fecha === '2026-07-14');
console.log(`\nCitas on 2026-07-14 (today): ${todayCitas.length}`);

// Verify session-cita compatibility
let sessionMismatches = 0;
for (const cit of citas) {
  const sess = sesiones.find(s => s.pk_num_sesion_medica === cit.fk_cm_b005_num_sesion);
  if (sess) {
    const citDay = getDayName(new Date(cit.fecha));
    if (citDay !== sess.dias_semana) sessionMismatches++;
  }
}
console.log(`Session day-of-week mismatches: ${sessionMismatches}`);

// Delete script
fs.unlinkSync(__filename);
console.log('Script deleted.');
