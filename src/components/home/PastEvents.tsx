import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Image as ImageIcon,
  Users,
  X,
  ChevronDown,
} from "lucide-react";
import { usePastEvents } from "../../hooks/usePastEvents";
import { useEventGallery } from "../../hooks/useEventGallery";
import { SectionTitle } from "../ui/SectionTitle";
import { EventLineup } from "../events/EventLineup";
import { ScrollableSection } from "../ui/ScrollableSection";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { getTemporaryLinks } from "../../services/dropboxService";
import { ImageUrl } from "../../types/image";

const PastEvents = () => {
  const { events, isLoading: eventsLoading, error } = usePastEvents();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedEventTitle, setSelectedEventTitle] = useState<string | null>(
    null
  );
  const [galleryImages, setGalleryImages] = useState<ImageUrl[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);

  const {
    isLoading: galleryLoading,
    hasMore,
    loadMore,
  } = useEventGallery({
    eventTitle: selectedEventTitle || "",
    imagesPerPage: 10,
  });

  const handleGalleryOpen = async (event: { title: string }) => {
    setIsLoadingGallery(true);
    try {
      const path = `/MANTRA/${event.title}`;
      const images = await getTemporaryLinks(path);
      setGalleryImages(images);
      setSelectedEventTitle(event.title);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleLineupOpen = (eventId: string) => {
    setSelectedEvent(eventId);

    setTimeout(() => {
      const modalElement = document.querySelector('[role="dialog"]');
      if (modalElement) {
        const headerHeight = 80;
        const windowHeight = window.innerHeight;
        const modalHeight = modalElement.getBoundingClientRect().height;

        const scrollPosition = Math.max(
          window.scrollY + headerHeight,
          window.scrollY + (windowHeight - modalHeight) / 2
        );

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  if (eventsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
      </div>
    );
  }

  if (error) return null;

  return (
    <div className="container mx-auto px-4 pt-2">
      <SectionTitle title="Eventos Pasados" />
      <ScrollableSection className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-gradient-to-br from-mantra-blue/40 to-black/60 rounded-xl overflow-hidden flex flex-col h-full"
            >
              {/* Imagen principal del evento */}
              <div className="aspect-video relative overflow-hidden">
                <LazyLoadImage
                  src={event.imageUrl || "/default-event.jpg"}
                  alt={event.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  effect="blur"
                  threshold={100}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
              </div>

              {/* Contenido del evento */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {event.title}
                </h3>

                {/* Espaciador flexible */}
                <div className="flex-1"></div>

                {/* Información y botones (fijados abajo) */}
                <div className="mt-auto">
                  <div className="space-y-3 text-gray-300 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-mantra-gold" />
                      <span>
                        {new Date(event.date).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleLineupOpen(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold rounded-lg transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Line-up
                    </button>

                    <button
                      onClick={() => handleGalleryOpen(event)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold cursor-pointer`}
                    >
                      <ImageIcon className="w-5 h-5" />
                      Galería
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollableSection>

      {/* Modal de Galería */}
      <AnimatePresence>
        {selectedEventTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Fondo con gradiente */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-radial from-mantra-gold/20 via-black/95 to-black">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,166,87,0.15),rgba(15,26,36,0.95)_50%,rgba(0,0,0,1)_100%)]" />
              </div>
            </div>

            {/* Contenido del modal */}
            <div
              className="relative max-w-7xl w-full bg-mantra-blue/30 rounded-xl backdrop-blur-sm flex flex-col max-h-[90vh] border border-mantra-gold/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header fijo */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-mantra-gold/10 bg-mantra-blue/30 backdrop-blur-md rounded-t-xl">
                <h3 className="text-xl font-bold text-white">
                  Galería de Fotos
                </h3>
                <button
                  onClick={() => setSelectedEventTitle(null)}
                  className="text-white/70 hover:text-mantra-gold transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido scrolleable con estilo personalizado */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {isLoadingGallery ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mantra-gold"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((image, index) => (
                      <div
                        key={`${image.originalPath}-${index}`}
                        className="relative group aspect-square"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <LazyLoadImage
                          src={image.thumbnail || "/placeholder.jpg"}
                          alt="Evento"
                          className="w-full h-full object-cover rounded-lg"
                          effect="blur"
                          threshold={100}
                          loading="lazy"
                          draggable="false"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <span className="text-white text-sm">
                            Vista previa
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer fijo con botón de cargar más */}
              {hasMore && (
                <div className="sticky bottom-0 p-6 border-t border-mantra-gold/10 bg-mantra-blue/30 backdrop-blur-md rounded-b-xl">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      loadMore();
                    }}
                    className="w-full py-3 px-6 bg-mantra-gold/10 hover:bg-mantra-gold/20 text-mantra-gold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {galleryLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-mantra-gold" />
                    ) : (
                      <>
                        <span>Cargar más imágenes</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Line-up */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative max-w-7xl w-full bg-gradient-to-b from-mantra-warmBlack to-black rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header fijo */}
              <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-mantra-gold/10 bg-mantra-darkBlue rounded-t-xl">
                <h3 className="text-xl font-bold text-white">
                  Line-up del Evento
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="flex-1 overflow-y-auto p-6">
                <EventLineup eventId={selectedEvent} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PastEvents;
