'use client'

import { useCallback, useRef } from 'react'

import Image from 'next/image'

import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { File } from '@/app/(manager)/gerenciador/domain/File'

interface Props {
  images: File[]
}

export function ItemSlider(props: Props) {
  const { images } = props

  const sliderRef = useRef<SwiperRef>(null)

  const { handlePrev, handleNext } = {
    handlePrev: useCallback(() => {
      sliderRef.current?.swiper.slidePrev()
    }, []),
    handleNext: useCallback(() => {
      sliderRef.current?.swiper.slideNext()
    }, []),
  }

  return (
    <div className="relative w-fit">
      <Swiper
        className="size-24 rounded border border-neutral-200 bg-neutral-100"
        ref={sliderRef}
        modules={[Navigation]}
      >
        {images.map((image) => {
          return (
            <SwiperSlide className="relative" key={image.url}>
              <Image
                fill
                alt="Imagem do produto"
                className="object-contain"
                src={image.url}
              />
            </SwiperSlide>
          )
        })}
      </Swiper>

      <button
        type="button"
        className="prev-arrow absolute bottom-1 left-1 z-50 rounded-full bg-neutral-300 p-0.5 text-sm text-neutral-700"
        onClick={handlePrev}
      >
        <LuChevronLeft />
      </button>

      <button
        type="button"
        className="next-arrow absolute bottom-1 right-1 z-50 rounded-full bg-neutral-300 p-0.5 text-sm text-neutral-700"
        onClick={handleNext}
      >
        <LuChevronRight />
      </button>
    </div>
  )
}
