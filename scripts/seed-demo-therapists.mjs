/**
 * Seed: 10 terapeutas aprobados + posts de ayuda en community_posts.
 * Uso: node scripts/seed-demo-therapists.mjs
 */
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  Timestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB2KfAZV_isC0sNZA94CeMkGlKWVzB3jR4',
  authDomain: 'uwuia-9f371.firebaseapp.com',
  projectId: 'uwuia-9f371',
  storageBucket: 'uwuia-9f371.firebasestorage.app',
  messagingSenderId: '339102139400',
  appId: '1:339102139400:web:763f3ff4493fa001d4fdbd'
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const therapists = [
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
    bio: 'Acompaño a personas que viven con ansiedad y estrés. Trabajo con pasos claros, sin juzgar, para que recuperes calma en tu día a día.'
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
    bio: 'Ayudo a quienes sienten que el ánimo se apagó. Juntos armamos ritmos pequeños que vuelven a dar sentido al día.'
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
    bio: 'Trabajo con parejas y familias que quieren hablarse mejor y bajar el conflicto sin perder el cariño.'
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
    bio: 'Si el trabajo te está vaciando, te ayudo a ordenar prioridades, límites y formas de recuperar energía sin culpas.'
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
    bio: 'Acompaño a adolescentes y a sus familias en etapas de cambio, presión escolar y búsqueda de identidad.'
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
    bio: 'Ofrezco un espacio seguro para elaborar pérdidas, miedos y experiencias difíciles a tu ritmo.'
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
    bio: 'Ayudo a recuperar el descanso cuando la mente no apaga. Trabajamos hábitos y calma nocturna con pasos concretos.'
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
    bio: 'Acompaño procesos de cambio cuando una costumbre o consumo ya no te deja vivir como quieres.'
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
    bio: 'Trabajo contigo para soltar la crítica interna y construir una relación más amable contigo misma o contigo mismo.'
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
    bio: 'Si te cuesta concentrarte, organizarte o sostener hábitos, te ayudo a entender tu mente y armar estrategias que sí funcionen.'
  }
]

const helpPosts = [
  {
    therapistId: 'seed-lucia-vargas',
    authorName: 'Lucía',
    content:
      'Cuando la ansiedad sube, prueba esto en 2 minutos: nombra 5 cosas que ves, 4 que puedes tocar, 3 que escuchas, 2 que hueles y 1 que saboreas. No “arregla” todo, pero baja un poco el volumen del cuerpo para que puedas decidir el siguiente paso con más calma.'
  },
  {
    therapistId: 'seed-marco-salazar',
    authorName: 'Marco',
    content:
      'Si hoy sientes que no tienes energía para nada, elige una sola acción pequeña: abrir la cortina, tomar agua o dar 5 minutos de caminata. En depresión, lo pequeño no es poco; es un puente. Si puedes, anótalo: te ayuda a ver que sí hubo movimiento.'
  },
  {
    therapistId: 'seed-diego-huaman',
    authorName: 'Diego',
    content:
      'Señal de burnout: llegar a casa y sentir que no te queda nada para ti. Una frontera útil: define una hora de cierre digital (aunque sea 30 minutos) y protégela como una cita. Recuperar energía empieza por dejar de estar “disponible” todo el tiempo.'
  },
  {
    therapistId: 'seed-valeria-chavez',
    authorName: 'Valeria',
    content:
      'Si no puedes dormir porque la mente sigue activa, escribe en 2 líneas “para mañana” y deja el papel fuera de la cama. Luego baja la luz y evita pantallas. Si pasados 20 minutos sigues despierto, levántate un rato en silencio y vuelve. Forzar el sueño suele empeorarlo.'
  },
  {
    therapistId: 'seed-sofia-ramirez',
    authorName: 'Sofía',
    content:
      'La voz crítica interna no se calla a gritos. Prueba responderle como le hablarías a un amigo: “Hoy fue difícil y aún así estoy aquí”. Autocompasión no es resignación; es un suelo más estable para hacer cambios sin castigarte.'
  },
  {
    therapistId: 'seed-andres-quiroga',
    authorName: 'Andrés',
    content:
      'Cuando algo duele mucho, no tienes que “superarlo” esta semana. Puedes empezar por nombrarlo: qué perdiste, qué cambió, qué echas de menos. El duelo pide compañía y ritmo propio. Si te abruma, busca un espacio seguro para hablarlo, aquí o con alguien de confianza.'
  }
]

async function seed() {
  console.log('Escribiendo terapeutas…')
  for (const t of therapists) {
    const { id, ...data } = t
    await setDoc(
      doc(db, 'therapists', id),
      {
        ...data,
        photoURL: null,
        approved: true,
        approvedAt: Timestamp.now(),
        approvedBy: 'seed-script',
        seeded: true
      },
      { merge: true }
    )
    console.log('  ✓', data.displayName)
  }

  console.log('Escribiendo posts de ayuda…')
  let minutesAgo = 40
  for (const post of helpPosts) {
    const ts = Timestamp.fromDate(new Date(Date.now() - minutesAgo * 60 * 1000))
    minutesAgo += 95
    await addDoc(collection(db, 'community_posts'), {
      content: post.content,
      imageUrl: null,
      authorId: post.therapistId,
      authorName: post.authorName,
      authorPhotoUrl: null,
      isTherapistPost: true,
      likedBy: [],
      comments: [],
      timestamp: ts,
      seeded: true
    })
    console.log('  ✓ post de', post.authorName)
  }

  console.log('Listo: 10 terapeutas +', helpPosts.length, 'posts.')
}

seed().catch((err) => {
  console.error('Falló el seed:', err)
  process.exit(1)
})
