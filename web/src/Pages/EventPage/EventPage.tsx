import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

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

            {data.linkEntradas && (
  <div className="mb-6">
    <a
      href={data.linkEntradas}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex
        items-center
        gap-2
        bg-violet-600
        hover:bg-violet-700
        text-white
        px-5
        py-3
        rounded-xl
        transition
      "
    >
      🎟 Comprar entradas / Más información
    </a>
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
