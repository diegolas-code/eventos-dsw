import { useState } from "react";

import MainLayout from "../../Components/layout/MainLayout";
import { createEvent } from "../../services/eventService";
export default function CreateEventPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [iniciaEn, setIniciaEn] = useState("");
  const [lugar, setLugar] = useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

 const handleSubmit = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    formData.append("titulo", titulo);
    formData.append(
      "descripcion",
      descripcion
    );

    formData.append(
      "iniciaEn",
      new Date(iniciaEn).toISOString()
    );

    formData.append("lugar", lugar);

    if (image) {
      formData.append("image", image);
    }

    await createEvent(formData);

    alert("Evento creado");
  } catch (error) {
    console.error(error);

    alert("Error al crear evento");
  }
};
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">
            Crear Evento
          </h1>

          <p className="text-zinc-600">
            Compartí actividades,
            recitales, muestras y eventos
            de la ciudad.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            bg-white
            rounded-3xl
            shadow-sm
            p-8
            space-y-6
          "
        >
          <div>
            <label className="block mb-2 font-medium">
              Título
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) =>
                setTitulo(e.target.value)
              }
              placeholder="Nombre del evento"
              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Descripción
            </label>

            <textarea
              rows={5}
              value={descripcion}
              onChange={(e) =>
                setDescripcion(
                  e.target.value
                )
              }
              placeholder="Descripción del evento"
              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Fecha y hora
            </label>

            <input
              type="datetime-local"
              value={iniciaEn}
              onChange={(e) =>
                setIniciaEn(
                  e.target.value
                )
              }
              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Lugar
            </label>

            <input
              type="text"
              value={lugar}
              onChange={(e) =>
                setLugar(e.target.value)
              }
              placeholder="Ej: Teatro Colón"
              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Poster del evento
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="
                w-full
                border
                rounded-xl
                p-3
              "
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="
                  mt-4
                  rounded-xl
                  w-full
                  h-72
                  object-cover
                "
              />
            )}
          </div>

          <button
            type="submit"
            className="
              bg-violet-600
              hover:bg-violet-700
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
            "
          >
            Crear Evento
          </button>
        </form>
      </div>
    </MainLayout>
  );
}