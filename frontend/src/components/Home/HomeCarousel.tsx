import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    id: 1,
    title: "Nepal Music Festival 2024",
    description: "Experience the biggest music festival of the year with top artists from around the globe.",
    image: "https://images.unsplash.com/photo-1459749411177-712964918647?q=80&w=2070&auto=format&fit=crop",
    date: "Dec 15, 2024",
    location: "Tundikhel, Kathmandu"
  },
  {
    id: 2,
    title: "Himalayan Art Exhibition",
    description: "Discover the rich cultural heritage of the Himalayas through contemporary art.",
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop",
    date: "Jan 10, 2025",
    location: "Patan Museum, Lalitpur"
  },
  {
    id: 3,
    title: "Tech Summit Nepal",
    description: "Join the leaders of the tech industry for a day of innovation and networking.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    date: "Feb 05, 2025",
    location: "Bhrikutimandap, Kathmandu"
  }
]

const HomeCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-3xl shadow-2xl" ref={emblaRef}>
        <div className="flex">
          {SLIDES.map((slide) => (
            <div className="flex-[0_0_100%] min-w-0 relative h-[500px] md:h-[600px]" key={slide.id}>
              {/* Background Image with Gradient Overlay */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white">
                <div className="container mx-auto max-w-6xl">
                  <div className="max-w-3xl space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                    <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium text-purple-200">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4" />
                        {slide.date}
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                        <MapPin className="w-4 h-4" />
                        {slide.location}
                      </div>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                      {slide.title}
                    </h2>
                    
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl line-clamp-2">
                      {slide.description}
                    </p>

                    <div className="pt-4">
                      <Button 
                        size="lg" 
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-8 py-6 text-lg shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                        onClick={() => navigate('/events')}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-8 h-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={scrollNext}
      >
        <ChevronRight className="w-8 h-8" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 right-8 md:right-16 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-purple-500 w-8' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  )
}

export default HomeCarousel
