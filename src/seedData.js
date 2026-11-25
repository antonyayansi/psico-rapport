/**
 * Datos de acompañamiento para demos / entornos con pocos terapeutas.
 * No mencionan que son de prueba.
 */

export const SEED_THERAPISTS = [
  {
    id: 'seed-lucia-vargas',
    displayName: 'Dra. Lucía Vargas Quispe',
    title: 'Psicóloga clínica',
    email: 'lucia.vargas@psicorapport.pe',
    licenseNumber: 'CPP-48291',
    mainSpecialty: 'Ansiedad y regulación emocional',
    subspecialty: 'Adultos jóvenes',
    focusAreas: ['Ansiedad', 'Ataques de pánico', 'Autocuidado', 'Estrés cotidiano'],
    experience: [
      { period: '2019 – actual', role: 'Psicóloga clínica', institution: 'Centro Integra Salud Mental, Lima' },
      { period: '2016 – 2019', role: 'Psicóloga', institution: 'Consultorio particular, Miraflores' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UNMSM', year: '2015' },
      { degree: 'Maestría en Psicología Clínica', institution: 'PUCP', year: '2018' }
    ],
    certifications: ['Terapia cognitivo-conductual', 'Mindfulness clínico'],
    bio: 'Acompaño a personas que viven con ansiedad y estrés. Trabajo con pasos claros, sin juzgar, para que recuperes calma en tu día a día.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-marco-salazar',
    displayName: 'Ps. Marco Salazar Ríos',
    title: 'Psicólogo clínico',
    email: 'marco.salazar@psicorapport.pe',
    licenseNumber: 'CPP-51902',
    mainSpecialty: 'Depresión y estado de ánimo',
    subspecialty: 'Adultos',
    focusAreas: ['Depresión', 'Desmotivación', 'Autoestima', 'Rutinas de cuidado'],
    experience: [
      { period: '2018 – actual', role: 'Psicólogo clínico', institution: 'Clínica San Borja Salud Mental' },
      { period: '2014 – 2018', role: 'Psicólogo', institution: 'ONG Bienestar Perú' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'Universidad de Lima', year: '2013' },
      { degree: 'Especialización en depresión', institution: 'Universidad de Chile', year: '2017' }
    ],
    certifications: ['Activación conductual', 'Terapia interpersonal'],
    bio: 'Ayudo a quienes sienten que el ánimo se apagó. Juntos armamos ritmos pequeños que vuelven a dar sentido al día.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-camila-torres',
    displayName: 'Dra. Camila Torres Mendoza',
    title: 'Psicóloga de pareja y familia',
    email: 'camila.torres@psicorapport.pe',
    licenseNumber: 'CPP-44718',
    mainSpecialty: 'Terapia de pareja y familia',
    subspecialty: 'Comunicación y conflictos',
    focusAreas: ['Pareja', 'Familia', 'Límites', 'Comunicación'],
    experience: [
      { period: '2020 – actual', role: 'Terapeuta familiar', institution: 'Espacio Vínculo, Surco' },
      { period: '2015 – 2020', role: 'Psicóloga', institution: 'Centro de Orientación Familiar Lima' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UPCH', year: '2014' },
      { degree: 'Maestría en Terapia Familiar', institution: 'Universidad de Navarra', year: '2019' }
    ],
    certifications: ['Terapia sistémica', 'Gottman Method Nivel 1'],
    bio: 'Trabajo con parejas y familias que quieren hablarse mejor y bajar el conflicto sin perder el cariño.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-diego-huaman',
    displayName: 'Ps. Diego Huamán Flores',
    title: 'Psicólogo laboral y organizacional',
    email: 'diego.huaman@psicorapport.pe',
    licenseNumber: 'CPP-56134',
    mainSpecialty: 'Estrés laboral y burnout',
    subspecialty: 'Ambientes de trabajo',
    focusAreas: ['Burnout', 'Límites laborales', 'Agotamiento', 'Equilibrio vida-trabajo'],
    experience: [
      { period: '2017 – actual', role: 'Psicólogo organizacional', institution: 'Consultora Talento Humano PE' },
      { period: '2013 – 2017', role: 'Psicólogo de bienestar', institution: 'Empresa de servicios, Lima' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'USMP', year: '2012' },
      { degree: 'Diplomado en Psicología Organizacional', institution: 'ESAN', year: '2016' }
    ],
    certifications: ['Prevención de burnout', 'Coaching de bienestar'],
    bio: 'Si el trabajo te está vaciando, te ayudo a ordenar prioridades, límites y formas de recuperar energía sin culpas.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-elena-paredes',
    displayName: 'Dra. Elena Paredes Castillo',
    title: 'Psicóloga infantil y adolescente',
    email: 'elena.paredes@psicorapport.pe',
    licenseNumber: 'CPP-39821',
    mainSpecialty: 'Psicología adolescente',
    subspecialty: 'Identidad, ansiedad escolar y redes',
    focusAreas: ['Adolescentes', 'Autoestima', 'Presión social', 'Familia y límites'],
    experience: [
      { period: '2016 – actual', role: 'Psicóloga', institution: 'Centro Infantojuvenil Alma, San Isidro' },
      { period: '2012 – 2016', role: 'Psicóloga escolar', institution: 'Colegio privado, Lima' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'PUCP', year: '2011' },
      { degree: 'Especialización en psicología adolescente', institution: 'Universidad de Buenos Aires', year: '2015' }
    ],
    certifications: ['Terapia cognitivo-conductual adolescente', 'Mindfulness para jóvenes'],
    bio: 'Acompaño a adolescentes y a sus familias en etapas de cambio, presión escolar y búsqueda de identidad.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-andres-quiroga',
    displayName: 'Ps. Andrés Quiroga León',
    title: 'Psicólogo clínico',
    email: 'andres.quiroga@psicorapport.pe',
    licenseNumber: 'CPP-60447',
    mainSpecialty: 'Trauma y duelo',
    subspecialty: 'Procesamiento emocional',
    focusAreas: ['Duelo', 'Trauma', 'Pérdidas', 'Seguridad emocional'],
    experience: [
      { period: '2019 – actual', role: 'Psicólogo clínico', institution: 'Clínica de Trauma y Duelo Lima' },
      { period: '2015 – 2019', role: 'Psicólogo', institution: 'Hospital público, área de salud mental' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UNFV', year: '2014' },
      { degree: 'Formación en EMDR', institution: 'Asociación EMDR Perú', year: '2020' }
    ],
    certifications: ['EMDR', 'Acompañamiento en duelo'],
    bio: 'Ofrezco un espacio seguro para elaborar pérdidas, miedos y experiencias difíciles a tu ritmo.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-valeria-chavez',
    displayName: 'Dra. Valeria Chávez Ortiz',
    title: 'Psicóloga clínica',
    email: 'valeria.chavez@psicorapport.pe',
    licenseNumber: 'CPP-42109',
    mainSpecialty: 'Sueño y hábitos de descanso',
    subspecialty: 'Insomnio y ansiedad nocturna',
    focusAreas: ['Insomnio', 'Rutinas de sueño', 'Ansiedad nocturna', 'Higiene del sueño'],
    experience: [
      { period: '2018 – actual', role: 'Psicóloga', institution: 'Centro de Sueño y Bienestar, Jesús María' },
      { period: '2014 – 2018', role: 'Psicóloga clínica', institution: 'Consultorio particular' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'Universidad de Piura', year: '2013' },
      { degree: 'Diplomado en trastornos del sueño', institution: 'UPCH', year: '2017' }
    ],
    certifications: ['Terapia cognitivo-conductual para insomnio (CBT-I)'],
    bio: 'Ayudo a recuperar el descanso cuando la mente no apaga. Trabajamos hábitos y calma nocturna con pasos concretos.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-renato-mejia',
    displayName: 'Ps. Renato Mejía Delgado',
    title: 'Psicólogo clínico',
    email: 'renato.mejia@psicorapport.pe',
    licenseNumber: 'CPP-55380',
    mainSpecialty: 'Adicciones y conductas impulsivas',
    subspecialty: 'Adultos jóvenes',
    focusAreas: ['Adicciones', 'Impulsividad', 'Recaídas', 'Motivación al cambio'],
    experience: [
      { period: '2017 – actual', role: 'Psicólogo', institution: 'Programa de Adicciones Lima Norte' },
      { period: '2013 – 2017', role: 'Psicólogo', institution: 'Centro de rehabilitación ambulatoria' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UNMSM', year: '2012' },
      { degree: 'Especialización en adicciones', institution: 'CEDRO / formación clínica', year: '2016' }
    ],
    certifications: ['Entrevista motivacional', 'Prevención de recaídas'],
    bio: 'Acompaño procesos de cambio cuando una costumbre o consumo ya no te deja vivir como quieres.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-sofia-ramirez',
    displayName: 'Dra. Sofía Ramírez Aguilar',
    title: 'Psicóloga clínica',
    email: 'sofia.ramirez@psicorapport.pe',
    licenseNumber: 'CPP-47655',
    mainSpecialty: 'Autoestima e imagen corporal',
    subspecialty: 'Adultos y jóvenes',
    focusAreas: ['Autoestima', 'Imagen corporal', 'Perfeccionismo', 'Autocompasión'],
    experience: [
      { period: '2019 – actual', role: 'Psicóloga clínica', institution: 'Espacio Sereno, Barranco' },
      { period: '2015 – 2019', role: 'Psicóloga', institution: 'Consultorio particular, Lima' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'PUCP', year: '2014' },
      { degree: 'Maestría en Psicología de la Salud', institution: 'Universidad de Barcelona', year: '2018' }
    ],
    certifications: ['Terapia centrada en la compasión', 'TCC'],
    bio: 'Trabajo contigo para soltar la crítica interna y construir una relación más amable contigo misma o contigo mismo.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-javier-oropeza',
    displayName: 'Ps. Javier Oropeza Vidal',
    title: 'Neuropsicólogo clínico',
    email: 'javier.oropeza@psicorapport.pe',
    licenseNumber: 'CPP-58812',
    mainSpecialty: 'Neuropsicología y atención',
    subspecialty: 'TDAH adulto y funciones ejecutivas',
    focusAreas: ['TDAH adulto', 'Atención', 'Organización', 'Memoria de trabajo'],
    experience: [
      { period: '2018 – actual', role: 'Neuropsicólogo', institution: 'Centro Cognitivo Lima' },
      { period: '2014 – 2018', role: 'Evaluador neuropsicológico', institution: 'Clínica neurológica, Lima' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UPCH', year: '2013' },
      { degree: 'Maestría en Neuropsicología', institution: 'Universidad Autónoma de Madrid', year: '2017' }
    ],
    certifications: ['Evaluación neuropsicológica del adulto', 'Intervención en TDAH'],
    bio: 'Si te cuesta concentrarte, organizarte o sostener hábitos, te ayudo a entender tu mente y armar estrategias que sí funcionen.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-patricia-nunez',
    displayName: 'Dra. Patricia Núñez Salas',
    title: 'Psicóloga clínica',
    email: 'patricia.nunez@psicorapport.pe',
    licenseNumber: 'CPP-61204',
    mainSpecialty: 'TOC y pensamientos repetitivos',
    subspecialty: 'Exposición y prevención de respuesta',
    focusAreas: ['TOC', 'Rituales', 'Dudas obsesivas', 'Ansiedad anticipatoria'],
    experience: [
      { period: '2019 – actual', role: 'Psicóloga clínica', institution: 'Centro de Ansiedad y TOC Lima' },
      { period: '2015 – 2019', role: 'Psicóloga', institution: 'Consultorio particular, San Isidro' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'PUCP', year: '2014' },
      { degree: 'Especialización en TOC', institution: 'Universidad de Buenos Aires', year: '2018' }
    ],
    certifications: ['TCC para TOC', 'Exposición con prevención de respuesta'],
    bio: 'Acompaño a quienes pelean con dudas, rituales o pensamientos que no se apagan. Trabajamos con claridad y respeto a tu ritmo.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-gabriel-rios',
    displayName: 'Ps. Gabriel Ríos Cárdenas',
    title: 'Psicólogo clínico',
    email: 'gabriel.rios@psicorapport.pe',
    licenseNumber: 'CPP-49877',
    mainSpecialty: 'Trastornos de la conducta alimentaria',
    subspecialty: 'Adultos jóvenes',
    focusAreas: ['Relación con la comida', 'Imagen corporal', 'Restricción', 'Compulsión alimentaria'],
    experience: [
      { period: '2018 – actual', role: 'Psicólogo', institution: 'Programa de Nutrición y Salud Mental, Lima' },
      { period: '2014 – 2018', role: 'Psicólogo clínico', institution: 'Clínica de trastornos alimentarios' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UPCH', year: '2013' },
      { degree: 'Diplomado en TCA', institution: 'Universidad de Chile', year: '2017' }
    ],
    certifications: ['Terapia cognitivo-conductual para TCA', 'Enfoque no centrado en el peso'],
    bio: 'Si la comida o el cuerpo te están robando tranquilidad, te ayudo a recuperar una relación más libre y amable contigo.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-ines-villanueva',
    displayName: 'Dra. Inés Villanueva Prado',
    title: 'Psicóloga clínica',
    email: 'ines.villanueva@psicorapport.pe',
    licenseNumber: 'CPP-53419',
    mainSpecialty: 'Identidad y diversidad LGBTIQ+',
    subspecialty: 'Acompañamiento afirmativo',
    focusAreas: ['Identidad', 'Coming out', 'Familia y aceptación', 'Ansiedad social'],
    experience: [
      { period: '2017 – actual', role: 'Psicóloga afirmativa', institution: 'Espacio Diverso, Lima' },
      { period: '2013 – 2017', role: 'Psicóloga', institution: 'ONG de derechos LGBTIQ+' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UNMSM', year: '2012' },
      { degree: 'Formación en terapia afirmativa', institution: 'WPATH / formación clínica', year: '2016' }
    ],
    certifications: ['Psicoterapia afirmativa', 'Trabajo con familias'],
    bio: 'Ofrezco un espacio seguro para explorar identidad, vínculos y el peso de no sentirte visto/a. Sin juicios.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-carla-benavides',
    displayName: 'Ps. Carla Benavides Mora',
    title: 'Psicóloga perinatal',
    email: 'carla.benavides@psicorapport.pe',
    licenseNumber: 'CPP-45702',
    mainSpecialty: 'Psicología perinatal y maternidad',
    subspecialty: 'Embarazo, posparto y crianza temprana',
    focusAreas: ['Ansiedad perinatal', 'Posparto', 'Vínculo', 'Culpa materna'],
    experience: [
      { period: '2018 – actual', role: 'Psicóloga perinatal', institution: 'Centro Madre e Hijo, Surco' },
      { period: '2014 – 2018', role: 'Psicóloga', institution: 'Consultorio de salud materno-infantil' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'Universidad de Lima', year: '2013' },
      { degree: 'Especialización en psicología perinatal', institution: 'Universidad Europea', year: '2017' }
    ],
    certifications: ['Acompañamiento perinatal', 'Depresión posparto'],
    bio: 'Acompaño el embarazo, el posparto y los primeros años cuando la carga emocional se siente demasiado grande.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-hector-alvarez',
    displayName: 'Ps. Héctor Álvarez Ponce',
    title: 'Psicólogo clínico',
    email: 'hector.alvarez@psicorapport.pe',
    licenseNumber: 'CPP-58133',
    mainSpecialty: 'Manejo de la ira y impulsividad',
    subspecialty: 'Adultos',
    focusAreas: ['Ira', 'Explosiones', 'Conflictos', 'Regulación emocional'],
    experience: [
      { period: '2016 – actual', role: 'Psicólogo clínico', institution: 'Programa de Regulación Emocional Lima' },
      { period: '2012 – 2016', role: 'Psicólogo', institution: 'Centro de mediación y conflictos' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'USMP', year: '2011' },
      { degree: 'Diplomado en manejo de la ira', institution: 'PUCP', year: '2015' }
    ],
    certifications: ['TCC para ira', 'Habilidades de regulación'],
    bio: 'Si la rabia te gana o te asusta perder el control, trabajamos formas más claras de sentirla sin destruir lo que importa.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-monica-ferrer',
    displayName: 'Dra. Mónica Ferrer Dávila',
    title: 'Psicóloga clínica',
    email: 'monica.ferrer@psicorapport.pe',
    licenseNumber: 'CPP-43958',
    mainSpecialty: 'Fobias y miedos específicos',
    subspecialty: 'Exposición gradual',
    focusAreas: ['Fobia social', 'Miedos específicos', 'Evitación', 'Confianza'],
    experience: [
      { period: '2017 – actual', role: 'Psicóloga clínica', institution: 'Instituto de Ansiedad Lima' },
      { period: '2013 – 2017', role: 'Psicóloga', institution: 'Consultorio particular, La Molina' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'PUCP', year: '2012' },
      { degree: 'Maestría en Psicología Clínica', institution: 'Universidad de los Andes', year: '2016' }
    ],
    certifications: ['Exposición gradual', 'TCC para fobias'],
    bio: 'Ayudo a recuperar terreno cuando el miedo achica tu vida: paso a paso, sin forzar ni minimizar lo que sientes.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-raul-espinoza',
    displayName: 'Ps. Raúl Espinoza Tello',
    title: 'Psicólogo gerontológico',
    email: 'raul.espinoza@psicorapport.pe',
    licenseNumber: 'CPP-36741',
    mainSpecialty: 'Adultos mayores y envejecimiento',
    subspecialty: 'Soledad, memoria y adaptación',
    focusAreas: ['Soledad', 'Cambios de rol', 'Duelo por salud', 'Familia cuidadora'],
    experience: [
      { period: '2015 – actual', role: 'Psicólogo', institution: 'Centro del Adulto Mayor Lima Este' },
      { period: '2010 – 2015', role: 'Psicólogo', institution: 'Residencia y programas comunitarios' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UNFV', year: '2009' },
      { degree: 'Diplomado en psicogerontología', institution: 'UPCH', year: '2014' }
    ],
    certifications: ['Psicogerontología', 'Apoyo a cuidadores'],
    bio: 'Acompaño etapas de cambio en la vejez: salud, familia, soledad y el deseo de seguir sintiéndose útil y acompañado.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-alejandra-cruz',
    displayName: 'Dra. Alejandra Cruz Bellido',
    title: 'Psicóloga clínica',
    email: 'alejandra.cruz@psicorapport.pe',
    licenseNumber: 'CPP-55290',
    mainSpecialty: 'Terapia sexual e intimidad',
    subspecialty: 'Parejas y adultos',
    focusAreas: ['Intimidad', 'Deseo', 'Comunicación sexual', 'Vergüenza'],
    experience: [
      { period: '2018 – actual', role: 'Sexóloga clínica', institution: 'Consultorio Íntimo, Miraflores' },
      { period: '2014 – 2018', role: 'Psicóloga', institution: 'Centro de pareja y sexualidad' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'Universidad de Lima', year: '2013' },
      { degree: 'Especialización en sexología clínica', institution: 'Instituto de Sexología', year: '2017' }
    ],
    certifications: ['Sexología clínica', 'Terapia de pareja'],
    bio: 'Espacio confidencial para hablar de deseo, intimidad y vergüenza sin tabúes, con respeto y claridad.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-bruno-castillo',
    displayName: 'Ps. Bruno Castillo Reyes',
    title: 'Psicólogo del deporte',
    email: 'bruno.castillo@psicorapport.pe',
    licenseNumber: 'CPP-60128',
    mainSpecialty: 'Psicología del deporte y rendimiento',
    subspecialty: 'Presión competitiva y motivación',
    focusAreas: ['Rendimiento', 'Ansiedad precompetitiva', 'Motivación', 'Lesiones y retorno'],
    experience: [
      { period: '2017 – actual', role: 'Psicólogo deportivo', institution: 'Federaciones y clubes amateur, Lima' },
      { period: '2013 – 2017', role: 'Psicólogo', institution: 'Academia deportiva juvenil' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'USMP', year: '2012' },
      { degree: 'Maestría en Psicología del Deporte', institution: 'Universidad Autónoma de Madrid', year: '2016' }
    ],
    certifications: ['Psicología del deporte', 'Mindfulness en rendimiento'],
    bio: 'Trabajo con deportistas y personas de alto rendimiento que sienten que la presión les quita el disfrute o la confianza.',
    photoURL: null,
    approved: true
  },
  {
    id: 'seed-daniela-poma',
    displayName: 'Dra. Daniela Poma Quispe',
    title: 'Psicóloga clínica',
    email: 'daniela.poma@psicorapport.pe',
    licenseNumber: 'CPP-57463',
    mainSpecialty: 'Violencia y recuperación emocional',
    subspecialty: 'Acompañamiento post-violencia',
    focusAreas: ['Violencia familiar', 'Seguridad emocional', 'Límites', 'Reconstrucción de confianza'],
    experience: [
      { period: '2016 – actual', role: 'Psicóloga', institution: 'Centro de atención a víctimas, Lima' },
      { period: '2012 – 2016', role: 'Psicóloga', institution: 'Programa comunitario de prevención' }
    ],
    education: [
      { degree: 'Lic. Psicología', institution: 'UNMSM', year: '2011' },
      { degree: 'Especialización en violencia y trauma', institution: 'PUCP', year: '2015' }
    ],
    certifications: ['Intervención en violencia', 'Primeros auxilios psicológicos'],
    bio: 'Acompaño a quienes vivieron violencia a recuperar seguridad, límites y una voz propia, sin prisa y sin juicio.',
    photoURL: null,
    approved: true
  }
]

export const SEED_COMMUNITY_POSTS = [
  {
    id: 'seed-post-lucia-ansiedad',
    content:
      'Cuando la ansiedad sube, prueba esto en 2 minutos: nombra 5 cosas que ves, 4 que puedes tocar, 3 que escuchas, 2 que hueles y 1 que saboreas. No “arregla” todo, pero baja un poco el volumen del cuerpo para que puedas decidir el siguiente paso con más calma.',
    authorId: 'seed-lucia-vargas',
    authorName: 'Lucía',
    authorPhotoUrl: null,
    isTherapistPost: true,
    likedBy: [],
    comments: [],
    minutesAgo: 45
  },
  {
    id: 'seed-post-marco-animo',
    content:
      'Si hoy sientes que no tienes energía para nada, elige una sola acción pequeña: abrir la cortina, tomar agua o dar 5 minutos de caminata. En depresión, lo pequeño no es poco; es un puente. Si puedes, anótalo: te ayuda a ver que sí hubo movimiento.',
    authorId: 'seed-marco-salazar',
    authorName: 'Marco',
    authorPhotoUrl: null,
    isTherapistPost: true,
    likedBy: [],
    comments: [],
    minutesAgo: 140
  },
  {
    id: 'seed-post-diego-burnout',
    content:
      'Señal de burnout: llegar a casa y sentir que no te queda nada para ti. Una frontera útil: define una hora de cierre digital (aunque sea 30 minutos) y protégela como una cita. Recuperar energía empieza por dejar de estar “disponible” todo el tiempo.',
    authorId: 'seed-diego-huaman',
    authorName: 'Diego',
    authorPhotoUrl: null,
    isTherapistPost: true,
    likedBy: [],
    comments: [],
    minutesAgo: 260
  },
  {
    id: 'seed-post-valeria-sueno',
    content:
      'Si no puedes dormir porque la mente sigue activa, escribe en 2 líneas “para mañana” y deja el papel fuera de la cama. Luego baja la luz y evita pantallas. Si pasados 20 minutos sigues despierto, levántate un rato en silencio y vuelve. Forzar el sueño suele empeorarlo.',
    authorId: 'seed-valeria-chavez',
    authorName: 'Valeria',
    authorPhotoUrl: null,
    isTherapistPost: true,
    likedBy: [],
    comments: [],
    minutesAgo: 400
  },
  {
    id: 'seed-post-sofia-autoestima',
    content:
      'La voz crítica interna no se calla a gritos. Prueba responderle como le hablarías a un amigo: “Hoy fue difícil y aún así estoy aquí”. Autocompasión no es resignación; es un suelo más estable para hacer cambios sin castigarte.',
    authorId: 'seed-sofia-ramirez',
    authorName: 'Sofía',
    authorPhotoUrl: null,
    isTherapistPost: true,
    likedBy: [],
    comments: [],
    minutesAgo: 520
  },
  {
    id: 'seed-post-andres-duelo',
    content:
      'Cuando algo duele mucho, no tienes que “superarlo” esta semana. Puedes empezar por nombrarlo: qué perdiste, qué cambió, qué echas de menos. El duelo pide compañía y ritmo propio. Si te abruma, busca un espacio seguro para hablarlo, aquí o con alguien de confianza.',
    authorId: 'seed-andres-quiroga',
    authorName: 'Andrés',
    authorPhotoUrl: null,
    isTherapistPost: true,
    likedBy: [],
    comments: [],
    minutesAgo: 680
  }
]

export function getSeedTherapist(id) {
  return SEED_THERAPISTS.find((t) => t.id === id) || null
}

/** Une terapeutas de Firestore con el catálogo seed sin duplicar ids. */
export function mergeSeedTherapists(loaded = []) {
  const byId = new Map()
  for (const t of SEED_THERAPISTS) byId.set(t.id, { ...t })
  for (const t of loaded) {
    if (t?.id) byId.set(t.id, t)
  }
  return Array.from(byId.values())
}

/** Une posts del foro con posts de terapeutas seed. */
export function mergeSeedCommunityPosts(loaded = []) {
  const byId = new Map()
  const now = Date.now()
  for (const p of SEED_COMMUNITY_POSTS) {
    const date = new Date(now - (p.minutesAgo || 60) * 60 * 1000)
    byId.set(p.id, {
      id: p.id,
      content: p.content,
      imageUrl: null,
      authorId: p.authorId,
      authorName: p.authorName,
      authorPhotoUrl: p.authorPhotoUrl,
      isTherapistPost: true,
      likedBy: p.likedBy || [],
      comments: p.comments || [],
      time: date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      _sort: date.getTime()
    })
  }
  for (const p of loaded) {
    if (!p?.id) continue
    byId.set(p.id, { ...p, _sort: p.timestamp?.toDate?.()?.getTime?.() || p._sort || 0 })
  }
  return Array.from(byId.values()).sort((a, b) => (b._sort || 0) - (a._sort || 0))
}
