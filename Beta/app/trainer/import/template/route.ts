import * as XLSX from "xlsx";

export async function GET() {
  const wb = XLSX.utils.book_new();

  const exercisesData = [
    { Nombre: "Press banca", Descripcion: "Empuje horizontal con barra", Foco: "Pecho", Imagen: "", Video: "" },
    { Nombre: "Sentadilla", Descripcion: "", Foco: "Piernas", Imagen: "", Video: "" },
  ];
  const wsExercises = XLSX.utils.json_to_sheet(exercisesData);
  XLSX.utils.book_append_sheet(wb, wsExercises, "Ejercicios");

  const routinesData = [
    { Rutina: "Push", Objetivo: "Hipertrofia", Duracion: 45, Ejercicio: "Press banca", Series: 4, Reps: 10, Tiempo: "", Descanso: 90 },
    { Rutina: "Push", Objetivo: "Hipertrofia", Duracion: 45, Ejercicio: "Press militar", Series: 3, Reps: 12, Tiempo: "", Descanso: 60 },
  ];
  const wsRoutines = XLSX.utils.json_to_sheet(routinesData);
  XLSX.utils.book_append_sheet(wb, wsRoutines, "Rutinas");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="plantilla_import.xlsx"',
    },
  });
}
