import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asistirEvento, cancelarAsistencia } from '../../services/asistenciaService';
import { useEffect } from 'react';
import MainLayout from '../../Components/layout/MainLayout';
import { getEventById } from '../../services/eventService';
import CommentsSection from '../../Components/events/CommentsSection';

import { Swiper, SwiperSlide } from 'swiper/react';

import { Navigation, Pagination, Thumbs, Autoplay } from 'swiper/modules';

import { useState } from 'react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';

export default function EventPage() {
  const { id } = useParams();

  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const queryClient = useQueryClient();
  const [isAsistiendoLocal, setIsAsistiendoLocal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const asistir = useMutation({
    mutationFn: asistirEvento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos'] });
    },
    onError: () => {
      setIsAsistiendoLocal(false);
    },
  });

  const cancelar = useMutation({
    mutationFn: cancelarAsistencia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-eventos'] });
    },
    onError: () => {
      setIsAsistiendoLocal(true);
    },
  });

  useEffect(() => {
    if (data) {
      setIsAsistiendoLocal(!!data.isAsistiendo);
    }
  }, [data]);
  const handleAsistencia = () => {
    const nuevoEstado = !isAsistiendoLocal;

    setIsAsistiendoLocal(nuevoEstado);

    if (isAsistiendoLocal) {
      cancelar.mutate(data.id);
    } else {
      asistir.mutate(data.id);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <p>Cargando evento...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <p className="text-red-500">Error cargando evento</p>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <p>Evento no encontrado</p>
      </MainLayout>
    );
  }

  const esLink =
    data.linkEntradas?.startsWith('http://') ||
    data.linkEntradas?.startsWith('https://') ||
    data.linkEntradas?.startsWith('www.');

  const images = [
    ...(data.imagenUrl
      ? [
          {
            id: 'principal',
            url: data.imagenUrl,
          },
        ]
      : []),

    ...(data.imagenes || []),
  ];

  return (
    <MainLayout>
      <div
        className="
          bg-white
          rounded-3xl
          shadow-md
          overflow-hidden
        "
      >
        {images.length > 0 && (
          <div>
            <Swiper
              modules={[Navigation, Pagination, Thumbs, Autoplay]}
              navigation
              pagination={{
                clickable: true,
              }}
              autoplay={{
                delay: 10000,
              }}
              thumbs={{
                swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
              }}
              className="w-full"
            >
              {images.map((img: any) => (
                <SwiperSlide key={img.id}>
                  <img
                    src={img.url}
                    alt=""
                    className="
      w-full
     h-[220px]
sm:h-[280px]
md:h-[350px]
lg:h-[420px]
      object-cover
      rounded-2xl
    "
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {images.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                onSwiper={setThumbsSwiper}
                watchSlidesProgress
                spaceBetween={12}
                slidesPerView={4}
                breakpoints={{
                  640: {
                    slidesPerView: 5,
                  },
                  1024: {
                    slidesPerView: 6,
                  },
                }}
                className="
                  px-4
                  py-4
                  bg-zinc-100
                "
              >
                {images.map((img: any) => (
                  <SwiperSlide key={img.id}>
                    <img
                      src={img.url}
                      alt=""
                      className="
                        h-20
                        w-full
                        rounded-xl
                        object-cover
                        cursor-pointer
                      "
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        )}

        <div className="p-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.titulo}</h1>

          <div className="mb-5">
            <span
              className="
                px-4
                py-2
                bg-violet-100
                text-violet-700
                rounded-full
                text-sm
                font-semibold
              "
            >
              {data.categoria}
            </span>
          </div>

          {data.lugar && <p className="text-zinc-600 mb-2">📍 {data.lugar}</p>}

          {data.iniciaEn && (
            <p className="text-zinc-600 mb-6">📅 {new Date(data.iniciaEn).toLocaleString()}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {!localStorage.getItem('token') ? (
              <button
                disabled
                className="px-4 py-2 rounded-full text-xs font-semibold border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed opacity-75"
              >
                Iniciá sesión para asistir
              </button>
            ) : (
              <button
                onClick={handleAsistencia}
                disabled={asistir.isPending || cancelar.isPending}
                className={`
                  px-5
                  py-2
                  rounded-full
                  text-sm
                  font-medium
                  transition
                  border
                  ${
                    isAsistiendoLocal
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                      : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                  }
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                `}
              >
                {isAsistiendoLocal ? 'Cancelar asistencia' : 'Asistir'}
              </button>
            )}

            <Link
              to={`/evento/${data.id}/comprar`}
              className="inline-flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-full transition-all shadow-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                />
              </svg>
              Comprar Entradas
            </Link>
          </div>

          {data.linkEntradas && (
            <div className="mt-6 p-4 bg-violet-50 rounded-2xl">
              <h3 className="font-semibold text-lg mb-2">Información / Entradas</h3>

              {esLink ? (
                <a
                  href={
                    data.linkEntradas.startsWith('www.')
                      ? `https://${data.linkEntradas}`
                      : data.linkEntradas
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 underline font-medium"
                >
                  Comprar entradas
                </a>
              ) : (
                <p className="text-zinc-700">{data.linkEntradas}</p>
              )}
            </div>
          )}

          <div
            className="
              prose
              max-w-none
              text-zinc-700
            "
          >
            {data.descripcion}
          </div>

          <CommentsSection eventId={data.id} />
        </div>
      </div>
    </MainLayout>
  );
}
