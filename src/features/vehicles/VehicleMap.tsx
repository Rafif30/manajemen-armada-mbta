import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

interface VehicleMapProps {
  latitude: number
  longitude: number
  label: string
}

function InvalidateSizeOnMount() {
  const map = useMap()
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 150)
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [map])
  return null
}

function RecenterOnChange({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), { animate: true })
  }, [map, latitude, longitude])
  return null
}

/** Peta Leaflet dengan satu marker di posisi kendaraan (FR-5.3). Dimuat secara lazy. */
export default function VehicleMap({ latitude, longitude, label }: VehicleMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full"
      aria-label={`Peta posisi kendaraan ${label}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>{label}</Popup>
      </Marker>
      <InvalidateSizeOnMount />
      <RecenterOnChange latitude={latitude} longitude={longitude} />
    </MapContainer>
  )
}
