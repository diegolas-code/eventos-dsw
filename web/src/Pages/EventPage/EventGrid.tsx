import EventCard from "./EventCard";

type Event = {
  id: string;
  titulo: string;
  descripcion?: string;
  iniciaEn?: string;
};

type Props = {
  events: Event[];
};

export default function EventGrid({
  events,
}: Props) {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-6
      "
    >
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
        />
      ))}
    </div>
  );
}