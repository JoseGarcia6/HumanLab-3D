"use client";

import { useEffect, useMemo, useState } from "react";

type LibraryTerm = {
  id: string;
  name: string;
  category: "Anatomía" | "Fisiología" | "Enfermedad";
  system: string;
  definition: string;
  location: string;
  related: string[];
  tags: string[];
  exploreId?: string;
};

type Question = {
  topic: "Anatomía" | "Fisiología" | "Enfermedades";
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  exploreId?: string;
};

const terms: LibraryTerm[] = [
  { id: "heart", name: "Corazón", category: "Anatomía", system: "Cardiovascular", definition: "Órgano muscular que impulsa la sangre a través de la circulación pulmonar y sistémica.", location: "En el tórax, entre los pulmones y detrás del esternón.", related: ["Aurículas", "Ventrículos", "Válvulas cardíacas", "Grandes vasos"], tags: ["bombeo", "sangre", "circulación"], exploreId: "heart" },
  { id: "lungs", name: "Pulmones", category: "Anatomía", system: "Respiratorio", definition: "Órganos donde se realiza el intercambio de oxígeno y dióxido de carbono entre el aire y la sangre.", location: "En la cavidad torácica, a ambos lados del mediastino.", related: ["Alvéolos", "Bronquios", "Tráquea", "Diafragma"], tags: ["respiración", "oxígeno", "gases"], exploreId: "lungs" },
  { id: "brain", name: "Encéfalo", category: "Anatomía", system: "Nervioso", definition: "Conjunto de estructuras del sistema nervioso central alojadas dentro del cráneo.", location: "En la cavidad craneal, protegido por el cráneo y las meninges.", related: ["Cerebro", "Cerebelo", "Tronco encefálico", "Médula espinal"], tags: ["cerebro", "control", "nervios"], exploreId: "brain" },
  { id: "skull", name: "Cráneo", category: "Anatomía", system: "Esquelético", definition: "Conjunto de huesos que protege el encéfalo y da soporte a estructuras de la cara.", location: "En la cabeza.", related: ["Encéfalo", "Mandíbula", "Columna cervical"], tags: ["huesos", "cabeza", "protección"], exploreId: "skull" },
  { id: "spine", name: "Columna vertebral", category: "Anatomía", system: "Esquelético", definition: "Estructura formada por vértebras que sostiene el tronco y protege la médula espinal.", location: "Desde el cuello hasta la pelvis, en la parte posterior del tronco.", related: ["Vértebras", "Médula espinal", "Costillas", "Pelvis"], tags: ["espalda", "vértebras", "soporte"], exploreId: "spine" },
  { id: "ribs", name: "Costillas", category: "Anatomía", system: "Esquelético", definition: "Huesos curvos que forman parte de la caja torácica y ayudan a proteger órganos del tórax.", location: "En el tórax, articuladas principalmente con las vértebras torácicas.", related: ["Esternón", "Columna vertebral", "Pulmones", "Corazón"], tags: ["tórax", "huesos", "protección"], exploreId: "ribs" },
  { id: "biceps", name: "Bíceps braquial", category: "Anatomía", system: "Muscular", definition: "Músculo del brazo que contribuye a flexionar el codo y supinar el antebrazo.", location: "En la región anterior del brazo.", related: ["Escápula", "Radio", "Articulación del codo"], tags: ["músculo", "brazo", "movimiento"], exploreId: "biceps" },
  { id: "liver", name: "Hígado", category: "Anatomía", system: "Digestivo", definition: "Órgano que procesa nutrientes, produce bilis y participa en el metabolismo de numerosas sustancias.", location: "En la parte superior derecha del abdomen, debajo del diafragma.", related: ["Vesícula biliar", "Estómago", "Intestino", "Vasos sanguíneos"], tags: ["bilis", "metabolismo", "digestión"], exploreId: "liver" },
  { id: "kidneys", name: "Riñones", category: "Anatomía", system: "Urinario", definition: "Órganos que filtran la sangre, producen orina y contribuyen al equilibrio de líquidos y electrolitos.", location: "En la parte posterior del abdomen, a ambos lados de la columna.", related: ["Uréteres", "Vejiga", "Vasos renales"], tags: ["orina", "filtración", "líquidos"], exploreId: "kidneys" },
  { id: "alveoli", name: "Alvéolos pulmonares", category: "Anatomía", system: "Respiratorio", definition: "Pequeños sacos de paredes delgadas donde el oxígeno y el dióxido de carbono se intercambian entre aire y sangre.", location: "En las regiones terminales de los pulmones.", related: ["Bronquiolos", "Capilares", "Pulmones"], tags: ["gases", "oxígeno", "respiración"], exploreId: "lungs" },
  { id: "circulation", name: "Circulación sanguínea", category: "Fisiología", system: "Cardiovascular", definition: "Movimiento de la sangre impulsado por el corazón a través de los vasos sanguíneos.", location: "Por todo el organismo, mediante la circulación pulmonar y sistémica.", related: ["Corazón", "Arterias", "Capilares", "Venas"], tags: ["sangre", "oxígeno", "transporte"], exploreId: "heart" },
  { id: "gas-exchange", name: "Intercambio gaseoso", category: "Fisiología", system: "Respiratorio", definition: "Proceso por el que el oxígeno pasa del aire alveolar a la sangre y el dióxido de carbono pasa de la sangre a los alvéolos.", location: "Principalmente en la membrana alveolocapilar de los pulmones.", related: ["Alvéolos", "Capilares", "Hemoglobina"], tags: ["oxígeno", "dióxido de carbono", "respiración"], exploreId: "lungs" },
  { id: "digestion", name: "Digestión", category: "Fisiología", system: "Digestivo", definition: "Procesos mecánicos y químicos que descomponen los alimentos en sustancias que el organismo puede absorber.", location: "A lo largo del tubo digestivo, con participación de órganos accesorios.", related: ["Estómago", "Intestino delgado", "Hígado", "Páncreas"], tags: ["alimentos", "nutrientes", "absorción"], exploreId: "stomach" },
  { id: "homeostasis", name: "Homeostasis", category: "Fisiología", system: "General", definition: "Capacidad del organismo para mantener relativamente estables sus condiciones internas pese a cambios del entorno.", location: "Es resultado de la coordinación de múltiples órganos y sistemas.", related: ["Sistema nervioso", "Sistema endocrino", "Riñones"], tags: ["equilibrio", "regulación", "temperatura"], exploreId: "brain" },
  { id: "hypertension", name: "Hipertensión arterial", category: "Enfermedad", system: "Cardiovascular", definition: "Condición en la que la presión arterial se mantiene elevada; su evaluación requiere mediciones adecuadas y valoración profesional.", location: "Afecta al sistema circulatorio y puede aumentar el riesgo cardiovascular.", related: ["Presión arterial", "Corazón", "Arterias", "Riñones"], tags: ["presión", "circulación", "riesgo cardiovascular"], exploreId: "heart" },
  { id: "asthma", name: "Asma", category: "Enfermedad", system: "Respiratorio", definition: "Enfermedad crónica en la que las vías respiratorias pueden inflamarse y estrecharse, causando episodios de dificultad respiratoria.", location: "Afecta principalmente a las vías respiratorias de los pulmones.", related: ["Bronquios", "Inflamación", "Respiración"], tags: ["vías respiratorias", "inflamación", "respirar"], exploreId: "lungs" },
  { id: "diabetes", name: "Diabetes mellitus", category: "Enfermedad", system: "Endocrino y metabólico", definition: "Grupo de enfermedades caracterizadas por niveles elevados de glucosa en la sangre debido a problemas relacionados con la insulina.", location: "Involucra la regulación de la glucosa y funciones del páncreas y otros tejidos.", related: ["Insulina", "Páncreas", "Glucosa", "Metabolismo"], tags: ["glucosa", "insulina", "metabolismo"] },
  { id: "osteoporosis", name: "Osteoporosis", category: "Enfermedad", system: "Esquelético", definition: "Enfermedad caracterizada por disminución de la resistencia ósea y mayor riesgo de fracturas.", location: "Puede afectar distintos huesos del esqueleto.", related: ["Huesos", "Densidad mineral ósea", "Fracturas"], tags: ["huesos", "fracturas", "densidad ósea"], exploreId: "skeleton" },
];

const questions: Question[] = [
  { topic: "Anatomía", question: "¿Qué estructura impulsa la sangre por la circulación?", options: ["El corazón", "El hígado", "La vejiga"], answer: 0, explanation: "El corazón se contrae para impulsar la sangre hacia la circulación pulmonar y sistémica.", exploreId: "heart" },
  { topic: "Anatomía", question: "¿Qué estructura protege principalmente al encéfalo?", options: ["Las costillas", "El cráneo", "La pelvis"], answer: 1, explanation: "Los huesos del cráneo rodean y protegen el encéfalo.", exploreId: "skull" },
  { topic: "Anatomía", question: "¿Dónde se encuentran los alvéolos pulmonares?", options: ["En los pulmones", "En el estómago", "En los riñones"], answer: 0, explanation: "Los alvéolos están en las regiones terminales del árbol respiratorio.", exploreId: "lungs" },
  { topic: "Anatomía", question: "¿Cuál es una función de la columna vertebral?", options: ["Producir bilis", "Filtrar la sangre", "Proteger la médula espinal"], answer: 2, explanation: "La columna vertebral sostiene el tronco y protege la médula espinal.", exploreId: "spine" },
  { topic: "Anatomía", question: "¿Qué órgano produce bilis?", options: ["El hígado", "El corazón", "La vejiga"], answer: 0, explanation: "El hígado produce bilis; la vesícula biliar la almacena y concentra.", exploreId: "liver" },
  { topic: "Anatomía", question: "¿Qué órganos filtran la sangre para producir orina?", options: ["Pulmones", "Riñones", "Intestinos"], answer: 1, explanation: "Los riñones filtran la sangre y participan en el equilibrio de agua y electrolitos.", exploreId: "kidneys" },
  { topic: "Anatomía", question: "¿Qué músculo contribuye a flexionar el codo?", options: ["Bíceps braquial", "Diafragma", "Cuádriceps"], answer: 0, explanation: "El bíceps braquial participa en la flexión del codo y en la supinación del antebrazo.", exploreId: "biceps" },
  { topic: "Fisiología", question: "¿Dónde ocurre principalmente el intercambio de oxígeno y dióxido de carbono?", options: ["En los alvéolos", "En la tráquea", "En la laringe"], answer: 0, explanation: "Los gases se intercambian a través de la membrana alveolocapilar.", exploreId: "lungs" },
  { topic: "Fisiología", question: "¿Cuál es una función principal de los glóbulos rojos?", options: ["Producir bilis", "Transportar oxígeno", "Almacenar orina"], answer: 1, explanation: "La hemoglobina de los glóbulos rojos transporta la mayor parte del oxígeno en la sangre." },
  { topic: "Fisiología", question: "¿Qué describe mejor la homeostasis?", options: ["La digestión de proteínas", "El movimiento de una articulación", "El mantenimiento del equilibrio interno"], answer: 2, explanation: "La homeostasis ayuda a mantener condiciones internas relativamente estables." },
  { topic: "Fisiología", question: "¿Dónde se absorbe la mayor parte de los nutrientes de los alimentos?", options: ["En el intestino delgado", "En el esófago", "En la tráquea"], answer: 0, explanation: "El intestino delgado es el principal sitio de absorción de nutrientes.", exploreId: "stomach" },
  { topic: "Fisiología", question: "¿Qué vasos llevan la sangre desde el corazón hacia los tejidos?", options: ["Venas", "Arterias", "Uréteres"], answer: 1, explanation: "Las arterias transportan sangre desde el corazón; su oxigenación depende del circuito." },
  { topic: "Enfermedades", question: "¿Qué sistema se ve directamente implicado en el asma?", options: ["Respiratorio", "Esquelético", "Digestivo"], answer: 0, explanation: "El asma afecta las vías respiratorias y puede causar inflamación y estrechamiento bronquial.", exploreId: "lungs" },
  { topic: "Enfermedades", question: "¿Qué sustancia sanguínea suele estar elevada en la diabetes mellitus?", options: ["Calcio", "Glucosa", "Bilis"], answer: 1, explanation: "La diabetes mellitus se caracteriza por niveles elevados de glucosa en sangre." },
  { topic: "Enfermedades", question: "¿Qué tejido se ve afectado principalmente por la osteoporosis?", options: ["Tejido óseo", "Tejido pulmonar", "Tejido hepático"], answer: 0, explanation: "La osteoporosis reduce la resistencia ósea y aumenta el riesgo de fracturas.", exploreId: "skeleton" },
  { topic: "Enfermedades", question: "¿Qué se debe hacer para confirmar si una persona tiene hipertensión?", options: ["Usar solo una sensación subjetiva", "Consultar mediciones adecuadas y valoración profesional", "Observar el color de los ojos"], answer: 1, explanation: "La presión arterial debe medirse correctamente y evaluarse según criterios clínicos; este contenido es educativo.", exploreId: "heart" },
  { topic: "Anatomía", question: "¿Qué estructura separa el tórax del abdomen y participa en la respiración?", options: ["Diafragma", "Esternón", "Pelvis"], answer: 0, explanation: "El diafragma es un músculo principal de la inspiración y separa las cavidades torácica y abdominal." },
  { topic: "Anatomía", question: "¿Qué vasos sanguíneos devuelven la sangre hacia el corazón?", options: ["Arterias", "Venas", "Bronquios"], answer: 1, explanation: "Las venas conducen la sangre desde los tejidos hacia el corazón; su oxigenación depende del circuito." , exploreId: "veins" },
  { topic: "Anatomía", question: "¿Qué estructura conecta la boca con el estómago?", options: ["Tráquea", "Esófago", "Uréter"], answer: 1, explanation: "El esófago transporta el alimento desde la faringe hasta el estómago.", exploreId: "stomach" },
  { topic: "Anatomía", question: "¿Qué parte del sistema nervioso central está dentro del conducto vertebral?", options: ["Médula espinal", "Nervio ciático", "Retina"], answer: 0, explanation: "La médula espinal recorre el conducto vertebral y transmite señales entre encéfalo y cuerpo.", exploreId: "spinalcord" },
  { topic: "Fisiología", question: "¿Qué función cumple principalmente la hemoglobina?", options: ["Transportar oxígeno en la sangre", "Producir enzimas digestivas", "Filtrar la orina"], answer: 0, explanation: "La hemoglobina de los glóbulos rojos se une al oxígeno y facilita su transporte." },
  { topic: "Fisiología", question: "¿Qué ocurre durante la inspiración tranquila?", options: ["El diafragma se contrae y desciende", "El diafragma se relaja y asciende", "Se detiene el intercambio gaseoso"], answer: 0, explanation: "Al contraerse, el diafragma desciende y aumenta el volumen torácico, favoreciendo la entrada de aire." },
  { topic: "Fisiología", question: "¿Cuál es la función principal del intestino delgado?", options: ["Bombear sangre", "Absorber la mayoría de los nutrientes", "Almacenar orina"], answer: 1, explanation: "La mayor parte de la absorción de nutrientes ocurre en el intestino delgado.", exploreId: "intestines" },
  { topic: "Fisiología", question: "¿Qué hacen las válvulas cardíacas?", options: ["Ayudan a mantener el flujo de sangre en una dirección", "Oxigenan la sangre directamente", "Producen glóbulos rojos"], answer: 0, explanation: "Las válvulas se abren y cierran según los gradientes de presión para ayudar a evitar el retroceso de la sangre.", exploreId: "heart" },
  { topic: "Enfermedades", question: "¿Qué tejido se afecta principalmente en la osteoporosis?", options: ["Óseo", "Nervioso", "Pulmonar"], answer: 0, explanation: "La osteoporosis disminuye la resistencia del tejido óseo y aumenta el riesgo de fracturas.", exploreId: "skeleton" },
  { topic: "Enfermedades", question: "¿Qué describe mejor el asma?", options: ["Una enfermedad de las vías respiratorias", "Una fractura de hueso", "Una infección exclusiva del estómago"], answer: 0, explanation: "El asma es una enfermedad de las vías respiratorias que puede causar inflamación y estrechamiento bronquial.", exploreId: "lungs" },
];

const categories = ["Todos", "Anatomía", "Fisiología", "Enfermedad"] as const;

export function LearningLibrary({ onExplore }: { onExplore: (id: string) => void }) {
  const [section, setSection] = useState<"dictionary" | "practice">("dictionary");
  const [termQuery, setTermQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Todos");
  const [questionTopic, setQuestionTopic] = useState<"Todos" | Question["topic"]>("Todos");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [reviewErrors, setReviewErrors] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("humanlab-learning-progress-v1");
      if (saved) {
        const progress = JSON.parse(saved) as { answered?: number; score?: number; wrongIds?: string[] };
        setAnswered(Number.isFinite(progress.answered) ? Math.max(0, progress.answered ?? 0) : 0);
        setScore(Number.isFinite(progress.score) ? Math.max(0, progress.score ?? 0) : 0);
        setWrongIds(Array.isArray(progress.wrongIds) ? progress.wrongIds.filter((id) => typeof id === "string") : []);
      }
    } catch {
      // El aprendizaje sigue funcionando si el navegador bloquea el almacenamiento local.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem("humanlab-learning-progress-v1", JSON.stringify({ answered, score, wrongIds }));
    } catch {
      // El progreso se mantiene durante la sesión aunque no pueda persistirse.
    }
  }, [hydrated, answered, score, wrongIds]);

  const filteredTerms = useMemo(() => {
    const q = termQuery.trim().toLocaleLowerCase("es");
    return terms.filter((term) => {
      const categoryMatch = category === "Todos" || term.category === category || (category === "Fisiología" && term.category === "Fisiología") || (category === "Enfermedad" && term.category === "Enfermedad");
      const textMatch = !q || [term.name, term.system, term.definition, term.location, ...term.related, ...term.tags].some((value) => value.toLocaleLowerCase("es").includes(q));
      return categoryMatch && textMatch;
    });
  }, [category, termQuery]);

  const visibleQuestions = useMemo(() => questions.filter((item, index) => (questionTopic === "Todos" || item.topic === questionTopic) && (!reviewErrors || wrongIds.includes(String(index))), [questionTopic, reviewErrors, wrongIds]);
  const currentQuestion = visibleQuestions[questionIndex % Math.max(visibleQuestions.length, 1)];

  function chooseAnswer(index: number) {
    if (answer !== null || !currentQuestion) return;
    setAnswer(index);
    setAnswered((value) => value + 1);
    if (index === currentQuestion.answer) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (!visibleQuestions.length) return;
    setQuestionIndex((value) => (value + 1) % visibleQuestions.length);
    setAnswer(null);
  }

  function changeTopic(value: "Todos" | Question["topic"]) {
    setQuestionTopic(value);
    setQuestionIndex(0);
    setAnswer(null);
  }

  return (
    <section className="library-card panel" id="biblioteca-aprendizaje">
      <div className="library-heading">
        <div>
          <span className="eyebrow">CENTRO DE CONOCIMIENTO</span>
          <h2>Diccionario y aprendizaje</h2>
          <p>Consultá conceptos y practicá con preguntas organizadas por tema.</p>
        </div>
        <div className="library-stats"><strong>{terms.length}</strong><span>fichas iniciales</span><strong>{questions.length}</strong><span>preguntas iniciales</span></div>
      </div>

      <div className="library-tabs" role="tablist" aria-label="Secciones de aprendizaje">
        <button type="button" role="tab" aria-selected={section === "dictionary"} className={section === "dictionary" ? "active" : ""} onClick={() => setSection("dictionary")}>📚 Diccionario</button>
        <button type="button" role="tab" aria-selected={section === "practice"} className={section === "practice" ? "active" : ""} onClick={() => setSection("practice")}>✦ Practicar preguntas</button>
      </div>

      {section === "dictionary" ? (
        <div className="dictionary-area">
          <div className="dictionary-filters">
            <label className="dictionary-search"><span aria-hidden="true">⌕</span><input value={termQuery} onChange={(event) => setTermQuery(event.target.value)} placeholder="Buscar órgano, función, proceso o enfermedad…" aria-label="Buscar en el diccionario" /><button type="button" onClick={() => setTermQuery("")} aria-label="Limpiar búsqueda">×</button></label>
            <div className="category-filters" aria-label="Filtrar diccionario">{categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item === "Enfermedad" ? "Enfermedades" : item}</button>)}</div>
          </div>
          <p className="dictionary-result-count">{filteredTerms.length} de {terms.length} conceptos · contenido educativo inicial, ampliable.</p>
          <div className="dictionary-grid">
            {filteredTerms.map((term) => (
              <article className="dictionary-entry" key={term.id}>
                <div className="dictionary-entry-top"><span className={"entry-category " + term.category.toLowerCase().replace("í", "i")}>{term.category}</span><span className="entry-system">{term.system}</span></div>
                <h3>{term.name}</h3>
                <p>{term.definition}</p>
                <div className="entry-detail"><strong>Ubicación / contexto</strong><span>{term.location}</span></div>
                <div className="entry-related"><strong>Relacionado con</strong><div>{term.related.map((item) => <span key={item}>{item}</span>)}</div></div>
                <div className="entry-references"><strong>Fuentes para ampliar</strong><a href="https://openstax.org/details/books/anatomy-and-physiology-2e" target="_blank" rel="noreferrer">OpenStax · Anatomía y fisiología</a><a href="https://medlineplus.gov/encyclopedia.html" target="_blank" rel="noreferrer">MedlinePlus · Enciclopedia médica</a></div>
                {term.exploreId && <button className="entry-explore" type="button" onClick={() => onExplore(term.exploreId!)}>Ver en el atlas ↗</button>}
              </article>
            ))}
            {filteredTerms.length === 0 && <div className="dictionary-empty"><strong>No encontramos coincidencias.</strong><p>Probá con otro término, sistema o función.</p></div>}
          </div>
          <p className="library-disclaimer">Las referencias son recursos de consulta general para ampliar el estudio; no sustituyen la revisión de cada tema por docentes o profesionales. El contenido sobre enfermedades es educativo y no constituye diagnóstico ni tratamiento.</p>
        </div>
      ) : (
        <div className="practice-area">
          <div className="practice-toolbar">
            <label>Área de estudio<select value={questionTopic} onChange={(event) => changeTopic(event.target.value as "Todos" | Question["topic"])}><option value="Todos">Todas las áreas</option><option value="Anatomía">Anatomía</option><option value="Fisiología">Fisiología</option><option value="Enfermedades">Enfermedades</option></select></label>
            <div className="practice-score"><span>Respondidas</span><strong>{answered}</strong><span>Aciertos</span><strong>{score}</strong><span>Por repasar</span><strong>{wrongIds.length}</strong></div>
          </div>
          <div className="practice-extra-actions"><button type="button" className={reviewErrors ? "active" : ""} onClick={() => { setReviewErrors((value) => !value); setQuestionIndex(0); setAnswer(null); }}>{reviewErrors ? "Ver todas las preguntas" : "Repasar respuestas incorrectas"} ({wrongIds.length})</button><button type="button" onClick={() => { if (window.confirm("¿Querés borrar el progreso guardado en este navegador?")) { setAnswered(0); setScore(0); setWrongIds([]); setReviewErrors(false); setQuestionIndex(0); setAnswer(null); } }}>Reiniciar progreso</button></div>
          {reviewErrors && wrongIds.length === 0 && <p className="review-empty">¡No hay respuestas incorrectas pendientes! Respondé preguntas para construir tu repaso personalizado.</p>}
          {currentQuestion && <div className="question-box">
            <div className="question-meta"><span>{currentQuestion.topic}</span><span>Pregunta {(questionIndex % visibleQuestions.length) + 1} de {visibleQuestions.length}</span></div>
            <h3>{currentQuestion.question}</h3>
            <div className="question-options">{currentQuestion.options.map((option, index) => <button type="button" key={option} disabled={answer !== null} className={answer === null ? "" : index === currentQuestion.answer ? "correct" : answer === index ? "incorrect" : ""} onClick={() => chooseAnswer(index)}>{option}</button>)}</div>
            {answer !== null && <div className={"question-feedback " + (answer === currentQuestion.answer ? "correct" : "incorrect")}><strong>{answer === currentQuestion.answer ? "¡Correcto!" : "Repasemos esta respuesta"}</strong><p>{currentQuestion.explanation}</p>{currentQuestion.exploreId && <button type="button" onClick={() => onExplore(currentQuestion.exploreId!)}>Consultar estructura en el atlas ↗</button>}</div>}
            <div className="question-actions"><button type="button" className="entry-explore" onClick={nextQuestion}>{questionIndex % visibleQuestions.length === visibleQuestions.length - 1 ? "Volver al inicio" : "Siguiente pregunta"} →</button><span>Tu puntuación de esta sesión: {answered ? Math.round((score / answered) * 100) : 0}%</span></div>
          </div>}
          <p className="library-disclaimer">Banco inicial de {questions.length} preguntas. El progreso y las respuestas por repasar se guardan en este navegador; no se envían a un servidor. La ampliación hacia 1,000 preguntas se realizará por módulos con revisión de contenido y duplicados.</p>
        </div>
      )}
    </section>
  );
}
